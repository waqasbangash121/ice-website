# Project checkpoint

Updated: 26 November 2026 (Asia/Karachi).
Current phase: Phase 3 — Content administration.
Status: Supabase content, quote and staff persistence migrated and active; block/template/page creation, previews and working publication delivered; full CMS acceptance
remains open. Phase 2 review build remains complete with production activation deferred.

## Start here when resuming

1. Read this file, ROADMAP.md, ARCHITECTURE.md, PHASE-2.md and PHASE-3.md.
2. Run git status and inspect any uncommitted changes.
3. Read the relevant installed Next.js documentation before editing.
4. Next: review DATABASE-AUDIT.md and SUPABASE.md, then restart any existing dev server; read TEMPLATE-REFERENCE-AUDIT.md, implement B03/B05 and connect managed
   homepage/directory families, then variant rules and checklist contents/printing.
5. Do not enable CRM submission, publish prices or remove noindex automatically.
   The user explicitly requested disabled delivery and draft content.

## Source checkpoint and next session

25 November 2026: user requested committing and pushing the current implementation
before continuing tomorrow. Checkpoint includes visual page/block/template builders,
admin UI polish, collapsible/history-safe navigation, the architecture catalogue and
reference-driven drafts/publication gates. Latest lint/typecheck/build and expanded
admin regressions passed; browser/foundation verification is recorded below.
Resume with TEMPLATE-REFERENCE-AUDIT.md and implement B03/B05 before connecting the
remaining homepage/directory families. Full Phase 3/4 acceptance remains open.
Credentials/private data stay ignored; repository publication is not site deployment.

## Latest delivered checkpoint

- Thoroughly reviewed the supplied architecture HTML (matching recorded SHA-256),
  all twenty specs, 41 demo layouts/variants and runtime interactions. Verified all
  177 ordered placements against the HTML. See TEMPLATE-REFERENCE-AUDIT.md.
- Added a visible searchable 20-family catalogue and protected specification pages
  containing purpose, variants, evidence, links, mobile/technical rules and acceptance.
- All twenty references create complete private design drafts. Planned sections are
  retained and labelled; required reference functions and family identity are protected.
- Designer includes source guidance/readiness, all 40 content-block contracts for
  planning and duplication of saved layouts. Existing schema-2 records remain valid.
- Server blocks approval/publication for missing required renderers and unconnected
  families. A03/A06 stay connected; conditional unavailable blocks remain omitted.
- Page creation enforces service/locality context for A03/A06 and their derivatives.
- Passed lint, typecheck, production build, expanded admin regression (all 20 imports,
  required-slot/family guards, publication holds and context rules), builder tests
  and public foundation checks. Browser checked search/spec/import/save/duplicate,
  missing-renderer errors, 390px inspectors/spec navigation and no console errors.
- This is reference-driven template administration, not completed production coverage
  of all twenty families. Variant rule engine, evidence/media models and family wiring
  remain open. Included in this source checkpoint; demo prices/reviews/jobs were not imported.

- Added a desktop sidebar icon rail with accessible collapse/expand controls and
  a saved local browser preference. Mobile retains the full labelled toggle menu.
- Replaced shell `:has(.page-builder)` selectors with active-pathname editor state;
  hidden retained routes no longer select builder padding, width or topbar styles.
- Removed shell/navigation overrides from builder.css. Sidebar geometry now uses
  one width variable, with explicit expanded/collapsed/mobile rules in studio.css.
- Navigation resets its mobile menu on route changes and supports Escape/focus
  return. Preview iframes stay hidden until measured and clamp their scale safely.
- Passed lint, typecheck, production build and admin/builder regressions. Browser
  checked collapse/reload, repeated Back/Forward across all three builder types,
  menu reset and preview fit. No overflow at 390, 700/701, 900/901, 1150/1151 and
  1440px in the tested views; no observed console errors. Included in this source checkpoint.

- Polished the full admin UI: branded sign-in, responsive sidebar with active-route
  states and mobile toggle, workspace topbar, consistent typography/cards/forms.
- Added shared searchable libraries for pages, blocks, templates and services,
  with combined status/type filters, live result counts and recoverable empty states.
- Dashboard uses actual counts (including custom templates), review/approval queue
  and recent saved revision activity across all four content collections.
- Reorganised settings as readable access/integration/capability panels and added
  a page-creation guide. Original architecture registries are collapsed references.
