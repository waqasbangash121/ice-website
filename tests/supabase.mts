import assert from "node:assert/strict";
import { randomBytes, scryptSync, createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { once } from "node:events";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { services } from "../src/data/services";
import { seedCompositions } from "../src/lib/blocks/seeds";
nextEnv.loadEnvConfig(process.cwd());
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, options);
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, options);
const scope = "qa-" + randomBytes(8).toString("hex") + "-";
const password = randomBytes(24).toString("hex");
const salt = randomBytes(16).toString("hex");
const passwordHash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
const rows = [
  { namespace: "staff", id: scope + "operator", payload: { username: "qa-editor", passwordHash }, revision: 1 },
  { namespace: "workspace", id: scope + "main", payload: seedCompositions(), revision: 1 },
  ...services.map(service => ({ namespace: "services", id: scope + service.id, payload: { draft: service, status: "draft", version: 0, owner: "", source: "QA", history: [] }, revision: 1 })),
];
const base = "http://localhost:3004";
let server: ReturnType<typeof spawn> | undefined;
let serverLogs = "";
const dev = process.env.SUPABASE_TEST_DEV === "1";

const request = (route: string, init?: RequestInit) => fetch(base + route, { redirect: "manual", ...init });
const post = (route: string, values: Record<string,string>, cookie="") => request(route, { method: "POST", headers: { origin: base, cookie, "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(values) });
try {
  const inserted = await db.from("ice_documents").insert(rows);
  assert.equal(inserted.error, null);
  const privateRead = await anon.from("ice_documents").select("id").eq("id", scope + "operator");
  assert.ok(privateRead.error || privateRead.data?.length === 0, "anonymous cannot read credentials");
  const privateWrite = await anon.from("ice_documents").insert({ namespace: "staff", id: scope + "intruder", payload: {}, revision: 1 });
  assert.ok(privateWrite.error, "anonymous cannot write credentials");
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", dev ? "dev" : "start", "--port", "3004"], { env: { ...process.env, ICE_STORAGE: "supabase", ICE_STORAGE_SCOPE: scope, ADMIN_USERNAME: "", ADMIN_PASSWORD_HASH: "" }, stdio: ["ignore", "pipe", "pipe"] });
  server.stdout!.on("data", chunk => { serverLogs += chunk.toString(); });
  server.stderr!.on("data", chunk => { serverLogs += chunk.toString(); });
  let ready = false;
  for (let i=0;i<80;i++) { if(server.exitCode !== null) throw new Error("QA server exited"); try { if ((await request("/admin/login")).ok) { ready=true; break; } } catch {} await new Promise(r=>setTimeout(r,250)); }
  assert.ok(ready, "QA server starts");
  assert.ok((await post("/api/admin/auth",{username:"qa-editor",password:"wrong"})).headers.get("location")?.includes("error=1"));
  const login = await post("/api/admin/auth",{username:"qa-editor",password});
  const cookie = login.headers.get("set-cookie")?.split(";")[0]; assert.ok(cookie);
  assert.ok((await (await request("/admin",{headers:{cookie}})).text()).includes("Ready for your attention"));
  for (const route of ["/admin", "/admin/blocks", "/admin/pages", "/admin/templates", "/admin/services", "/admin/settings"]) {
    const response = await request(route, { headers: { cookie } });
    const html = await response.text();
    assert.equal(response.status, 200, route);
    assert.ok(!/blocking-prerender|Next.js encountered uncached data/.test(html), `no uncached-data error at ${route}`);
  }
  const values = { action:"save",version:"0",name:"QA service",summary:"Private database fixture",owner:"QA",source:"Synthetic test" };
  const saves = await Promise.all([post("/api/admin/services/house-cleaning",values,cookie),post("/api/admin/services/house-cleaning",values,cookie)]);
  assert.equal(saves.filter(r=>r.headers.get("location")?.includes("saved=1")).length,1,"one concurrent writer succeeds");
  assert.ok(!(await (await request("/services")).text()).includes("Private database fixture"));
  const serviceProjection=await db.from("ice_services").select("version,name").eq("id",scope+"house-cleaning").single();
  assert.equal(serviceProjection.error,null);assert.equal(serviceProjection.data!.version,1);assert.equal(serviceProjection.data!.name,"QA service");
  const ws = await db.from("ice_documents").select("payload,revision").eq("namespace","workspace").eq("id",scope+"main").single();
  const block = ws.data!.payload.blocks["lease-faqs"];
  const edit = await post("/api/admin/composition/blocks/lease-faqs",{ action:"save",version:"0",owner:"QA",source:"Synthetic test",content:JSON.stringify({...block.draft,body:"Database composition fixture"}) },cookie);
  assert.ok(edit.headers.get("location")?.includes("saved=1"));
  const persisted = await db.from("ice_documents").select("payload").eq("namespace","workspace").eq("id",scope+"main").single();
  assert.equal(persisted.data!.payload.blocks["lease-faqs"].draft.body,"Database composition fixture");
  const blockProjection=await db.from("ice_blocks").select("draft").eq("workspace_id",scope+"main").eq("id","lease-faqs").single();
  assert.equal(blockProjection.error,null);assert.equal(blockProjection.data!.draft.body,"Database composition fixture");
  const details={serviceId:"end-of-lease-cleaning",location:"Sydney NSW 2000",property:"apartment",bedrooms:"2",bathrooms:"1",furnished:"unfurnished",condition:"standard",preferredDate:"2099-04-20",extras:[],otherDescription:"",requirements:""};
  const quote = (version:number,cookie="")=>request("/api/quote-draft",{method:"POST",headers:{origin:base,cookie,"content-type":"application/json"},body:JSON.stringify({details,version,complete:true,sourcePath:"/get-a-free-quote",entryKey:""})});
  const created=await quote(0); assert.equal(created.status,200); const quoteCookie=created.headers.get("set-cookie")!.split(";")[0];
  const concurrent=await Promise.all([quote(1,quoteCookie),quote(1,quoteCookie)]); assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
  const token=quoteCookie.slice(quoteCookie.indexOf("=")+1); const id=scope+createHash("sha256").update(token).digest("hex");
  const stored=await db.from("ice_documents").select("payload").eq("namespace","quotes").eq("id",id).single();
  const expired="2000-01-01T00:00:00.000Z";
  const expirationUpdate=await db.from("ice_documents").update({payload:{...stored.data!.payload,expiresAt:expired},expires_at:expired}).eq("namespace","quotes").eq("id",id);assert.equal(expirationUpdate.error,null);
  const resumed=await request("/api/quote-draft",{headers:{cookie:quoteCookie}}); assert.equal((await resumed.json()).draft,null);
  const resetDraft = await quote(0); const resetCookie=resetDraft.headers.get("set-cookie")!.split(";")[0];
  assert.equal((await request("/api/quote-draft",{method:"DELETE",headers:{origin:base,cookie:resetCookie}})).status,200);
  assert.equal((await (await request("/api/quote-draft",{headers:{cookie:resetCookie}})).json()).draft,null);
  const resetId=scope+createHash("sha256").update(resetCookie.slice(resetCookie.indexOf("=")+1)).digest("hex");
  assert.equal((await db.from("ice_documents").select("id").eq("namespace","quotes").eq("id",resetId)).data!.length,0);
  await post("/api/admin/auth",{action:"logout"},cookie);
  assert.ok((await request("/admin/services",{headers:{cookie}})).status===307 || (await (await request("/admin/services",{headers:{cookie}})).text()).includes("/admin/login"));
  const login2=await post("/api/admin/auth",{username:"qa-editor",password}); const cookie2=login2.headers.get("set-cookie")!.split(";")[0];
  await db.from("ice_documents").update({payload:{username:"qa-editor",passwordHash:salt+":"+scryptSync(password+"rotated",salt,64).toString("hex")}}).eq("namespace","staff").eq("id",scope+"operator");
  const revoked=await request("/admin/services",{headers:{cookie:cookie2}}); assert.ok(revoked.status===307 || (await revoked.text()).includes("/admin/login"));
  const foundation = spawn(process.execPath, ["scripts/check-foundation.mjs", base], { stdio: "inherit" });
  const [foundationCode] = await once(foundation, "exit"); assert.equal(foundationCode, 0);
  if (/blocking-prerender|Next.js encountered uncached data/.test(serverLogs)) console.log(serverLogs.split("\n").filter(line => /Route |blocking-prerender|uncached data|at Page|at Layout|at Workspace|at Login/.test(line)).join("\n"));
  assert.ok(!/blocking-prerender|Next.js encountered uncached data/.test(serverLogs), "admin routes pass development instant-navigation validation");
  console.log("Passed live Supabase: anonymous isolation, database-only login, logout/rotation revocation, private CMS save, concurrent service/quote writes, quote expiry.");
} finally {
  if(server && server.exitCode===null) { server.kill(); await once(server,"exit"); }
  const cleanup=await db.from("ice_documents").delete().like("id",scope+"%");
  assert.equal(cleanup.error,null,"remove only owned QA rows");
  const throttleCleanup=await db.from("ice_login_throttles").delete().like("id",scope+"%");assert.equal(throttleCleanup.error,null);
  const remaining=await db.from("ice_blocks").select("id").eq("workspace_id",scope+"main");assert.equal(remaining.data!.length,0,"projection cleanup cascades");
}
