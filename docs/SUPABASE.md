# Supabase storage operations

The 26 November 2026 migration is active in this checkout (`ICE_STORAGE=supabase`).
Runtime uses the project URL and `SUPABASE_SECRET_KEY` server-side. `SUPABASE_DB_URL`
is used only for SQL migration, not by public pages or the browser. Keep all secrets
in ignored environment configuration and configure them separately on hosting.

## Data and access

`public.ice_documents` contains namespaced private JSON documents:

- `services`: twelve catalogue records, each with its editorial history/snapshots.
- `workspace`: the complete schema-2 block/template/page workspace under `main`.
- `staff`: `operator`, preserving the existing username and salted scrypt hash.
- `sessions`: SHA-256 session-token IDs, credential fingerprints and eight-hour expiry.
- `quotes`: SHA-256 token IDs, existing fixed 24-hour expiry and draft data only.

The admin stays on the existing username/password login. Credentials are stored in
Supabase Postgres, not Supabase Auth's Users list. No plaintext password is migrated.
RLS is enabled with no anonymous/authenticated policies; table grants are revoked
from those roles. Only server service-role access is granted. Public pages render
published snapshots through the existing guarded loaders; drafts and hashes never
cross that boundary. Do not grant browser clients access to this table.

All writes compare database revisions. The composition workspace is one document,
so dependency validation and its update commit atomically; concurrent workspace
edits conflict instead of overwriting. Builder saves spanning multiple requests
can still partially succeed, as reported by the existing UI. Database mode fails
closed on missing records or API failure and does not fall back to older local data.

## Credentials and verification

Use `pnpm admin:setup` to rotate the username/password directly in Supabase. Existing
sessions are revoked by fingerprint mismatch on their next request. No restart is
needed for database credential rotation. The initial cutover removed ADMIN_USERNAME
and ADMIN_PASSWORD_HASH from .env.local after comparing the migrated hash.

Run `pnpm verify:supabase` for public API reachability. Run `pnpm build` then
`pnpm test:supabase` for isolated live database integration checks. The latter uses
unique prefixed IDs, starts its own port-3004 server and removes only its own rows.
Keep ICE_STORAGE_SCOPE unset for normal operation; it is an integration-test scope.
`pnpm test:admin` explicitly selects filesystem mode and does not touch live records.

## Migration and rollback

`supabase/migrations/20261126_private_storage.sql` creates the private table/grants.
Initial import is `pnpm migrate:supabase`, requiring the local credential variables
and a reachable Postgres URI. It backs up the source records under ignored private
`.data/backups`, imports atomically and refuses to replace differing database data.
Do not rerun it as a synchronization tool after cutover; Supabase is authoritative.
The activation helper compares the migrated staff hash and workspace, backs up the
environment privately, selects Supabase and removes local staff variables.

Local source files and a pre-cutover environment backup are retained. For rollback,
stop writers first. If database edits happened after cutover, export current records
before rollback; old local files do not include those edits. Restore the backed-up
staff environment and explicitly select ICE_STORAGE=filesystem, then restart.
Never copy private backups into public assets or commit them.

## Remaining production limits

One staff operator and existing in-process login rate limiter remain; this is not
Supabase Auth, MFA or a multi-role system. Expired quote rows are cleaned on API
traffic, and expired sessions are rejected/deleted on access. Scheduled retention,
managed backup recovery checks and shared login throttling remain launch work.
No CRM delivery, pricing activation, indexing change or website deployment occurred.

## Additional domain tables — 26 November 2026

See DATABASE-AUDIT.md for all 26 tables and active/seeded/future distinctions.
ice_documents remains authoritative; database triggers populate queryable domain
projections on each save and cascade deletes. Do not edit projection tables as an
independent source. pnpm migrate:domains creates/backfills the domain schema; pnpm
test:database checks schema/data/grants/indexes; live app tests check actual saves.
Staff throttling is now shared/atomic in ice_login_throttles, superseding the earlier
process-local limiter limitation. Hosted Advisors still need a Management API token.