- Verified lint, typecheck, production build, admin integration, builder model tests
  and public foundation checks. Browser checked desktop/mobile navigation, combined
  filtering/clear, empty template state, form focus/overflow, settings, service save
  and review, populated dashboard activity, and page-builder shell compatibility.
- Included in this source checkpoint. No production activation or content migration.

- Block and custom-template builders now match Page Studio: three panels, live
  desktop/mobile previews, inspector, undo/redo, keyboard save and responsive tabs.
- Drag block items/FAQs/links or template slots; template section library supports
  click/drop additions. Required introduction and trailing CTA constraints remain.
- Preserved owner/source, shared usage, variants, revision workflow and template
  structure locks. Dirty drafts disable saved workflow actions.
- Browser verified creation/save, live text, pointer dragging, keyboard movement,
  template publication/page availability and used-template locks. Mobile 390px
  preview selection opens the inspector without horizontal overflow or console errors.
- Lint, typecheck, build and existing admin/builder checks passed. Template canvas
  uses labelled structure placeholders; production CMS acceptance remains open.

- Replaced the long page form with a visual Page Studio: layers/library, large
  live canvas and section/page inspector, with responsive panel navigation.
- Native drag/drop reorders layers and places compatible shared content directly
  on canvas sections. Arrow-key handles, move buttons and touch layer handles
  supplement mouse dragging. Required/pinned template constraints remain enforced.
- Inspector edits headings, text, items/FAQs and related links with live draft
  preview. Save draft persists changed shared drafts then the page; partial
  failures retain edits and report which stage failed. Publication stays separate.
- Added undo/redo for unsaved edits, keyboard save, source/SEO settings, revision
  history and clear save/workflow states. Successful saves reset undo history.
- Refresh synchronizes saved shared records/versions while retaining unsaved local
  edits and stale-write protection. These builder changes are included in this source checkpoint.

- Added Create block, Create template and Create page flows. Twelve supported
  block structures include general editorial sections; template slots can repeat
  block types. Custom templates publish before page creation.
- New pages reserve unique public URLs and return HTTP 404 until publication,
  then HTTP 200 with published content/metadata without rebuilding.
- Added the public catch-all and publication gate; kept existing routes intact.
  Published new pages are selectable in related-link blocks.
- Schema-1 records upgrade to schema 2 with templates/slot identities, preserving
  existing blocks/pages/history. Used template structures are locked; make a new
  template for layout changes. IDs and page routes stay stable after creation.
- Public catalogue/composed pages now read request-local snapshots. This resolves
  the earlier stale-publication issue; metadata/body use consistent current data.

- Added an embedded page preview directly inside `/admin/pages/{id}` with desktop
  and mobile views. Unsaved block selection/order updates live; Refresh blocks
  reloads saved shared-block drafts without losing the unsaved composition.
- Preview stays alongside the editor on desktop and above it on narrow screens.
  Preview links cannot navigate away; the iframe route remains staff-protected.

- Added Block Library, Page Composer, Template Registry and private full-page previews.
- Extracted all 44 contracts and 20 ordered template specifications. Eleven
  renderers and thirteen shared records power existing A03/A06 service pages.
- Editable metadata/intent, record variants, required-slot/type/order checks,
  shared-record impact and dependency-aware page approval/publication.
- Both service pages render shared published records; previews use authenticated
  saved drafts. Full block/template coverage remains open.

- Added `/admin` Content Studio based on the user's supplied local reference.
- Staff login, service catalogue editing, private saved-card previews, owner/source
  tracking, revision history and draft/review/approval/publication transitions.
- Separate draft/published snapshots prevent unpublished edits reaching public cards.
- Local setup: `pnpm admin:setup`; restart and open `/admin/login`. No default credentials shipped.
- Local filesystem adapter and one operator only; see PHASE-3.md for exact limits.
- Admin source and handoff are recorded together in this repository checkpoint; website deployment remains separate.

- End-of-lease service page, NSW/Sydney directory and Sydney service example.
- Shared two-step quote review flow with service/locality context.
- Server-side cleaning drafts, autosave/recovery, fixed 24-hour expiry, reset and
  optimistic concurrency. Contact fields stay in browser memory only.
- CRM disabled in both UI and backend; no enquiry or booking is acknowledged.
- Existing-site scope topics, photograph and icons; provenance in SOURCE-INVENTORY.md.
- Initial Phase 1 brand/shell/domain foundation retained.
- Roadmap, architecture, technical notes and integration tests updated.

