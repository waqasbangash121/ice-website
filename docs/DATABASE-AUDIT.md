# Database persistence audit

26 November 2026 (Asia/Karachi). Current Phase 3 remains in progress.

Reviewed the complete src tree: every App Router page and mutation route, admin
builders/creation forms, auth/session/storage modules, quote state/validation,
content/domain types, all data/config modules, public loaders, Proxy publication
gate, setup/import/verification scripts, tests, roadmap and architecture contracts.
This audit creates storage for implemented records and explicit domain interfaces;
it does not invent finished editors or publish missing template families.

## Result

25 tables added to the existing ice_documents table: 26 application tables total.
All 16 pre-audit document records were preserved unchanged (including revision
numbers and private content). Existing service/workspace/staff/session/quote saves
populate the domain tables through an AFTER trigger in the same transaction.
A failed projection/relationship constraint rolls back the original save too.
Login attempt reservations now use their own atomic database counter.

## Table inventory and actual wiring

| Tables | Project source/use | Current saving behavior |
| --- | --- | --- |
| ice_documents | src/lib/supabase/storage.ts | Existing authoritative document API, optimistic revisions and cleanup retained. |
| ice_services | src/lib/admin/content-store.ts | Every catalogue save/workflow action synchronizes the complete record plus queryable service ID, slug, name, status and version. 12 existing services copied. |
| ice_cms_workspaces | src/lib/blocks/store.ts | Workspace identity, schema version and database revision; synchronizes every builder/workflow save. |
| ice_blocks | Block Library | Independent block records with separate draft/published snapshots, status, source, owner and versions. 13 existing blocks copied. |
| ice_templates | Managed template designer | Actual custom templates; kept distinct from architecture specifications. No managed templates existed at the audit. |
| ice_pages | Page Composer | Actual composed pages, canonical paths, metadata, context and snapshots. Two existing review-build pages copied. Uniqueness enforced per workspace. |
| ice_template_slots | Template designer | Ordered slots for both draft/published snapshots, block contract FK, R/C/O rule. Filled automatically when templates are saved. |
| ice_page_placements | Page Composer | Ordered slots for both snapshots, enabled state, block contract and block-record relationships. 54 existing placements copied. |
| ice_content_history | Service/composition revision histories | Action, actor, version and timestamp extracted on every save. The copied baseline records had no history events. This is a queryable projection of application history, not an independent immutable security log. |
| ice_staff_accounts | src/lib/admin/auth.ts; admin:setup | Existing username and salted scrypt hash, maintained on credential rotation. Private table, no Supabase Auth user conversion. |
| ice_staff_sessions | Staff session creation/logout/expiry | Hashed session-token ID, credential fingerprint and expiry. Deletes cascade when source sessions are removed. Username/fingerprint binding remains authoritative; mutable username is deliberately not an account FK. |
| ice_quote_drafts | src/lib/quote/store.ts | Cleaning answers, service/locality context, versions, attribution and expiry synchronize on save; reset/expiry source deletion cascades. Contact fields are excluded. |
| ice_login_throttles | src/lib/admin/login-throttle.ts | Atomic five-attempt/15-minute counter, shared across app instances; successful login clears it. Test scopes are isolated. No raw IP/password stored. |
| ice_business_settings | src/config/site.ts | Existing business name, phone and description seeded with provenance and draft status. Public UI still reads code configuration; there is no business-settings editor yet. |
| ice_states | Existing NSW directory | NSW seeded only. No fabricated national register. |
| ice_regions | Locality.regionIds model | Empty pending sourced geography import/editor. |
| ice_localities | src/types/content.ts; src/data/locations.ts | Stable planning-sydney-nsw ID preserved; explicitly marked planning, not verified. Current directory/finder remains code-driven pending geography repository wiring. |
| ice_locality_postcodes | Locality.postcodes model | Existing 2000 attribute seeded. A postcode never replaces a locality primary key. Lookup index provided. |
| ice_locality_regions | Locality.regionIds model | Many-to-many links, empty pending actual register data. |
| ice_block_contracts | src/config/block-contracts.json | All 44 source specifications seeded; code remains the renderer/contract authority. |
| ice_template_contracts | block-contracts.json and template-reference.json | All 20 architecture families seeded with source metadata; these are specifications, not published pages. |
| ice_template_contract_slots | Original template specifications | All 177 ordered source placements seeded, with block FKs and visibility rules. |
| ice_service_scopes | ServiceScope interface | Empty durable model for future versioned/approved scope editors. Existing narrative draft scope is already saved as content blocks; no duplicate booked-scope promise was invented. |
| ice_evidence | EvidenceRecord interface | Empty model for case studies, reviews, credentials and media evidence with source/consent/approval gates. No demo reviews/jobs copied. |
| ice_evidence_services | EvidenceRecord.serviceIds | Indexed many-to-many evidence/service relationship. Empty with evidence. |
| ice_price_schedules | PriceSchedule interface | Empty versioned AUD schedule metadata with tax presentation, effective date, rules source and approval gates. No invented price/rule rows. Estimator remains disabled. |

