# Project checkpoint

Updated: 25 November 2026 (Asia/Karachi).
Current phase: Phase 3 — Content administration.
Status: local block/template/page creation, previews and working publication delivered; full CMS acceptance
remains open. Phase 2 review build remains complete with production activation deferred.

## Start here when resuming

1. Read this file, ROADMAP.md, ARCHITECTURE.md, PHASE-2.md and PHASE-3.md.
2. Run git status and inspect any uncommitted changes.
3. Read the relevant installed Next.js documentation before editing.
4. Next: read TEMPLATE-REFERENCE-AUDIT.md; implement B03/B05 and connect managed
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