## Favicon follow-up (24 November 2026)

- Replaced the Next.js starter favicon with the existing ICE site icon.
- Added 192px browser and 180px Apple touch icons through Next.js file conventions.
- Removed the full-width logo metadata override; phase status is unchanged.
- Verified production build and icon HTTP responses/metadata before pushing.

## Verification

25 November admin checkpoint:
- Visual-builder checks: lint/typecheck/build, three focused drag/drop model
  tests, admin suite, foundation verification and all quote journey tests passed.
- Browser verified actual layer dragging, library-to-iframe drop, canvas selection,
  live text edits, undo/redo, saved order/content recovery, keyboard reordering,
  external shared-draft refresh and subsequent save, approval gating and 390px
  panel navigation without horizontal overflow. No observed console errors.
- Physical touch-device drag testing remains open; pointer handlers and explicit
  move/add controls exist. QA uses temporary isolated records/credentials only.
- Creation/publication follow-up: passed lint, typecheck, build and the expanded
  admin suite twice consecutively. Actual private-404 → published-200 behavior,
  metadata, repeated slots, migration, collisions and draft isolation are checked.
- Browser verified creating/publishing blocks and template, creating/composing a
  page, embedded preview, approval/publication and the actual new public URL.
- Passed foundation and all three quote-journey tests on isolated localhost:3003.
  No observed console errors in the browser flow. Temporary QA data are separate
  from user records; owned QA server stopped. Checks accompany this source checkpoint.
- Earlier intermittent publication freshness assertions are resolved by the
  request-local snapshot change; production caching/database design remains open.
- Embedded-preview follow-up: passed lint, typecheck and build; extended admin
  integration suite passed on rerun, including anonymous iframe denial and
  authenticated embedded draft content. One run failed the existing immediate
  post-publication metadata assertion; metadata freshness remains a follow-up
  before production acceptance, despite the passing rerun.
- Browser checked embedded render, live unsaved record selection, 390px preview,
  refresh preserving unsaved composition, intercepted quote links, narrow admin
  layout without overflow and no browser console errors in the checked flow.
- Passed lint, typecheck, production build and isolated `pnpm test:admin`.
- Passed existing foundation checks (eight pages) and all three quote journey tests.
- Authenticated browser checked desktop composer, block/page saves, saved-draft
  preview and 390px editor/preview. No observed horizontal overflow or final console
  errors. HTTP tests cover shared publication and dependency-aware approval gates.
- Extended admin integration tests passed repeatedly after correcting cache keys
  and route invalidation. Final build regenerated without synthetic test records.
- No production staff credentials, hosting, database or media service configured.
- Production QA server stopped at session end. No website deployment performed.

Previous Phase 2 verification:
- Passed: pnpm lint, pnpm typecheck and pnpm build.
- Passed: pnpm verify:foundation http://localhost:3001 (eight public pages, service
  count, links/anchors, metadata, robots and HTTP 404).
- Passed: pnpm test:journey (server sessions, expiry/deletion, validation, conflicting updates,
  attribution, context, conditional answers, reset and disabled submission).
- Browser checked at 1440px/390px: service/Sydney context, errors, Studio/Other,
  review, edit-and-refresh recovery, disabled send, reset and locality finder.
- No observed horizontal overflow or browser console errors at tested widths.
- Temporary QA production server is stopped at session end.
- The previous Phase 2/favicon checkpoint was committed and pushed to origin/main.

## Deferred work / limits

Phase 2 is a review build, not production lead acceptance. The CRM and estimator
are deliberately disabled. Final copy, scope, policies, consent and questions need
approval. Sydney is a sourced planning example pending official-register reconciliation.
Other services have catalogue/quote entry, not full service-detail templates.

Draft storage is an ignored private .data/quote-drafts directory suitable for local
single-node review, not a multi-instance production database. See PHASE-2.md for
expiry, retention, cookies and deployment requirements. No live credentials or
customer contact records are committed. CMS and website hosting are not configured.

## Development environment

Use WSL Git from /home/waqasbangash/apps/ice-website; Windows Git cannot reliably
read this UNC working directory. Source /home/waqasbangash/.nvm/nvm.sh for Node
22.23.2 and pnpm 10.10.0 on this workstation.

Commands:
- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm start --port 3001 (production QA)
- pnpm verify:foundation http://localhost:3001
- pnpm test:journey (run against this checkout on localhost:3001; expiry test edits its own fixture)
- pnpm dev (local development)