## What deliberately stays outside database storage

- Browser-only sidebar collapse preference is device UI state, not business data.
- Builder undo/redo, selections, drag state and iframe messages are transient until
  Save. Existing saved content and revision histories are durable.
- Proposed customer names/email/phone/consent remain memory-only because online
  submission is explicitly disabled. No lead/booking/CRM-delivery tables or sending
  behavior were invented. Persisting contact fields needs the approved submission
  flow, retention and receipt contract first.
- React renderers, styles, fonts, route functions, immutable reference specifications
  and validation code remain code assets. Database contract copies support querying
  and relationships, not executing code from the database.
- Static local images/logo/font licences remain versioned files. The evidence model
  can represent future media provenance; storage buckets/upload editors are not
  created without an actual upload workflow. Current assets are not job evidence.
- Guides/blogs/policies use page/template/block records when their families are
  implemented; there is no separate implemented article/booking/product entity to
  justify speculative duplicate tables.

## Ownership, transactions and constraints

ice_documents remains the application's authoritative write boundary. Dedicated
content/auth/draft tables are transactionally maintained projections. Do not manually
edit a projection expecting it to rewrite the source document. Business/geography/
contract/scope/evidence/pricing tables are separate seed or future domain stores,
not claimed as active UI editors. The trigger is SECURITY INVOKER with a fixed empty
search_path. It has no privileged definer escalation and no anonymous execution grant.

The full workspace projection is rebuilt transactionally per workspace save to
preserve atomic dependency checks and draft/published relationships. This retains
the current 1,000-record-per-collection review limit. It is not a scalable per-record
CMS implementation; use a future transactional per-record repository when required.

Every table has RLS enabled. PUBLIC, anon and authenticated have no table grants;
service_role alone has application access. Publication stays in guarded server
loaders. Every FK has a leading index. Page-placement block references are deferred
until transaction completion, allowing an atomic workspace replacement. Unavailable
optional placements can remain disabled with no block reference. Stable IDs and
state-local slug uniqueness are enforced; postcodes are attributes/relations.

Single-operator login remains; database throttle retains the prior global staff
limit rather than inventing IP-based identity behind an unconfigured proxy. Invalid
or expired sessions still fail closed. Quote cleanup remains traffic-triggered;
independent scheduled retention and backup recovery drills remain launch work.

## Migrations, commands and verification

- supabase/migrations/20261126042954_domain_storage_audit.sql
- supabase/migrations/20261126043035_shared_login_throttle.sql
- pnpm migrate:domains: private source backup, transactional create/backfill,
  no-overwrite seeded records, original source equality and checksum receipt.
- pnpm test:database: SQL catalog/RLS/grant/index audit, data equality, relationship
  and approval gates, API anonymous denial and concurrent login-limit behavior.
- pnpm test:supabase: live application writes, projection equality, cascade cleanup,
  auth, concurrency, expiry/reset and public foundation using isolated QA records.

Initial schema tests passed for all 26 tables, exact source/projection equality,
44/20/177 reference counts, locality identity, FK indexes, constraints and atomic
login limits. Lint/typecheck/build and existing admin/builder regressions passed.
Final verification results are also recorded in PROJECT-STATUS.md.

Supabase hosted advisors were attempted but require a Management API access token,
which is not configured. Database catalog/API security checks ran successfully;
these are not represented as the hosted Advisors report. CLI-generated migration
files are applied by the repository's Postgres runner and have private checksum
receipts; they are not a claim of a linked/local Supabase CLI migration-history sync.

Next: review the tables in Supabase, then implement geography/business settings
repositories/editors as their roadmap features are built. Scope/evidence/price
editors, real register import, roles and remaining template-family work stay open.

CLI migration-history listing was also attempted: no local Supabase/Docker stack
is listening on port 54322. Hosted schema was verified through the configured
Postgres connection; local CLI history synchronization remains unverified.

Final context migration: 20261126044145_domain_context_relationships.sql adds
service FKs for pages/quote drafts and distinguishes built-in template contract
FKs from workspace-local custom template FKs. Deferred relationships permit atomic
backfill/workspace replacement; every relationship has a leading index.
