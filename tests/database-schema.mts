import { isDeepStrictEqual } from "node:util";
import assert from "node:assert/strict";
import nextEnv from "@next/env";
import postgres from "postgres";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
nextEnv.loadEnvConfig(process.cwd());
const db=postgres(process.env.SUPABASE_DB_URL!,{ssl:"require",max:1,prepare:false,connect_timeout:15,onnotice:()=>{}});
const anon=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SECRET_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});
const key="schema-test-"+randomBytes(8).toString("hex");
try {
 const tables=await db`select c.relname as name,c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname like 'ice_%' order by c.relname`;
 assert.equal(tables.length,26);
 for(const table of tables) {
  assert.equal(table.rls,true,`${table.name}: RLS enabled`);
  const privileges=await db`select has_table_privilege('anon',${'public.'+table.name},'SELECT,INSERT,UPDATE,DELETE') as anon,has_table_privilege('authenticated',${'public.'+table.name},'SELECT,INSERT,UPDATE,DELETE') as authenticated`;
  assert.equal(privileges[0].anon,false,table.name); assert.equal(privileges[0].authenticated,false,table.name);
  const count=await db`select count(*)::integer as count from ${db('public.'+table.name)}`;
  console.log(`${table.name}: ${count[0].count} rows, private/RLS`);
 }
 const functions=await db`select p.proname,p.prosecdef,has_function_privilege('anon',p.oid,'EXECUTE') as anon,has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('ice_sync_domain_document','ice_take_login_attempt')`;
 assert.equal(functions.length,2);
 for(const f of functions) {assert.equal(f.prosecdef,false);assert.equal(f.anon,false);assert.equal(f.authenticated,false);}
 const docs=await db`select namespace,id,revision,payload from public.ice_documents`;
 const mapping:Record<string,string>={services:"ice_services",staff:"ice_staff_accounts",sessions:"ice_staff_sessions",quotes:"ice_quote_drafts"};
 for(const doc of docs) {
  if(mapping[doc.namespace]) {
   const rows=await db`select record,revision from ${db('public.'+mapping[doc.namespace])} where id=${doc.id}`;
   assert.equal(rows.length,1);assert.ok(isDeepStrictEqual(rows[0].record,doc.payload),"source and projection match");assert.equal(rows[0].revision,doc.revision);
  } else if(doc.namespace==='workspace') {
   for(const kind of ['blocks','templates','pages']) {
    const rows=await db`select id,record from ${db('public.ice_'+kind)} where workspace_id=${doc.id}`;
    assert.ok(isDeepStrictEqual(Object.fromEntries(rows.map(r=>[r.id,r.record])),doc.payload[kind]),"workspace projection matches source");
   }
  }
 }
 const counts=await db`select (select count(*)::integer from public.ice_block_contracts) as blocks,(select count(*)::integer from public.ice_template_contracts) as templates,(select count(*)::integer from public.ice_template_contract_slots) as slots`;
 assert.deepEqual({...counts[0]},{blocks:44,templates:20,slots:177});
 assert.equal((await db`select register_status from public.ice_localities where id='planning-sydney-nsw'`)[0].register_status,'planning');
 for(const table of ['ice_price_schedules','ice_evidence','ice_service_scopes']) assert.equal((await db`select count(*)::integer as count from ${db('public.'+table)}`)[0].count,0,'no invented content');
 const read=await anon.from('ice_staff_accounts').select('id').limit(0); assert.ok(read.error,'anonymous denied via API');
 const denied=await anon.rpc('ice_take_login_attempt',{p_key:key});assert.ok(denied.error);
 const results=await Promise.all(Array.from({length:8},()=>admin.rpc('ice_take_login_attempt',{p_key:key})));
 results.forEach(r=>assert.equal(r.error,null));assert.equal(results.filter(r=>r.data===true).length,5,'atomic throttle permits only five concurrent attempts');
 await db`update public.ice_login_throttles set reset_at=now()-interval '1 second' where id=${key}`;
 assert.equal((await admin.rpc('ice_take_login_attempt',{p_key:key})).data,true,'expired limit resets');
 // Test FK/check behavior in savepoints; every synthetic change rolls back.
 await db.begin(async tx=>{
  const workspace=structuredClone(docs.find(d=>d.namespace==='workspace' && d.id==='main')!.payload);
  const page=Object.values(workspace.pages)[0] as {draft:{placements:{enabled:boolean;ref:string}[]}};
  const placement=page.draft.placements.find(p=>p.enabled)!;placement.ref='missing-block-for-atomic-rollback';
  await assert.rejects(tx.savepoint(async sp=>{
    await sp`insert into public.ice_documents(namespace,id,revision,payload) values('workspace',${key},1,${sp.json(workspace)})`;
    await sp`set constraints all immediate`;
  }),{code:'23503'});
  assert.equal((await tx`select count(*)::integer as count from public.ice_documents where namespace='workspace' and id=${key}`)[0].count,0,'invalid projection rolls back the source write');
  await assert.rejects(tx.savepoint(async sp=>{await sp`insert into public.ice_locality_postcodes(locality_id,postcode) values('missing-locality','2000')`;}),{code:'23503'});
  await assert.rejects(tx.savepoint(async sp=>{await sp`insert into public.ice_locality_postcodes(locality_id,postcode) values('planning-sydney-nsw','invalid')`;}),{code:'23514'});
  await assert.rejects(tx.savepoint(async sp=>{await sp`insert into public.ice_price_schedules(id,service_id,version,status,tax_presentation,effective_from,rules_reference,owner,source_references) values(${key},'house-cleaning','test','published','inclusive',current_date,'test','QA','[]')`;}),{code:'23514'});
 });
 // FK index audit: each FK's referencing columns must lead an index.
 const missing=await db`select con.conname from pg_constraint con join pg_class c on c.oid=con.conrelid join pg_namespace n on n.oid=c.relnamespace where con.contype='f' and n.nspname='public' and c.relname like 'ice_%' and not exists(select 1 from pg_index i where i.indrelid=con.conrelid and i.indisvalid and (i.indkey::smallint[])[0:array_length(con.conkey,1)-1]=con.conkey)`;
 assert.equal(missing.length,0,'all FK columns have leading indexes');
 console.log('Passed schema audit: 26 private tables, projection equality, 44/20/177 contracts, stable locality identity, constraints, atomic throttle and FK indexes.');
} finally {await db`delete from public.ice_login_throttles where id=${key}`;await db.end();}
