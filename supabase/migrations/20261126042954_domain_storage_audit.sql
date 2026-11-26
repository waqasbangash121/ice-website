-- Add queryable domain tables without changing the current atomic document write API.
-- Synchronization runs in the same transaction; a failed FK/check rolls back the save.
create table public.ice_business_settings (
 id text primary key, name text not null, phone text not null, phone_href text not null,
 description text not null, source_reference text not null, status text not null default 'draft' check(status in ('draft','review','approved','published'))
);
create table public.ice_states (id text primary key, name text not null, source_reference text not null);
create table public.ice_regions (
 id text primary key, state_id text not null references public.ice_states(id), name text not null, slug text not null,
 source_reference text not null, unique(state_id,slug)
);
create index ice_regions_state on public.ice_regions(state_id);
create table public.ice_localities (
 id text primary key, state_id text not null references public.ice_states(id), name text not null, slug text not null,
 source_reference text not null, register_status text not null check(register_status in ('planning','verified')), unique(state_id,slug)
);
create index ice_localities_state on public.ice_localities(state_id);
create table public.ice_locality_postcodes (
 locality_id text not null references public.ice_localities(id) on delete cascade,
 postcode text not null check(postcode ~ '^[0-9]{4}$'), primary key(locality_id,postcode)
);
create index ice_locality_postcodes_lookup on public.ice_locality_postcodes(postcode,locality_id);
create table public.ice_locality_regions (
 locality_id text not null references public.ice_localities(id) on delete cascade,
 region_id text not null references public.ice_regions(id), primary key(locality_id,region_id)
);
create index ice_locality_regions_region on public.ice_locality_regions(region_id);
create table public.ice_block_contracts (id text primary key, specification jsonb not null check(jsonb_typeof(specification)='object'));
create table public.ice_template_contracts (id text primary key, specification jsonb not null check(jsonb_typeof(specification)='object'));
create table public.ice_template_contract_slots (
 template_id text not null references public.ice_template_contracts(id) on delete cascade,
 position integer not null check(position>0), block_type text not null references public.ice_block_contracts(id),
 rule text not null check(rule in ('R','C','O')), contract text not null, primary key(template_id,position)
);
create index ice_template_contract_slots_block on public.ice_template_contract_slots(block_type);

create table public.ice_services (
 id text primary key, source_namespace text not null default 'services' check(source_namespace='services'),
 revision bigint not null check(revision>0), record jsonb not null check(jsonb_typeof(record)='object'),
 service_id text generated always as (record->'draft'->>'id') stored,
 slug text generated always as (record->'draft'->>'slug') stored,
 name text generated always as (record->'draft'->>'name') stored,
 status text generated always as (record->>'status') stored check(status in ('draft','review','approved','published')),
 version integer generated always as ((record->>'version')::integer) stored check(version>=0),
 foreign key(source_namespace,id) references public.ice_documents(namespace,id) on delete cascade
 );
 create index ice_services_source on public.ice_services(source_namespace,id);

create table public.ice_staff_accounts (
 id text primary key, source_namespace text not null default 'staff' check(source_namespace='staff'),
 revision bigint not null check(revision>0), record jsonb not null check(jsonb_typeof(record)='object'),
 username text generated always as (record->>'username') stored not null,
 password_hash text generated always as (record->>'passwordHash') stored not null check(password_hash ~ '^[a-f0-9]{32}:[a-f0-9]{128}$'),
 foreign key(source_namespace,id) references public.ice_documents(namespace,id) on delete cascade
 );
 create index ice_staff_accounts_source on public.ice_staff_accounts(source_namespace,id);

create table public.ice_staff_sessions (
 id text primary key, source_namespace text not null default 'sessions' check(source_namespace='sessions'),
 revision bigint not null check(revision>0), record jsonb not null check(jsonb_typeof(record)='object'),
 username text generated always as (record->>'username') stored not null,
 credential_fingerprint text generated always as (record->>'credential') stored not null,
 expires_at timestamptz not null,
 foreign key(source_namespace,id) references public.ice_documents(namespace,id) on delete cascade
 );
 create index ice_staff_sessions_source on public.ice_staff_sessions(source_namespace,id);

