import nextEnv from "@next/env";
import postgres from "postgres";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { site } from "../src/config/site";
import { sydney } from "../src/data/locations";
import contracts from "../src/config/block-contracts.json";
import templateReference from "../src/config/template-reference.json";
nextEnv.loadEnvConfig(process.cwd());
const migration = "supabase/migrations/20261126042954_domain_storage_audit.sql";
const sql = postgres(process.env.SUPABASE_DB_URL!, { ssl: "require", max: 1, prepare: false, connect_timeout: 15, onnotice: () => {} });
try {
  const source = await sql`select namespace,id,revision,payload,expires_at from public.ice_documents order by namespace,id`;
  await mkdir(".data/backups", { recursive: true, mode: 0o700 });
  await writeFile(`.data/backups/before-domain-schema-${Date.now()}.json`, JSON.stringify(source), { mode: 0o600, flag: "wx" });
  await sql.begin(async tx => {
    await tx`set local lock_timeout='10s'`;
    await tx`set local statement_timeout='45s'`;
    const throttle = await tx`select to_regclass('public.ice_login_throttles') as relation`;
    if (!throttle[0].relation) await tx.unsafe(await readFile("supabase/migrations/20261126043035_shared_login_throttle.sql","utf8"));
    // Prevent an old API writer racing the initial projection backfill.
    await tx`lock table public.ice_documents in share row exclusive mode`;
    const installed = await tx`select to_regclass('public.ice_business_settings') as relation`;
    if (!installed[0].relation) await tx.unsafe(await readFile(migration,"utf8"));
    else console.log("Domain schema already exists; verifying/seeding without replacing records.");
    await tx`insert into public.ice_business_settings(id,name,phone,phone_href,description,source_reference) values ('ice',${site.name},${site.phone},${site.phoneHref},${site.description},'src/config/site.ts; docs/SOURCE-INVENTORY.md') on conflict do nothing`;
    await tx`insert into public.ice_states(id,name,source_reference) values ('nsw','New South Wales','Existing implemented NSW routes; not an official-register import') on conflict do nothing`;
    await tx`insert into public.ice_localities(id,state_id,name,slug,source_reference,register_status) values (${sydney.id},${sydney.stateId},${sydney.name},${sydney.slug},${sydney.sourceReference},'planning') on conflict do nothing`;
    for(const postcode of sydney.postcodes) await tx`insert into public.ice_locality_postcodes(locality_id,postcode) values(${sydney.id},${postcode}) on conflict do nothing`;
    const blocks = contracts.blocks.map(block=>({id:block.id,specification:block}));
    await tx`insert into public.ice_block_contracts ${tx(blocks,"id","specification")} on conflict do nothing`;
    const templates = contracts.templates.map(template=>({id:template.id,specification:{...template,reference:templateReference.templates.find(t=>t.id===template.id),source:templateReference.source}}));
    await tx`insert into public.ice_template_contracts ${tx(templates,"id","specification")} on conflict do nothing`;
    const slots = contracts.templates.flatMap(template=>template.placements.map((slot,i)=>({template_id:template.id,position:i+1,block_type:slot.block,rule:slot.rule,contract:slot.contract})));
    await tx`insert into public.ice_template_contract_slots ${tx(slots,"template_id","position","block_type","rule","contract")} on conflict do nothing`;
    const context = await tx`select 1 from information_schema.columns where table_schema='public' and table_name='ice_pages' and column_name='template_id'`;
    if (!context.length) await tx.unsafe(await readFile("supabase/migrations/20261126044145_domain_context_relationships.sql","utf8"));
    await tx.unsafe("alter table public.ice_pages alter constraint ice_pages_service_fk deferrable initially deferred; alter table public.ice_quote_drafts alter constraint ice_quote_drafts_service_fk deferrable initially deferred;");
    // Reprojects current authoritative data, without changing revisions or values.
    await tx`update public.ice_documents set payload=payload`;
    const before = source.map(r=>[r.namespace,r.id,r.revision,JSON.stringify(r.payload)]);
    const after = await tx`select namespace,id,revision,payload from public.ice_documents order by namespace,id`;
    if(JSON.stringify(before)!==JSON.stringify(after.map(r=>[r.namespace,r.id,r.revision,JSON.stringify(r.payload)]))) throw new Error("Source changed before migration lock; retry with writers idle.");
    const tables = await tx`select tablename from pg_tables where schemaname='public' and tablename like 'ice_%' order by tablename`;
    console.log(`Domain migration verified: ${tables.length} application tables; ${after.length} original documents preserved unchanged.`);
  });
  const hash=createHash("sha256").update(await readFile(migration)).digest("hex");
  const contextHash=createHash("sha256").update(await readFile("supabase/migrations/20261126044145_domain_context_relationships.sql")).digest("hex");
  const throttleHash=createHash("sha256").update(await readFile("supabase/migrations/20261126043035_shared_login_throttle.sql")).digest("hex");
  await writeFile(`.data/backups/domain-schema-receipt-${Date.now()}.json`,JSON.stringify({appliedAt:new Date().toISOString(),migrations:{[migration]:hash,"supabase/migrations/20261126043035_shared_login_throttle.sql":throttleHash,"supabase/migrations/20261126044145_domain_context_relationships.sql":contextHash}}),{mode:0o600,flag:"wx"});
  console.log("Migration checksum:",hash);
} catch(error) {
  console.error("Domain migration rolled back or could not connect. Code:",(error as {code?:string}).code || "verification-failed");
  // Log structural diagnostics only, never query parameter values or secret-bearing detail.
  const e=error as {table?:string;column?:string;constraint?:string};
  console.error("Database object:",e.table || e.column || e.constraint || "not reported");
  process.exitCode=1;
} finally { await sql.end(); }
