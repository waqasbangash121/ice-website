# Phase 3 — Content administration

Updated: 26 November 2026 (Asia/Karachi).
Status: creation, composition, preview, publication and Supabase persistence implemented. Full
production CMS acceptance remains open.

## Scope and reference

The user requested an admin similar to niagarat.com and supplied the local
hyper-apps-website checkout. Its Content Studio informed the shell and protected
editing workflow. No credentials or private records were copied. The user then
required the original HTML's reusable blocks, embedded previews and creation of
new blocks, templates and pages with working publication.

All 44 original block contracts and 20 ordered template specifications are in
src/config/block-contracts.json. Regenerate with node scripts/import-block-contracts.mjs.
Specifications are not executable instructions or automatic proof/publication.

## Authoring workflow

- Block Library → Create block: choose one of twelve supported structures, enter
  content, owner and source, then save. Existing records can also be copied into
  independent variants. B21 editorial body supports general content pages.
- Templates → Create template: define an introduction and ordered, uniquely
  identified slots, including repeated block types. Set required/optional/
  conditional rules and editorial guidance. Review, approve and publish the
  template before using it for a new page.
- Pages → Create page: choose a published custom template (or implemented A03/A06),
  reserve a lowercase public URL and enter metadata, canonical intent, owner/source
  and optional existing service/locality context. New pages begin incomplete and
  private; select matching block records in the composer before review.
- Preview inside the composer, save, request review, approve, then publish. Every
  enabled shared block must have an approved published revision. Approval binds
  published template/block revisions; changed dependencies require renewed review.
- After publication, the chosen URL serves the published page immediately without
  rebuilding. Later page/block drafts stay private; publishing a shared block
  intentionally updates every referencing public page. Usage lists show its impact.
- Publishing a template makes it available for page creation; templates and blocks
  do not themselves create public URLs. Pages do. Navigation menus are not changed
  automatically; newly published URLs can be selected in related-link blocks.

Original A03/A06 pages retain their Phase 2 review baseline at revision 0, which
is not business approval. New pages have no public baseline and return HTTP 404
until publication. Existing URLs cannot be overwritten by new pages. IDs, route,
template and service/locality context are immutable after page creation.

A used custom template's slots are locked to preserve existing compositions.
Its name/description remain editable; create another template for a different
structure. Original A01–A20 specifications remain reference contracts; other
specialist renderers are not silently treated as implemented.

Supported renderers: B01, B02, B04, B06, B07, B08 (assessment copy only), B10,
B15, B16, B17, B21 and B40. Estimator, review, case, media and policy types remain
unavailable until their dedicated schemas/evidence rules/renderers exist. All
editable content is structured plain text; arbitrary executable HTML is not accepted.

## Embedded preview

### Visual Page Studio

The page editor now has a full visual layout: layers and searchable shared-block
library, a large live canvas and a focused section/page inspector. Drag handles
reorder sections; library records can be dropped onto compatible canvas sections.
Click the canvas to select a section. Arrow keys on layer handles and explicit
move/add controls are alternatives to dragging. Touch pointer handlers support
layer movement; physical-device drag QA is still open.

The inspector edits headings, labels, body text, FAQs/items and related links
without leaving the page. Edits preview live as validated draft overrides. Source,
owner, metadata, canonical intent, search preview and revision history are under
Page settings. Required sections cannot be hidden; the introduction/CTA remain
at the reading-order boundaries. Adding content uses the template's available
slots rather than silently changing the template's structure.

Undo/redo covers unsaved changes and resets after a successful save. Ctrl/Cmd+S
saves; Ctrl/Cmd+Z outside text fields undoes. Save draft writes changed shared
drafts before the page and reports partial failure while retaining browser input.
Shared publication remains separate, with usage/impact explained in the inspector.
The top bar keeps save, review, approval and publication separate and disables
advancing while unsaved changes remain. No new persistence schema is introduced.

Refresh reloads saved shared records/versions into the canvas and inspector.
Unsaved overrides remain local; dirty records keep their original version so
changes in another tab cannot be silently overwritten. Canvas commands/payloads
must match the current page, known slots and compatible records.