create table public.ice_quote_drafts (
 id text primary key, source_namespace text not null default 'quotes' check(source_namespace='quotes'),
 revision bigint not null check(revision>0), record jsonb not null check(jsonb_typeof(record)='object'),
 details jsonb generated always as (record->'details') stored not null,
 service_id text generated always as (nullif(record->'details'->>'serviceId','')) stored,
 locality_id text generated always as (record->>'localityId') stored references public.ice_localities(id),
 version integer generated always as ((record->>'version')::integer) stored check(version>0),
 source_path text generated always as (record->>'sourcePath') stored,
 expires_at timestamptz not null,
 foreign key(source_namespace,id) references public.ice_documents(namespace,id) on delete cascade
 );
 create index ice_quote_drafts_source on public.ice_quote_drafts(source_namespace,id);

create index ice_services_status on public.ice_services(status);
create index ice_services_slug on public.ice_services(slug);
create index ice_staff_accounts_username on public.ice_staff_accounts(username);
create index ice_staff_sessions_expiry on public.ice_staff_sessions(expires_at);
create index ice_quote_drafts_expiry on public.ice_quote_drafts(expires_at);
create index ice_quote_drafts_locality on public.ice_quote_drafts(locality_id);
create index ice_quote_drafts_service on public.ice_quote_drafts(service_id);
create table public.ice_cms_workspaces (
 id text primary key, source_namespace text not null default 'workspace' check(source_namespace='workspace'),
 revision bigint not null check(revision>0), schema_version integer not null check(schema_version=2),
 foreign key(source_namespace,id) references public.ice_documents(namespace,id) on delete cascade
);
create index ice_cms_workspaces_source on public.ice_cms_workspaces(source_namespace,id);

create table public.ice_blocks (
 workspace_id text not null references public.ice_cms_workspaces(id) on delete cascade, id text not null,
 record jsonb not null check(jsonb_typeof(record)='object'),
 draft jsonb generated always as (record->'draft') stored not null,
 published jsonb generated always as (record->'published') stored,
 status text generated always as (record->>'status') stored not null check(status in ('draft','review','approved','published')),
 version integer generated always as ((record->>'version')::integer) stored not null check(version>=0),
 published_revision integer generated always as ((record->>'publishedRevision')::integer) stored not null check(published_revision>=0),
 owner text generated always as (record->>'owner') stored,
 source_reference text generated always as (record->>'source') stored,
 block_type text generated always as (record->'draft'->>'type') stored not null references public.ice_block_contracts(id),
 primary key(workspace_id,id)
 );
 create index ice_blocks_status on public.ice_blocks(status);

create table public.ice_templates (
 workspace_id text not null references public.ice_cms_workspaces(id) on delete cascade, id text not null,
 record jsonb not null check(jsonb_typeof(record)='object'),
 draft jsonb generated always as (record->'draft') stored not null,
 published jsonb generated always as (record->'published') stored,
 status text generated always as (record->>'status') stored not null check(status in ('draft','review','approved','published')),
 version integer generated always as ((record->>'version')::integer) stored not null check(version>=0),
 published_revision integer generated always as ((record->>'publishedRevision')::integer) stored not null check(published_revision>=0),
 owner text generated always as (record->>'owner') stored,
 source_reference text generated always as (record->>'source') stored,
 reference_id text generated always as (record->'draft'->>'referenceId') stored references public.ice_template_contracts(id),
 primary key(workspace_id,id)
 );
 create index ice_templates_status on public.ice_templates(status);

create table public.ice_pages (
 workspace_id text not null references public.ice_cms_workspaces(id) on delete cascade, id text not null,
 record jsonb not null check(jsonb_typeof(record)='object'),
 draft jsonb generated always as (record->'draft') stored not null,
 published jsonb generated always as (record->'published') stored,
 status text generated always as (record->>'status') stored not null check(status in ('draft','review','approved','published')),
 version integer generated always as ((record->>'version')::integer) stored not null check(version>=0),
 published_revision integer generated always as ((record->>'publishedRevision')::integer) stored not null check(published_revision>=0),
 owner text generated always as (record->>'owner') stored,
 source_reference text generated always as (record->>'source') stored,
 path text generated always as (record->'draft'->>'path') stored not null, service_id text generated always as (nullif(record->'draft'->>'serviceId','')) stored, locality_id text generated always as (nullif(record->'draft'->>'localityId','')) stored references public.ice_localities(id), unique(workspace_id,path),
 primary key(workspace_id,id)
 );
 create index ice_pages_status on public.ice_pages(status);

