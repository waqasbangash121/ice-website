-- Private application documents; never grant anonymous access to drafts or credentials.
create table if not exists public.ice_documents (
  namespace text not null,
  id text not null,
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null,
  expires_at timestamptz,
  primary key (namespace, id),
  check (namespace in ('services','workspace','staff','sessions','quotes'))
);
alter table public.ice_documents enable row level security;
revoke all on public.ice_documents from public, anon, authenticated;
grant select, insert, update, delete on public.ice_documents to service_role;
create index if not exists ice_documents_expiry on public.ice_documents (expires_at) where expires_at is not null;
notify pgrst, 'reload schema';
