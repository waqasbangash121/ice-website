# Phase 3 — Content administration

Updated: 25 November 2026 (Asia/Karachi).
Status: local creation, composition, preview and publication implemented. Full
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
