create table public.ice_login_throttles (
 id text primary key, attempts integer not null check(attempts between 1 and 6), reset_at timestamptz not null
);
create index ice_login_throttles_expiry on public.ice_login_throttles(reset_at);
alter table public.ice_login_throttles enable row level security;
revoke all on public.ice_login_throttles from public,anon,authenticated;
grant select,insert,update,delete on public.ice_login_throttles to service_role;
-- Atomic reservation of an authentication attempt. Successful login clears it.
create function public.ice_take_login_attempt(p_key text) returns boolean
language sql security invoker set search_path='' as $$
 insert into public.ice_login_throttles(id,attempts,reset_at)
 values(p_key,1,clock_timestamp()+interval '15 minutes')
 on conflict(id) do update set
 attempts=case when ice_login_throttles.reset_at<=clock_timestamp() then 1 else least(ice_login_throttles.attempts+1,6) end,
 reset_at=case when ice_login_throttles.reset_at<=clock_timestamp() then clock_timestamp()+interval '15 minutes' else ice_login_throttles.reset_at end
 returning attempts<=5;
$$;
revoke all on function public.ice_take_login_attempt(text) from public,anon,authenticated;
grant execute on function public.ice_take_login_attempt(text) to service_role;
notify pgrst,'reload schema';