create index ice_blocks_type on public.ice_blocks(block_type);
create index ice_templates_reference on public.ice_templates(reference_id);
create index ice_pages_locality on public.ice_pages(locality_id);
create index ice_pages_service on public.ice_pages(service_id);
create table public.ice_template_slots (
 workspace_id text not null, template_id text not null,
 snapshot text not null check(snapshot in ('draft','published')), slot_id text not null,
 position integer not null check(position>0), block_type text not null references public.ice_block_contracts(id),
 rule text not null check(rule in ('R','C','O')), contract text not null,
 primary key(workspace_id,template_id,snapshot,slot_id), unique(workspace_id,template_id,snapshot,position),
 foreign key(workspace_id,template_id) references public.ice_templates(workspace_id,id) on delete cascade
);
create index ice_template_slots_block on public.ice_template_slots(block_type);
create table public.ice_page_placements (
 workspace_id text not null, page_id text not null, snapshot text not null check(snapshot in ('draft','published')),
 slot_id text not null, position integer not null check(position>0), block_type text not null references public.ice_block_contracts(id),
 block_id text, enabled boolean not null,
 primary key(workspace_id,page_id,snapshot,slot_id), unique(workspace_id,page_id,snapshot,position),
 foreign key(workspace_id,page_id) references public.ice_pages(workspace_id,id) on delete cascade,
 foreign key(workspace_id,block_id) references public.ice_blocks(workspace_id,id) deferrable initially deferred,
 check(not enabled or block_id is not null)
);
create index ice_page_placements_block on public.ice_page_placements(workspace_id,block_id);
create index ice_page_placements_type on public.ice_page_placements(block_type);
create table public.ice_content_history (
 source_namespace text not null, source_id text not null, collection text not null,
 record_id text not null, version integer not null check(version>0), action text not null, actor text not null, occurred_at timestamptz not null,
 primary key(source_namespace,source_id,collection,record_id,version),
 foreign key(source_namespace,source_id) references public.ice_documents(namespace,id) on delete cascade
);
create index ice_content_history_recent on public.ice_content_history(occurred_at desc);

create table public.ice_service_scopes (
 id text primary key, service_id text not null references public.ice_services(id), version text not null,
 status text not null default 'draft' check(status in ('draft','review','approved','published')),
 inclusions jsonb not null default '[]' check(jsonb_typeof(inclusions)='array'),
 exclusions jsonb not null default '[]' check(jsonb_typeof(exclusions)='array'),
 extras jsonb not null default '[]' check(jsonb_typeof(extras)='array'),
 assessment_conditions jsonb not null default '[]' check(jsonb_typeof(assessment_conditions)='array'),
 owner text not null, source_references jsonb not null check(jsonb_typeof(source_references)='array'),
 approved_at timestamptz, reviewed_at timestamptz, unique(service_id,version),
 check(status not in ('approved','published') or approved_at is not null)
);
create table public.ice_evidence (
 id text primary key, kind text not null check(kind in ('case-study','review','credential','media')),
 status text not null default 'draft' check(status in ('draft','review','approved','published')),
 locality_id text references public.ice_localities(id), publication_consent_reference text,
 owner text not null, source_references jsonb not null check(jsonb_typeof(source_references)='array'),
 approved_at timestamptz, reviewed_at timestamptz,
 check(status not in ('approved','published') or approved_at is not null),
 check(status<>'published' or kind='credential' or nullif(publication_consent_reference,'') is not null)
);
create index ice_evidence_locality on public.ice_evidence(locality_id);
create table public.ice_evidence_services (
 evidence_id text not null references public.ice_evidence(id) on delete cascade,
 service_id text not null references public.ice_services(id), primary key(evidence_id,service_id)
);
create index ice_evidence_services_service on public.ice_evidence_services(service_id);
create table public.ice_price_schedules (
 id text primary key, service_id text not null references public.ice_services(id), version text not null,
 status text not null default 'draft' check(status in ('draft','review','approved','published')),
 currency text not null default 'AUD' check(currency='AUD'), tax_presentation text not null check(tax_presentation in ('inclusive','exclusive')),
 effective_from date not null, rules_reference text not null check(length(trim(rules_reference))>0),
 owner text not null, source_references jsonb not null check(jsonb_typeof(source_references)='array'),
 approved_at timestamptz, reviewed_at timestamptz, unique(service_id,version),
 check(status not in ('approved','published') or approved_at is not null)
);

