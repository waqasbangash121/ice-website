import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

test("staff authentication, publication isolation, concurrency and revocation", { timeout: 90000 }, async () => {
  const data = await mkdtemp(path.join(tmpdir(), "ice-admin-test-"));
  const password = randomBytes(24).toString("hex");
  const salt = randomBytes(16).toString("hex");
  const base = "http://localhost:3002";
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", "3002"], { env: { ...process.env, ICE_STORAGE: "filesystem", ADMIN_USERNAME: "test-editor", ADMIN_PASSWORD_HASH: salt + ":" + scryptSync(password, salt, 64).toString("hex"), ADMIN_DATA_DIR: data }, stdio: ["ignore", "pipe", "pipe"] });
  let logs = "";
  server.stdout.on("data", (chunk) => { logs += chunk; });
  server.stderr.on("data", (chunk) => { logs += chunk; });
  const request = (route, options) => fetch(base + route, { redirect: "manual", ...options });
  const post = (route, values, cookie = "", origin = base) => request(route, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", origin, cookie }, body: new URLSearchParams(values) });
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (server.exitCode !== null) throw new Error(logs);
      try { if ((await request("/admin/login")).ok) { ready = true; break; } } catch {}
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    assert.ok(ready, logs);
    const anonymous = await request("/admin/services");
    const anonymousBody = await anonymous.text();
    assert.ok(anonymous.status === 307 || anonymousBody.includes("/admin/login"));
    assert.ok(!anonymousBody.includes("Twelve services."));
    assert.equal((await post("/api/admin/services/end-of-lease-cleaning", { action: "publish", version: "0" })).status, 401);
    assert.equal((await post("/api/admin/auth", { username: "test-editor", password }, "", "https://untrusted.example")).status, 403);
    assert.ok((await post("/api/admin/auth", { username: "test-editor", password: "wrong" })).headers.get("location").includes("error=1"));
    const login = await post("/api/admin/auth", { username: "test-editor", password });
    assert.equal(login.status, 303);
    const setCookie = login.headers.get("set-cookie");
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=strict/i);
    const cookie = setCookie.split(";")[0];
    assert.match(await (await request("/admin", { headers: { cookie } })).text(), /Ready for your attention/);
    const route = "/api/admin/services/end-of-lease-cleaning";
    const marker = "Private synthetic service revision " + randomBytes(8).toString("hex");
    const save = await post(route, { action: "save", version: "0", name: "End-of-Lease Cleaning", summary: marker, owner: "QA operator", source: "Synthetic QA fixture" }, cookie);
    assert.ok(save.headers.get("location").includes("saved=1"));
    assert.ok(!(await (await request("/services")).text()).includes(marker));
    assert.ok((await post(route, { action: "publish", version: "1" }, cookie)).headers.get("location").includes("error="));
    assert.ok((await post(route, { action: "review", version: "0" }, cookie)).headers.get("location").includes("error="));
    for (const [action, version] of [["review", "1"], ["approve", "2"], ["publish", "3"]]) {
      assert.ok((await post(route, { action, version }, cookie)).headers.get("location").includes("saved=1"));
    }
    assert.ok((await (await request("/services")).text()).includes(marker));
    assert.ok((await (await request("/")).text()).includes(marker));
    const later = marker + " UNPUBLISHED";
    assert.ok((await post(route, { action: "save", version: "4", name: "End-of-Lease Cleaning", summary: later, owner: "QA operator", source: "Synthetic QA fixture" }, cookie)).headers.get("location").includes("saved=1"));
    const publicHtml = await (await request("/services")).text();
    assert.ok(publicHtml.includes(marker));
    assert.ok(!publicHtml.includes(later));
    const record = JSON.parse(await readFile(path.join(data, "content", "end-of-lease-cleaning.json"), "utf8"));
    assert.equal(record.history.length, 5);
    assert.equal(record.draft.id, "end-of-lease-cleaning");
    assert.equal(record.status, "draft");
    // Block/page composition uses the same authenticated boundary and separate snapshots.
    const compose = (kind, id, values, auth = cookie) => post(`/api/admin/composition/${kind}/${id}`, values, auth);
    const workspaceFile = path.join(data, "composition", "workspace.json");
    const workspace = async () => JSON.parse(await readFile(workspaceFile, "utf8"));
    const sharedMarker = "Shared FAQ fixture " + randomBytes(8).toString("hex");
    const faq = { id: "lease-faqs", type: "B15", title: "Before Your End-of-Lease Clean", eyebrow: "Your Questions", body: "", items: [{ title: "Shared fixture question?", text: sharedMarker }], links: [] };
    const saveContent = async (kind, id, content, version) => compose(kind, id, { action: "save", version: String(version), owner: "QA operator", source: "Synthetic block QA fixture", content: JSON.stringify(content) });
    assert.equal((await compose("blocks", "lease-faqs", { action: "save", version: "0" }, "")).status, 401);
    for (const privatePath of ["/admin/blocks", "/admin/pages", "/admin/templates", "/admin/preview/lease-national", "/admin/preview/lease-national?embedded=1"]) {
      const response = await request(privatePath);
      const body = await response.text();
      assert.ok(response.status === 307 || body.includes("/admin/login"));
      assert.ok(!body.includes("Shared fixture question?"));
    }
    assert.ok((await saveContent("blocks", "lease-faqs", faq, 0)).headers.get("location").includes("saved=1"));
    const legacy = await workspace();
    legacy.schemaVersion = 1;
    delete legacy.templates;
    await writeFile(workspaceFile, JSON.stringify(legacy));
    assert.ok(!(await (await request("/services/end-of-lease-cleaning")).text()).includes(sharedMarker));
    assert.ok((await (await request("/admin/preview/lease-national", { headers: { cookie } })).text()).includes(sharedMarker));
    const composerHtml = await (await request("/admin/pages/lease-national", { headers: { cookie } })).text();
    assert.match(composerHtml, /<iframe[^>]+title="Draft design preview: lease-national"/);
    assert.ok(composerHtml.includes("embedded=1"));
    const embeddedHtml = await (await request("/admin/preview/lease-national?embedded=1", { headers: { cookie } })).text();
    assert.ok(embeddedHtml.includes(sharedMarker));
    assert.ok(!embeddedHtml.includes("Return to composer"));
    for (const [action, version] of [["review", 1], ["approve", 2], ["publish", 3]]) assert.ok((await compose("blocks", "lease-faqs", { action, version: String(version) })).headers.get("location").includes("saved=1"));
    assert.equal((await workspace()).schemaVersion, 2);
    for (const publicPath of ["/services/end-of-lease-cleaning", "/locations/nsw/suburbs/sydney/end-of-lease-cleaning"]) assert.ok((await (await request(publicPath)).text()).includes(sharedMarker));
    const draftMarker = sharedMarker + " PRIVATE";
    assert.ok((await saveContent("blocks", "lease-faqs", { ...faq, items: [{ title: "New draft question?", text: draftMarker }] }, 4)).headers.get("location").includes("saved=1"));
    assert.ok(!(await (await request("/services/end-of-lease-cleaning")).text()).includes(draftMarker));
    const pageRecord = (await workspace()).pages["lease-national"];
    const composition = pageRecord.draft;
    for (const invalid of [
      { ...composition, placements: composition.placements.map((p) => p.type === "B06" ? { ...p, enabled: false } : p) },
      { ...composition, placements: composition.placements.map((p) => p.type === "B06" ? { ...p, ref: "lease-faqs" } : p) },
      { ...composition, placements: composition.placements.map((p) => p.type === "B09" ? { ...p, enabled: true, ref: "lease-pricing" } : p) },
      { ...composition, path: "/an-unapproved-new-route" },
    ]) assert.ok((await saveContent("pages", "lease-national", invalid, 0)).headers.get("location").includes("error="));
    const metaMarker = "QA composed title " + randomBytes(8).toString("hex");
    const reordered = structuredClone(composition);
    const extras = reordered.placements.findIndex((p) => p.type === "B07");
    const pricing = reordered.placements.findIndex((p) => p.type === "B08");
    [reordered.placements[extras], reordered.placements[pricing]] = [reordered.placements[pricing], reordered.placements[extras]];
    reordered.title = metaMarker;
    assert.ok((await saveContent("pages", "lease-national", reordered, 0)).headers.get("location").includes("saved=1"));
    assert.ok(!(await (await request("/services/end-of-lease-cleaning")).text()).includes(metaMarker));
    assert.ok((await compose("pages", "lease-national", { action: "review", version: "1" })).headers.get("location").includes("saved=1"));
    assert.ok((await compose("pages", "lease-national", { action: "approve", version: "2" })).headers.get("location").includes("error="));
    async function publishBlock(id) {
      const current = (await workspace()).blocks[id];
      let version = current.version;
      assert.ok((await saveContent("blocks", id, current.draft, version++)).headers.get("location").includes("saved=1"));
      for (const action of ["review", "approve", "publish"]) assert.ok((await compose("blocks", id, { action, version: String(version++) })).headers.get("location").includes("saved=1"));
    }
    for (const placement of composition.placements.filter((p) => p.enabled)) await publishBlock(placement.ref);
    assert.ok((await compose("pages", "lease-national", { action: "approve", version: "2" })).headers.get("location").includes("saved=1"));
    await publishBlock("lease-faqs");
    assert.ok((await compose("pages", "lease-national", { action: "publish", version: "3" })).headers.get("location").includes("error="));
    assert.ok((await saveContent("pages", "lease-national", reordered, 3)).headers.get("location").includes("saved=1"));
    for (const [action, version] of [["review", 4], ["approve", 5], ["publish", 6]]) assert.ok((await compose("pages", "lease-national", { action, version: String(version) })).headers.get("location").includes("saved=1"));
    const composedPublic = await (await request("/services/end-of-lease-cleaning")).text();
    assert.ok(composedPublic.includes(metaMarker), `Expected ${metaMarker}; received ${composedPublic.match(/<title>(.*?)<\/title>/)?.[1]}`);
    assert.ok(composedPublic.indexOf('id="block-b08"') < composedPublic.indexOf('id="block-b07"'));
    assert.equal((composedPublic.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok((await saveContent("blocks", "lease-pricing", { ...(await workspace()).blocks["lease-pricing"].draft, body: "Costs $99" }, (await workspace()).blocks["lease-pricing"].version)).headers.get("location").includes("error="));
    const variant = await compose("blocks", "new", { action: "create", copyFrom: "lease-faqs", newId: "sydney-specific-faqs" });
    assert.ok(variant.headers.get("location").includes("/admin/blocks/sydney-specific-faqs?saved=1"));
    assert.equal((await workspace()).blocks["sydney-specific-faqs"].publishedRevision, 0);
    assert.equal((await workspace()).blocks["sydney-specific-faqs"].draft.type, "B15");
    assert.ok((await compose("blocks", "new", { action: "create", copyFrom: "lease-faqs", newId: "sydney-specific-faqs" })).headers.get("location").includes("error="));
    assert.ok((await compose("blocks", "new", { action: "create", copyFrom: "lease-faqs", newId: "../escape" })).headers.get("location").includes("error="));
    // New records are created through the admin and become real public routes without rebuilding.
    const create = (kind, id, content, auth = cookie) => compose(kind, "new", { action: "create", newId: id, content: JSON.stringify(content), owner: "QA operator", source: "Synthetic creation fixture" }, auth);
    // Every original family can be retained as a design; unfinished required behavior cannot publish.
    const contracts = JSON.parse(await readFile("src/config/block-contracts.json", "utf8"));
    const reference = JSON.parse(await readFile("src/config/template-reference.json", "utf8"));
    assert.equal(reference.templates.length, 20);
    for (const spec of contracts.templates) {
      assert.ok(reference.templates.some((r) => r.id === spec.id && r.acceptance && r.mobile && r.evidence));
      const design = { id: `qa-reference-${spec.id.toLowerCase()}`, referenceId: spec.id, name: `${spec.id} reference design`, description: "Reference design fixture.", placements: spec.placements.map((slot, i) => ({ id: `slot-${i}`, block: slot.block, rule: slot.rule, contract: slot.contract })) };
      assert.ok((await create("templates", design.id, design)).headers.get("location").includes("saved=1"), `${spec.id} full design import`);
      assert.equal((await workspace()).templates[design.id].draft.placements.length, spec.placements.length);
    }
    const heldId = "qa-reference-a20";
    assert.ok((await compose("templates", heldId, { action: "review", version: "1" })).headers.get("location").includes("saved=1"));
    assert.ok((await compose("templates", heldId, { action: "approve", version: "2" })).headers.get("location").includes("error="));
    assert.equal((await workspace()).templates[heldId].publishedRevision, 0);
    const based = (await workspace()).templates["qa-reference-a03"].draft;
    assert.ok((await saveContent("templates", based.id, { ...based, placements: based.placements.filter((slot) => slot.block !== "B06") }, 1)).headers.get("location").includes("error="));
    assert.ok((await saveContent("templates", based.id, { ...based, referenceId: undefined }, 1)).headers.get("location").includes("error="));
    for (const [action, version] of [["review", 1], ["approve", 2], ["publish", 3]]) assert.ok((await compose("templates", based.id, { action, version: String(version) })).headers.get("location").includes("saved=1"));
    assert.equal((await workspace()).templates[based.id].publishedRevision, 4);
    const familyPage = { id: "qa-family-context", template: based.id, path: "/services/qa-family-context", serviceId: "", localityId: "", title: "Family context test", description: "Context fixture.", intent: "Check reference family context." };
    assert.ok((await create("pages", familyPage.id, familyPage)).headers.get("location").includes("error="));
    assert.ok((await create("pages", familyPage.id, { ...familyPage, serviceId: "carpet-cleaning", localityId: "planning-sydney-nsw" })).headers.get("location").includes("error="));
    assert.ok((await create("pages", familyPage.id, { ...familyPage, serviceId: "carpet-cleaning" })).headers.get("location").includes("saved=1"));
    assert.ok((await create("pages", "qa-local-context", { ...familyPage, id: "qa-local-context", template: "A06", path: "/locations/nsw/suburbs/sydney/qa-local", serviceId: "carpet-cleaning" })).headers.get("location").includes("error="));
    const createdIntro = { id: "qa-new-intro", type: "B01", title: "A newly created public page", eyebrow: "QA", body: "Created by the administrator.", items: [], links: [] };
    const createdBody = { id: "qa-new-body", type: "B21", title: "New editorial section", eyebrow: "", body: "New published content " + randomBytes(8).toString("hex"), items: [], links: [] };
    const customTemplate = { id: "qa-custom-template", name: "QA custom template", description: "A template created in the admin.", placements: [{ id: "intro", block: "B01", rule: "R", contract: "Introduce the page." }, { id: "first-body", block: "B21", rule: "R", contract: "First editorial section." }, { id: "second-body", block: "B21", rule: "R", contract: "Second editorial section." }] };
    for (const kind of ["blocks", "templates", "pages"]) assert.equal((await create(kind, "unauthorized", {}, "")).status, 401);
    assert.ok((await create("templates", customTemplate.id, customTemplate)).headers.get("location").includes("saved=1"));
    const newPublicPath = "/guides/qa-created-" + randomBytes(6).toString("hex");
    const newPage = { id: "qa-new-page", template: customTemplate.id, path: newPublicPath, serviceId: "", localityId: "", title: "QA newly published page", description: "A new page published from the admin.", intent: "Verify administrator page creation and publication." };
    assert.equal((await request(newPublicPath)).status, 404);
    assert.ok((await create("pages", newPage.id, newPage)).headers.get("location").includes("error="));
    async function advance(kind, id, startVersion) {
      let version = startVersion;
      for (const action of ["review", "approve", "publish"]) assert.ok((await compose(kind, id, { action, version: String(version++) })).headers.get("location").includes("saved=1"), `${kind}/${id}: ${action}`);
    }
    await advance("templates", customTemplate.id, 1);
    for (const content of [createdIntro, createdBody]) {
      assert.ok((await create("blocks", content.id, content)).headers.get("location").includes("saved=1"));
      await advance("blocks", content.id, 1);
    }
    assert.ok((await create("pages", newPage.id, newPage)).headers.get("location").includes("saved=1"));
    assert.equal((await request(newPublicPath)).status, 404);
    for (const forbidden of [newPublicPath, "/admin/danger", "/services", "/guides/../admin", "/guides/UPPER", "/guides/trailing/"]) assert.ok((await create("pages", "qa-collision", { ...newPage, path: forbidden })).headers.get("location").includes("error="));
    const composedNew = (await workspace()).pages[newPage.id].draft;
    composedNew.placements = composedNew.placements.map((slot) => ({ ...slot, ref: slot.type === "B01" ? createdIntro.id : createdBody.id }));
    assert.ok((await saveContent("pages", newPage.id, composedNew, 1)).headers.get("location").includes("saved=1"));
    assert.ok((await (await request(`/admin/preview/${newPage.id}`, { headers: { cookie } })).text()).includes(createdBody.body));
    const locked = await saveContent("templates", customTemplate.id, { ...customTemplate, placements: customTemplate.placements.slice(0, 2) }, 4);
    assert.ok(locked.headers.get("location").includes("error="));
    await advance("pages", newPage.id, 2);
    const newlyPublished = await request(newPublicPath);
    assert.equal(newlyPublished.status, 200);
    const newHtml = await newlyPublished.text();
    assert.ok(newHtml.includes(createdIntro.title));
    assert.ok(newHtml.includes(createdBody.body));
    assert.ok(newHtml.includes("QA newly published page"));
    assert.equal((newHtml.match(/<h1[\s>]/g) || []).length, 1);
    assert.ok(newHtml.includes('id="block-b21"') && newHtml.includes('id="block-b21-2"'));
    assert.ok((await saveContent("pages", newPage.id, { ...composedNew, title: "PRIVATE page title" }, 5)).headers.get("location").includes("saved=1"));
    assert.ok(!(await (await request(newPublicPath)).text()).includes("PRIVATE page title"));
    const draftBody = { ...createdBody, body: "PRIVATE shared text " + randomBytes(8).toString("hex") };
    assert.ok((await saveContent("blocks", createdBody.id, draftBody, 4)).headers.get("location").includes("saved=1"));
    assert.ok(!(await (await request(newPublicPath)).text()).includes(draftBody.body));
    await advance("blocks", createdBody.id, 5);
    assert.ok((await (await request(newPublicPath)).text()).includes(draftBody.body));
    assert.ok((await create("blocks", "qa-link-to-new-page", { id: "qa-link-to-new-page", type: "B16", title: "Related page", eyebrow: "", body: "", items: [], links: [{ label: "Created page", href: newPublicPath }] })).headers.get("location").includes("saved=1"));
    assert.equal((await post("/api/admin/auth", { action: "logout" }, cookie)).status, 303);
    assert.equal((await post(route, { action: "review", version: "5" }, cookie)).status, 401);
    const relogin = await post("/api/admin/auth", { username: "test-editor", password });
    const secondCookie = relogin.headers.get("set-cookie").split(";")[0];
    const sessionPath = path.join(data, "sessions", (await readdir(path.join(data, "sessions")))[0]);
    const session = JSON.parse(await readFile(sessionPath, "utf8"));
    session.expires = Date.now() - 1000;
    await writeFile(sessionPath, JSON.stringify(session));
    assert.equal((await post(route, { action: "review", version: "5" }, secondCookie)).status, 401);
  } finally {
    server.kill("SIGTERM");
    await new Promise((resolve) => { if (server.exitCode !== null) resolve(); else server.once("exit", resolve); });
    await rm(data, { recursive: true, force: true });
  }
});