Request tool escalation if WSL/network access is denied. Windows Git Credential
Manager is available at /mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe
for per-command Git overrides; never store tokens in the repo.
Live-site network reads may need executor escalation. Do not change live WordPress
content or its quote integration while working on this custom site.

## Session handoff rule

Update this file and phase checkboxes at session end with actual checks, remaining
limits and an exact next step. Keep the handoff and code in the same commit.

## Supabase connection setup — 26 November 2026

Added the Supabase JS server client, a credential-safe `pnpm verify:supabase`
command and an authenticated Settings connection indicator. Existing .env.local
contains the project URL and publishable key; values were not printed or committed.
The live Data API probe returned HTTP 401: credentials are not yet verified.
CMS records, staff sessions and quote drafts continue to use the local adapters.
No records or database policies were changed. Private CMS migration needs a server
secret or a Supabase Auth design; a publishable key alone does not authorize the
existing local staff identity. Next: correct the URL/key pair and rerun the probe,
then inspect the existing schema and implement transactional private storage.
Phase 3 acceptance remains open.
Verification: lint, typecheck and production build passed on 26 November 2026.
Live connectivity check failed with HTTP 401; no successful database connection
or migrated data is claimed. Correct credentials are the next required input.

## Supabase credential recheck — 26 November 2026

Updated credentials checked without printing values or reading table rows.
The SUPABASE_SECRET_KEY successfully authenticated to the Data API (HTTP 200).
The NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY still returned HTTP 401 despite having
the expected prefix. Server connectivity is verified; the public key needs correction.
Existing CMS/draft adapters remain local; no migration or policy changes performed.
Next: use the verified server credential for private transactional storage after
schema inspection, and replace the rejected publishable key with the project key.

## Package installation recovery — 26 November 2026

The user's npm install crashed in Arborist Link.matches while traversing the
pnpm-managed node_modules tree. Installed the requested Supabase JS/SSR packages
using pnpm; @supabase/ssr 0.12.7 added, existing JS client retained. Typecheck passed.
No package-lock.json was created. Continue using pnpm for this checkout.
Next: inspect Supabase schema and implement the private transactional adapter;
public key correction and full Phase 3 acceptance remain open.

Latest requested credential recheck (26 November 2026): publishable key HTTP 401;
server secret HTTP 200. Read-only requests only, no records retrieved or changed.
Next step remains correcting the publishable key and inspecting schema before
private storage migration. No milestone or acceptance status changed.

## Correction: publishable key verified — 26 November 2026

Supersedes earlier reports that the publishable key was invalid. The previous
probe requested /rest/v1/, whose schema endpoint rejects publishable keys with
"Secret API key required". The key was not the problem. No inherited environment
overrides or duplicate definitions were found. Official SDK table request reached
PostgREST successfully (PGRST205 missing-table response).
Corrected both CLI verification and admin Settings to probe a reserved nonexistent
table with limit=0, accepting only success or HTTP 404/PGRST205. This verifies API
authentication without reading records; it does not verify table permissions.
pnpm verify:supabase now passes. Server secret was already verified. No key
replacement is needed. CMS storage remains local; next inspect schema using the
server secret and implement private transactional adapters. Phase 3 remains open.
Verification after probe correction: live Supabase check, lint, typecheck and
production build all passed. No database rows or policies were changed.

## Supabase migration — 26 November 2026

Supersedes local-storage instructions above for the normal checkout. See SUPABASE.md.
Migrated 15 records transactionally: all catalogue seeds/current records, the complete
saved composition workspace, the existing operator username/salted password hash and
an unexpired staff session. No unexpired quote drafts existed at import; new drafts
now use the database adapter. Existing files and private backups remain retained.
Enabled ICE_STORAGE=supabase after verifying the migrated credentials; removed the
local staff credential variables. Admin login/password are preserved, using private
Postgres records rather than Supabase Auth. Credential rotation now updates the DB.
CAS revisions protect service/workspace/quote writes; no anonymous table access.
Initial live checks passed: DB-only staff login, logout/rotation revocation, private
CMS saves, anonymous denial, concurrent service/quote writes and quote expiry.
Lint/typecheck/build, local admin and builder regressions passed. Final reset/public
foundation follow-up is being recorded below. Full CMS/template acceptance stays open.
Next: restart any already-running user dev server, review admin saves on Supabase,
then resume B03/B05/template family wiring. Shared login throttling, scheduled expiry
cleanup and production backup restore verification remain launch limitations.