create function public.ice_sync_domain_document() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare item record; variant text; entry jsonb; pos bigint;
begin
 if new.namespace='services' then
  insert into public.ice_services(id,revision,record) values(new.id,new.revision,new.payload)
  on conflict(id) do update set revision=excluded.revision,record=excluded.record;
 elsif new.namespace='staff' then
  insert into public.ice_staff_accounts(id,revision,record) values(new.id,new.revision,new.payload)
  on conflict(id) do update set revision=excluded.revision,record=excluded.record;
 elsif new.namespace='sessions' then
  insert into public.ice_staff_sessions(id,revision,record,expires_at) values(new.id,new.revision,new.payload,to_timestamp((new.payload->>'expires')::double precision/1000))
  on conflict(id) do update set revision=excluded.revision,record=excluded.record,expires_at=excluded.expires_at;
 elsif new.namespace='quotes' then
  insert into public.ice_quote_drafts(id,revision,record,expires_at) values(new.id,new.revision,new.payload,(new.payload->>'expiresAt')::timestamptz)
  on conflict(id) do update set revision=excluded.revision,record=excluded.record,expires_at=excluded.expires_at;
 elsif new.namespace='workspace' then
  -- Replace the relational projection atomically with the new complete workspace.
  delete from public.ice_cms_workspaces where id=new.id;
  insert into public.ice_cms_workspaces(id,revision,schema_version) values(new.id,new.revision,(new.payload->>'schemaVersion')::integer);
  insert into public.ice_blocks(workspace_id,id,record) select new.id,key,value from jsonb_each(new.payload->'blocks');
  insert into public.ice_templates(workspace_id,id,record) select new.id,key,value from jsonb_each(coalesce(new.payload->'templates','{}'));
  insert into public.ice_pages(workspace_id,id,record) select new.id,key,value from jsonb_each(new.payload->'pages');
  for item in select key,value from jsonb_each(coalesce(new.payload->'templates','{}')) loop
   foreach variant in array array['draft','published'] loop
    insert into public.ice_template_slots(workspace_id,template_id,snapshot,slot_id,position,block_type,rule,contract)
    select new.id,item.key,variant,e.value->>'id',e.ordinality,e.value->>'block',e.value->>'rule',e.value->>'contract'
    from jsonb_array_elements(coalesce(item.value->variant->'placements','[]')) with ordinality as e(value,ordinality);
   end loop;
  end loop;
  for item in select key,value from jsonb_each(new.payload->'pages') loop
   foreach variant in array array['draft','published'] loop
    insert into public.ice_page_placements(workspace_id,page_id,snapshot,slot_id,position,block_type,block_id,enabled)
    select new.id,item.key,variant,coalesce(e.value->>'slot',e.value->>'type'),e.ordinality,e.value->>'type',nullif(e.value->>'ref',''),(e.value->>'enabled')::boolean
    from jsonb_array_elements(coalesce(item.value->variant->'placements','[]')) with ordinality as e(value,ordinality);
   end loop;
  end loop;
 end if;
 if new.namespace in ('workspace','services') then
  delete from public.ice_content_history where source_namespace=new.namespace and source_id=new.id;
  if new.namespace='services' then
   insert into public.ice_content_history(source_namespace,source_id,collection,record_id,version,action,actor,occurred_at)
   select new.namespace,new.id,'services',new.payload->'draft'->>'id',(e->>'version')::integer,e->>'action',e->>'actor',(e->>'at')::timestamptz
   from jsonb_array_elements(coalesce(new.payload->'history','[]')) e;
  else
   for item in select key,value from jsonb_each(new.payload) where key in ('blocks','pages','templates') loop
    insert into public.ice_content_history(source_namespace,source_id,collection,record_id,version,action,actor,occurred_at)
    select new.namespace,new.id,item.key,r.key,(e->>'version')::integer,e->>'action',e->>'actor',(e->>'at')::timestamptz
    from jsonb_each(item.value) r cross join lateral jsonb_array_elements(coalesce(r.value->'history','[]')) e;
   end loop;
  end if;
 end if;
 return new;