/admin/pages/{id} includes a desktop/mobile iframe using 1280px/390px viewports
scaled to fit. It is sticky beside the editor on desktop and above it on narrow
screens. Unsaved record selection/order updates live. Save shared-block edits,
then Refresh blocks to load them without losing the unsaved composition.

/admin/preview/{id} shows saved drafts; ?embedded=1 enables the live canvas.
Both require staff authentication. Messages must come from the same-origin parent;
identity/context and block data come from the authenticated server. Links are
intercepted in embedded mode. Session expiry offers sign-in in another tab.

## Local setup and storage

Run pnpm admin:setup interactively in the ICE checkout. Enter a username and a
password of at least sixteen characters; typing is hidden. The script preserves
unrelated settings and writes ADMIN_USERNAME and salted ADMIN_PASSWORD_HASH to
ignored .env.local. Restart the server and open /admin/login. No default password
is shipped. Run setup and restart again to rotate credentials and invalidate sessions.

Sessions are opaque, revocable, eight-hour records with HttpOnly/SameSite=Strict
cookies and Secure cookies on HTTPS. Mutations verify staff identity and origin.
Form parsing is bounded at 192 KB for compositions and 12 KB for sign-in/catalogue.
The browser editors preserve input on validation/network failures.

Private records: .data/admin/content, .data/admin/sessions and
.data/admin/composition/workspace.json. ADMIN_DATA_DIR can choose a private root.
Schema version 2 adds custom templates and slot IDs. Version-1 workspaces upgrade
in memory without dropping blocks/pages/history and persist atomically on the next
mutation. Older pending approvals may require renewed review. Back up the directory
before changing adapters; never expose it as static assets.

A workspace lock and atomic rename serialize writes; record versions reject stale
edits. After a crashed writer, stop it and have an operator clear workspace.lock.
The catalogue uses equivalent per-service locks. This remains single-node storage.
Each collection is capped at 1,000 records for local review.

## Public routing and consistency

The public catch-all resolves only published snapshots by canonical path. A
request-time Proxy gate returns actual HTTP 404 for private/unmatched new public
paths before a streaming shell can send 200. Existing public routes, assets and
admin/API requests bypass the gate. Reserved/private paths and duplicate URLs are
rejected on creation under the workspace lock.

Composed pages and catalogue lists now read a request-local snapshot rather than
cross-request content caches. Metadata and body use the same data. This resolves
the intermittent stale-publication checks seen in earlier sessions. These pages
use the installed Next.js instant=false option for blocking request data. Cache
Components remain enabled globally. Production database/caching design remains
open; this favors correct immediate publication during local review.

## Verification

- Page Studio: passed lint/typecheck/build, pnpm test:builder (three constraint/
  drag-payload tests), admin integration, foundation and quote journey regressions.
- Browser checked actual mouse layer dragging and library-to-canvas drop, canvas
  selection, live text edits, undo/redo, saving and refresh recovery, keyboard
  reordering, separately edited shared-record refresh and a subsequent successful
  save, approval gating and 390px panel navigation. No observed horizontal overflow
  after refinement or console errors in the final flow. Physical touch QA remains
  an explicit limitation; move/add controls are available on mobile.

- Passed lint, typecheck and production build.
- Passed the expanded admin integration suite twice consecutively: authentication,
  origin checks, private iframe routes, workflow/dependency checks, concurrency,
  source/identity validation, shared publication and credential expiry/logout.
- New coverage: schema-1 migration; block/template/page creation; unpublished
  template rejection; URL collisions/reserved paths; repeated template types;
  404 before and 200 after publication without a rebuild; metadata and draft
  isolation; shared updates on new pages; links to published new pages.
- Browser: created and published new blocks and a custom template, created a page,
  selected records in the embedded preview, saved/approved/published it and opened
  its public URL. Correct content, metadata, one H1 and no observed console errors.
- Existing foundation check passed (eight pages, links, noindex, robots and 404).
  All three quote-journey tests passed against isolated localhost:3003.