Final verification: lint, typecheck and production build passed with Supabase active.
Live isolated Supabase suite passed, including actual quote reset deletion and the
8-page/12-service foundation checks (links, metadata, robots and HTTP 404).
Existing admin and builder regressions passed. QA rows were cleaned and owned QA
servers stopped. No website deployment or Git push performed. Restart the user's
already-running development server to load the new environment selection.

## Admin instant-navigation fix — 26 November 2026

Added a shared accessible loading fallback and loading.tsx boundaries at every
workspace page segment. A boundary only in the shared workspace layout (or only
at its root loading file) cannot cover all narrower client-navigation render scopes.
Supabase reads stay uncached and staff authorization remains in each page.
Extended the live integration test with SUPABASE_TEST_DEV=1 and authenticated
requests across dashboard, blocks/pages/templates/services/settings, plus checks
for uncached-data validation diagnostics in response bodies and server output.
Passed development live Supabase suite and public foundation, lint/typecheck/build.
No schema or policy changes. Physical browser navigation was not automated in this
check; development validation runs at the shared-layout boundaries on these loads.
Next: reload the user's admin and verify navigation, then resume B03/B05 wiring.
Final follow-up: production live Supabase/public foundation and admin regressions also passed. Isolated QA rows removed and owned servers stopped.

## Domain table audit — 26 November 2026

See DATABASE-AUDIT.md for the full source-to-table inventory and actual editor wiring.
Created 25 additional tables (26 including ice_documents), indexed FK relationships,
private RLS/grants and invoker-rights transactional projection synchronization.
Preserved all 16 current source records unchanged. Existing application saves update
services, blocks/templates/pages, both snapshot placement/slot relationships,
histories, staff credentials/sessions and quote rows in the same DB transaction.
Seeded existing business/NSW/planning Sydney and all 44/20/177 reference contracts.
Scope/evidence/pricing/regions stay empty pending real data and editors. Static
settings/geography are seeded models, not yet live admin-managed repositories.
Moved process-memory login limits to a private shared atomic database counter.
Passed schema catalog/API checks, source equality, constraints, indexed FKs,
concurrent throttle behavior, live app-to-projection saves/cascades, public foundation,
lint/typecheck/build, local admin and builder regressions. Hosted Advisors attempted
but unavailable without a Management API token; SQL/API checks are recorded instead.
No contact persistence, CRM activation, pricing publication, indexation or deployment.
Next: review DATABASE-AUDIT.md/tables; wire business/geography repositories when
implementing B03/B05, then resume family coverage. Full Phase 3 acceptance stays open.

Supabase CLI local migration listing is unavailable because the local stack is not
running. Hosted table creation and live SQL/API checks are verified independently;
no local/hosted CLI migration-history synchronization is claimed.

Final audit verification: migration rerun preserved all 16 source records; final
live Supabase tests passed after context FKs were applied (including related-table
updates, cascade cleanup, concurrent saves, expiry/reset and public foundation).
Expiry QA uses a fixed historic fixture and checks the fixture update succeeded.
Lint/typecheck/build, database catalog/constraint/index tests, admin and builder
regressions passed. Owned QA rows/servers cleaned up. No source push or deployment.

## End-of-session source checkpoint — 26 November 2026

User requested committing/pushing this verified checkpoint and resuming tomorrow
(27 November 2026, Asia/Karachi). Includes Supabase persistence/credential migration,
all 26 application tables, transactional domain synchronization, shared login
throttling, admin loading boundaries, operational/audit docs and installed Supabase
skills/lock metadata. Secrets/private data/backups and CLI temp files stay ignored.
Verification: lint, typecheck, build, database schema/privacy/constraint/index audit,
live Supabase saves/projection checks, public foundation, admin and builder suites
passed. Source documents preserved. Hosted Advisors and local CLI history limits
are recorded in DATABASE-AUDIT.md; full Phase 3/4 acceptance remains open.
Exact next session: read this checkpoint, DATABASE-AUDIT.md, SUPABASE.md and
TEMPLATE-REFERENCE-AUDIT.md; check git status; review the user's restarted admin
against Supabase; then implement B03/B05 and managed homepage/directory wiring.
CRM/contact submission, estimator and indexing remain disabled. Git publication
is not website deployment. No reminder or automatic follow-up scheduled.