end;
$$;
revoke all on function public.ice_sync_domain_document() from public, anon, authenticated;
grant execute on function public.ice_sync_domain_document() to service_role;
create trigger ice_documents_domain_sync after insert or update of payload,revision on public.ice_documents
for each row execute function public.ice_sync_domain_document();

alter table public.ice_business_settings enable row level security;
 revoke all on public.ice_business_settings from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_business_settings to service_role;

alter table public.ice_states enable row level security;
 revoke all on public.ice_states from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_states to service_role;

alter table public.ice_regions enable row level security;
 revoke all on public.ice_regions from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_regions to service_role;

alter table public.ice_localities enable row level security;
 revoke all on public.ice_localities from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_localities to service_role;

alter table public.ice_locality_postcodes enable row level security;
 revoke all on public.ice_locality_postcodes from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_locality_postcodes to service_role;

alter table public.ice_locality_regions enable row level security;
 revoke all on public.ice_locality_regions from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_locality_regions to service_role;

alter table public.ice_block_contracts enable row level security;
 revoke all on public.ice_block_contracts from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_block_contracts to service_role;

alter table public.ice_template_contracts enable row level security;
 revoke all on public.ice_template_contracts from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_template_contracts to service_role;

alter table public.ice_template_contract_slots enable row level security;
 revoke all on public.ice_template_contract_slots from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_template_contract_slots to service_role;

alter table public.ice_services enable row level security;
 revoke all on public.ice_services from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_services to service_role;

alter table public.ice_staff_accounts enable row level security;
 revoke all on public.ice_staff_accounts from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_staff_accounts to service_role;

alter table public.ice_staff_sessions enable row level security;
 revoke all on public.ice_staff_sessions from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_staff_sessions to service_role;

alter table public.ice_quote_drafts enable row level security;
 revoke all on public.ice_quote_drafts from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_quote_drafts to service_role;

alter table public.ice_cms_workspaces enable row level security;
 revoke all on public.ice_cms_workspaces from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_cms_workspaces to service_role;

alter table public.ice_blocks enable row level security;
 revoke all on public.ice_blocks from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_blocks to service_role;

alter table public.ice_templates enable row level security;
 revoke all on public.ice_templates from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_templates to service_role;

alter table public.ice_pages enable row level security;
 revoke all on public.ice_pages from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_pages to service_role;

alter table public.ice_template_slots enable row level security;
 revoke all on public.ice_template_slots from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_template_slots to service_role;

alter table public.ice_page_placements enable row level security;
 revoke all on public.ice_page_placements from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_page_placements to service_role;

alter table public.ice_content_history enable row level security;
 revoke all on public.ice_content_history from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_content_history to service_role;

alter table public.ice_service_scopes enable row level security;
 revoke all on public.ice_service_scopes from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_service_scopes to service_role;

alter table public.ice_evidence enable row level security;
 revoke all on public.ice_evidence from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_evidence to service_role;

alter table public.ice_evidence_services enable row level security;
 revoke all on public.ice_evidence_services from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_evidence_services to service_role;

alter table public.ice_price_schedules enable row level security;
 revoke all on public.ice_price_schedules from public,anon,authenticated;
 grant select,insert,update,delete on public.ice_price_schedules to service_role;

notify pgrst, 'reload schema';