- QA credentials/data were temporary and separate from the user's local setup.
  QA server is stopped and no synthetic page is left in the user's content store.

## Limits and exact next step

Publication makes URLs available on the running website; it does not configure
hosting or deploy to an external domain. Content remains non-indexable; CRM and
numeric prices remain disabled. Single-operator access, process-local throttling,
local files, independent session cleanup and lack of historical rollback remain
production limits. Separate roles, managed identity/MFA, transactional database,
backups, media/evidence/consent and remaining block renderers are still open.

Next: choose production database/auth/media, migrate the adapters with explicit
migrations/backups and separate permissions, then implement the remaining original
block contracts and template-specific acceptance checks. Phase 3 is not complete.

## Visual block and template studios — 25 November 2026

Block and custom-template new/edit screens now share the Page Studio design:
three panels, live draft canvas, desktop/mobile width controls, focused inspector,
unsaved undo/redo, keyboard save and responsive panel navigation. Blocks preview
through the existing public renderer, with clickable content items and reorderable
FAQ/items/links. Templates show explicitly labelled structure placeholders and a
searchable section library; pointer/touch grips, keyboard arrows and move buttons
reorder slots while preserving introduction/CTA rules. Template structure remains
locked after page use; metadata is still editable. Owner/source, usage links,
variants and saved revision workflow remain available. Dirty edits disable saved
workflow actions. No storage schema or publication-policy changes were needed.

Verified: lint, typecheck, production build, existing admin integration and three
page-builder model tests passed. Browser QA on an isolated temporary store covered
new template and FAQ creation/save, persistence of reordered content, native mouse
pointer drags for template slots and FAQ items, keyboard movement, live answer edits,
undo, template review/approval/publication, availability for new-page creation and
used-template disabled structural controls. At 390px, panel navigation and preview
click-to-inspector worked without horizontal overflow; no observed console errors.
Template previews are structure samples, not a populated page or publishable content.
Current supported block types and single-operator filesystem limits still apply.
Next: review all three studios with the user, then choose production database,
authentication and media adapters. These UI changes remain local and uncommitted.

## Admin UI polish — 25 November 2026

The full workspace now uses a shared navy/lime visual system. Added client-side
active-route navigation and an accessible mobile menu, workspace topbar, branded
sign-in layout, content cards, consistent fields, status badges and focus states.
Pages/blocks/templates/services use one searchable library with combined status
and type filters, result counts, clear-filter recovery and empty states. Original
block/template contracts remain available in collapsed reference panels. Settings
now separates staff access, website controls and supported capabilities. New-page
creation has an adjacent three-step guide. Builders retain their full-width canvas.
Dashboard counts include templates; review queue and recent activity use existing
saved revisions across services, pages, blocks and templates. No fabricated metrics.

Verification: lint, typecheck and production build passed. Admin integration and
three builder model tests passed; updated the old dashboard-headline assertion to
the new dashboard section. Foundation checks passed for eight pages/twelve services,
internal links, metadata, robots and real 404. Browser QA on an isolated temporary
store checked sign-in, active navigation, search + status + type filtering, clear
filters and empty states, service save/review, resulting dashboard counts/activity,
settings, create-page form focus and existing page canvas. At 390px, mobile menu
opened/closed on navigation and the library/create form had no horizontal overflow.
No observed browser console errors. Temporary server/store are stopped/removed.

Limits: local single-operator storage/auth and existing supported block types remain.
Libraries currently filter loaded records in browser memory, appropriate to current
bounded local collections; large production collections will need server pagination.
Next: user review of the complete studio, then production database/auth/media adapter
selection. Keep Phase 3 acceptance open until production requirements are verified.

## Collapsible sidebar and navigation layout repair — 25 November 2026

The desktop sidebar can collapse to a 76px icon rail. Its non-sensitive preference
is saved in localStorage with a useSyncExternalStore subscription and a safe fallback
when browser storage is unavailable. Labels remain accessible via aria-label and
native title tooltips. Mobile ignores the rail geometry and retains full labelled
navigation. Escape closes the mobile menu and returns focus to its button; pathname
keys reset that menu for browser history as well as ordinary link navigation.

Removed shell/navigation selectors from builder.css and replaced all admin shell
`:has(.page-builder)` selectors with an explicit active-pathname `data-editor` flag.
Retained hidden builder DOM can therefore no longer force a library into builder
padding/width/topbar rules. studio.css owns the shared sidebar-width variable and
responsive collapse overrides. Preview scaling has a positive minimum; the frame
is hidden until ResizeObserver has measured its stage to avoid oversized flashes
on history restoration. Public page styles and publication policy are unchanged.

Verified lint, typecheck, production build, admin integration and three builder
model tests. Browser QA used isolated disposable credentials/content: collapse,
expand inside a builder, reload persistence, menu navigation, Escape, and repeated
browser Back/Forward through page, block and template builders and their libraries.
Checked 390, 700, 701, 900, 901, 1150, 1151 and 1440px layouts with expanded and/or
collapsed navigation across page/template builders and libraries; no horizontal
overflow in those checks. Verified final mobile menu closes after Back/Forward,
preview iframe fits its measured stage and no observed console errors. Temporary
server/store stopped and QA script removed. Cross-browser/touch-device exhaustive
coverage is not claimed. Next: user review of sidebar/history behavior, then resume
production adapter decisions; full Phase 3 acceptance remains open.

## Architecture-driven template administration — 25 November 2026

See TEMPLATE-REFERENCE-AUDIT.md for the full source review, twenty-family use/status
matrix, exact behavior delivered and remaining work. The user's original HTML hash
matches the recorded reference. All 177 placements match the original order, block,
R/C/O rule and contract. Extracted per-family metadata is in template-reference.json;
the 41 visual demos/runtime were reviewed as demonstrations, not business data.

Delivered catalogue/search, protected specification details, full reference design
import for all twenty families, source-aware inspector, planned block placeholders,
readiness and duplication. ManagedTemplate has optional immutable referenceId;
existing schema-2 records without it retain their behavior. Reference-required
functions cannot be removed/downgraded. All registered B types can be designed;
unsupported required blocks and unconnected families block server approval/publish.
A03/A06 are connected; unimplemented optional features stay disabled in actual pages.
Page creation now enforces their service/locality requirements on built-ins and
published reference-derived templates. Demo prices, reviews/jobs, lead delivery and
indexing remain disabled. No public route was replaced by a template draft.

Verification: lint, typecheck, build, expanded admin integration, builder model tests
and public foundation checks passed. Integration imports all twenty original layouts,
verifies full placement retention, protected requirements/identity, A20 publication
hold, A03 publication with omitted unsupported conditionals and page context rules.
Browser QA with disposable isolated credentials/store covered search, A08 specification,
all-nine-section import/save, required control locks, review/failed approval, named
B19/B20 readiness error, nine-section duplication, 390px inspector/spec navigation,
no horizontal overflow and no observed console errors. QA server/store stopped;
temporary scripts/extracts removed. User review remains the next UI acceptance step.

Next implementation milestone: B03 service selection and B05 geography directory
repositories/renderers, followed by managed A01/A02/A04/A05 wiring. Variant-specific
requirements and B19/B20 shared-scope checklist/contents/print are the next bounded
follow-ups. Full production Phase 3/4 acceptance is still open.

## Supabase cutover — 26 November 2026

Normal runtime now uses private Supabase storage for content, staff credential hash,
sessions and quote drafts. Existing username/password is preserved. Local setup and
filesystem paths above describe fallback/QA only. See SUPABASE.md for active setup,
credential rotation, transaction model, backup/rollback and remaining launch limits.
Full content administration acceptance remains open.

## Database schema audit follow-up — 26 November 2026

26 private application tables now cover the current saves plus explicit domain
contracts. Document-to-domain synchronization is transactional; source records and
current editors remain compatible. Business/geography/specification seeds are
separate from active admin editor wiring. The shared login limiter is now persisted
atomically in Postgres. See DATABASE-AUDIT.md for the complete inventory and tests.
Full Phase 3 CMS/family/editor acceptance is still open.
