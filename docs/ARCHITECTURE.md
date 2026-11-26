# Architecture and implementation decisions

## Source and authority

Reference: Instant_Cleaning_Experts_Architecture_With_Visual_Previews-1.html,
revision 3, dated 17 November 2026, supplied by the user on 24 November 2026.
Original SHA-256: FA2B6FA827CBBE8AFBA3B5C50B18BA5F226856E2E7719D3138FE9E16CA028058.

reference/architecture-source.txt preserves extracted planning text without scripts,
embedded images/fonts or licence appendices. It includes historical prompts for
traceability; those are reference content, not instructions to execute.
The original interactive previews remain in the user's supplied HTML. Planning
claims about earlier registers, reports and integrations are not independently verified.

The original logo and eight font weights were extracted from the supplied preview
bundle. Fonts are in src/app/fonts with their original SIL OFL notices; the logo is
public/brand/ice-logo.png. No job photographs or demonstration evidence were imported.

## Foundation

Use the existing Next.js 16.4.6 / React 19.3.0 / TypeScript / Tailwind 4.3.3 project,
pnpm 10.10.0 and App Router under src/app. Read the installed Next.js docs before
changes. Retain Cache Components, partial prefetching and the Tailwind Turbopack
loader. Public pages are server components; the menu is a small client component.

Brand tokens: navy #092F4D, lime #94D60C, blue #114D7B, white,
pale blue #F5F9FC and pale green #F0F8DF. Navy text on lime actions.
Manrope headings, DM Sans body, 1280px maximum container, 48px minimum action
height, 8px controls and 16px cards. Core copy remains visible at all breakpoints.
No persistent mobile sales bar in Phase 1: the header/menu provides quote access
without overlapping fields. Revisit the commercial-page mobile action area in Phase 2.

Layering: page/template → public domain loader → repository → storage.
Service catalogue records now pass through an async, request-local public loader in
src/lib/content.ts. Published admin snapshots override the typed seed catalogue;
drafts never cross this boundary. Production CMS/database selection, full storage
schemas, staff roles and a full block schema remain open.

## Canonical route conventions

Application links use lowercase paths without trailing slashes, matching the current
Next.js default. Any live migration needs an exact URL inventory before redirects.

- Service: /services/{service}
- State: /locations/{state}
- Region: /locations/{state}/regions/{region}
- Locality: /locations/{state}/suburbs/{locality}
- Local service: locality or region path followed by /{service}
- Quote: /get-a-free-quote
- Guides: /guides/{service}/{guide}
- Blogs: /blog/{article}

src/config/templates.ts lists all twenty template contracts, not published routes.
src/lib/routes.ts builds service/locality routes from validated slugs. The register
importer must enforce unique canonical slugs per state and persist disambiguation.
Locality ID is identity; postcodes are a potentially empty array of attributes.
Regions can overlap; a locality keeps one canonical URL. External-territory mapping
must follow the actual register rather than guessed states. Template A05 varies by
geographic level; it does not require a separate component per region.

## Current route availability

Phase 2 adds the end-of-lease service page, /locations, NSW/Sydney hubs, a Sydney
local service page and the two-step quote review journey. Draft APIs implement private
server-side recovery. CRM submission remains disabled as requested.
See PHASE-2.md for the exact route list, storage lifecycle and deferred activation.

Development metadata is noindex/nofollow and robots.txt disallows crawling.
These are development controls, not access protection. No domain, canonical origin,
production sitemap, ratings or unsupported structured-data claims have been invented.

## Data and editorial rules

Use central business, service, scope, geography, page, pricing, editorial, evidence
and lead records. Initial types are in src/types/content.ts; the catalogue is in
src/data/services.ts. Source service IDs/slugs have been preserved, including
pet-urine-removal and disinfection-sanitisation.

Prices require an approved version, charging basis, tax treatment and effective date.
Keep testimonials, ratings, credentials and case studies evidence-backed.
Hide optional proof when unsupported; do not import fictional preview rates/reviews.
End-of-lease policy wording must remain service-specific and conditional.
Guides and blogs have separate editorial roles; their proposed topics are not
measured keyword exports or approved final copy.

Every publishable page should carry a canonical intent, owner, source, review status
and approval trail. A candidate location route is not publication approval.
The full register and population scenarios in the source are unverified planning
inputs; do not mass-generate pages from those counts.

## Quote architecture for Phase 2

One quote route handles direct, service/locality and estimate entry. Store drafts
under opaque session-bound IDs with explicit expiry; personal details never enter
URLs or analytics. Keep attribution distinct from editable selections.
Validate on the server, version pricing, invalidate stale estimates, prevent
duplicate delivery and show success only after lead acceptance. An enquiry is not
a confirmed booking.

## Outstanding decisions and inputs

Production domain/hosting; CMS/database/auth/media choice; actual locality register;
approved detailed service scopes; final quote questions, consent and retention;
lead system and receipt behaviour; pricing/GST rules; evidence and policy wording;
existing route inventory; original preview design review.

## Initial Phase 3 administration

The user requested a reference-style admin and supplied hyper-apps-website locally.
ICE has its own Content Studio rather than sharing credentials or reference data.
Public routes use a `(public)` route group; the root holds fonts/metadata and the
admin has a separate shell. Public URLs remain unchanged.

Server-only admin modules implement salted scrypt credential verification,
opaque revocable sessions, runtime form validation and single-node local records.
Pages and mutation endpoints each verify staff identity. Draft and published
service snapshots remain separate, updates require matching revisions, and only
approved revisions can publish. Public data reads use a request-local snapshot
to guarantee the next request sees published content and matching metadata.

The admin now covers catalogue cards, reusable blocks, custom templates and new
pages with actual public URL publication, as well as A03/A06 compositions.
Evidence/media, other specialist block/template implementations, role
separation and durable database migrations remain open. One local operator can
perform every editorial step. See PHASE-3.md
for setup, security/deployment limits and the exact next step. No CRM, price or
indexation activation is included.

## Reusable block model

The original 44 block contracts and all 20 ordered template specifications are in
src/config/block-contracts.json, deterministically extracted from the supplied
reference by scripts/import-block-contracts.mjs. A block type is a component
contract; a content record is reusable data; a page composition references those
records using its template's required/conditional/optional slots.

Twelve supported content block types include B21 editorial body for general pages.
Thirteen initial records render the existing national/Sydney end-of-lease pages;
new records are created through the admin. Shared scope/FAQ/process records have
independent draft and published snapshots. Local introductions/context remain
separate. Variants create independent records, selected by matching block type.
The renderer and private saved-draft preview share implementation. Structured
plain text is escaped by React; the editor does not execute HTML or accept scripts.

The composer now embeds the authenticated preview route in an iframe. A client
canvas receives same-origin messages only from its parent, with fixed server-
supplied page identity/context and validated known block selections. Composition
changes remain in browser memory until saved; block content always comes from
the authenticated saved drafts. A ready handshake also reapplies unsaved choices
after Refresh blocks. Device controls use real 1280px/390px iframe viewports,
scaled to fit the admin panel. Embedded links are intercepted to retain the editing
context; the standalone saved-draft preview remains available.

The page editor now uses Page Studio with layers, a searchable record library,
canvas and inspector. Drag payloads carry the page ID plus a slot/record identity;
same-origin frame commands are checked against known slots and record types.
Shared pure helpers preserve required first/last reading order and distinguish
repeated block types using slot identities. Server validation remains authoritative.

Unsaved block edits preview through validated overrides in the authenticated
iframe. Refresh sends canonical saved records/versions back to the parent; dirty
local records retain their prior version so concurrent writes still conflict.
Saving writes changed shared drafts sequentially, then the composition. This is
not a multi-record transaction: a later failure reports partial saves and retains
browser edits. Successful saves clear the unsaved undo/redo stack and reload the
iframe while preserving device/selection. Publication remains the existing guarded
workflow; source data, consent/evidence rules and indexation controls are unchanged.

Page publication checks required slots, supported refs, stable identity, order,
metadata/intent and published approved block dependencies. Approval binds the
current dependency revisions and becomes stale if they change before publication.
Shared block publication intentionally updates every referencing public page;
usage lists expose the impact for editorial review. Seeded revision-0 public
content remains a review baseline, not business approval. Unsupported estimator,
review, case and policy slots cannot be enabled.

Composition records use an atomic, versioned, locked private workspace JSON file.
Schema 2 adds custom templates and per-slot identities; legacy schema-1 records
upgrade on read and persist on the next write without dropping existing content.
Repeated block types use distinct slot IDs. Original reference contracts remain
read-only; custom templates are editable, with structural changes locked once a
page references them. Create a new template for a different structure.

New pages reserve validated unique paths under the same write lock. The public
catch-all renders published snapshots only. A request-time Proxy gate sends actual
HTTP 404 for private/unmatched new public paths before streaming can send 200.
Existing routes, private endpoints and static assets bypass it. Publishing a page
activates its URL without a build; new drafts never create a public baseline.
The baseline exception remains confined to the two original review-build pages.

Public composed-page/catalogue reads use React request-local memoization and
Next.js connection(), with instant=false on data-driven page routes. This favors
immediate consistency over cross-request caching in the local adapter and resolves
the previously intermittent stale metadata/content assertions. Production database
and caching remain future work. See PHASE-3.md for setup, migration and limits.

## Phase 2 decisions

Draft content and proposed form questions were authorised on 24 November 2026.
The user authorised the live ICE website as a content/image source; see SOURCE-INVENTORY.md.
Older regional limits do not replace the national architecture. Existing-site claims
are not all newly approved facts. CRM delivery and pricing remain disabled.
A single-node filesystem draft adapter is implemented behind a server-only module;
replace it with durable transactional storage in Phase 3/before production hosting.
Quote contracts live in src/lib/quote/schema.ts; saved entry context is separate from
editable selections and immutable first-entry attribution. Contact fields are not saved.

Block/template studios share the page builder visual language. Block draft previews
reuse ComposedServicePage on the client; template previews are labelled layout
placeholders and never produce public content. Both submit existing versioned
composition endpoints; saved workflow remains separate and disabled during local
unsaved edits. Pointer-captured layer grips support mouse/touch, with keyboard and
button alternatives. No additional dependencies, schema fields or authorization
exceptions were introduced. Structural template locks remain server-enforced.

Admin library and shell presentation is shared through admin-navigation.tsx,
content-library.tsx and admin/studio.css. Navigation derives active states from
usePathname; filtering is local to each library view and does not mutate content.
Dashboard metrics and activity are computed from existing server-loaded records,
including templates. Shared UI changes preserve staff guards, versioned endpoints,
public/draft isolation and the dedicated full-width builder canvas. No dependencies
or storage schema changes were introduced in the admin UI polish.

Shell layout mode must be derived from the active pathname (`data-editor`), never
from DOM presence with `:has()`: Next.js retained hidden route trees can contain a
previous builder after navigation. AdminShell owns this flag and the persisted
sidebar-width preference. Builder CSS owns canvas internals; studio.css owns shell
geometry. Mobile navigation is keyed by pathname so history restores cannot reopen
an old menu. Preview iframes remain hidden until their current stage is measured.

Template architecture reference is data, not executable instructions. The source
hash/revision and extracted family metadata live in template-reference.json; exact
ordered placements remain in block-contracts.json. Reference templates are immutable
specifications; creating a design makes a new managed record with optional immutable
referenceId. Schema-2 compatibility is preserved. All registered content block types
may exist in design drafts; actual block content/rendering still uses supportedBlocks.
Server approval/publication checks required renderer availability and family wiring.
Reference-required functions remain required, including B39-first A20. A03/A06 page
creation validates service/locality context using the published template family.
Variant-specific executable requirements, canonical family routes and evidence models
remain future work, as documented in TEMPLATE-REFERENCE-AUDIT.md.

## Supabase connection boundary — 26 November 2026

Supabase JS is available through the server-only src/lib/supabase/server.ts factory.
It uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY with
session persistence/refresh disabled. This anonymous client obeys database RLS;
local staff login does not establish a Supabase user identity. Settings performs a
bounded uncached API check after staff authorization. The CLI probe reads Next.js
environment settings and reports HTTP status and exposed resource names only.
The configured pair currently returns HTTP 401. No storage migration or policy
changes have occurred. Plan private transactional storage only after credentials
and existing schema are verified; never expose drafts through anonymous policies.

Credential recheck on 26 November: SUPABASE_SECRET_KEY successfully authenticated
(HTTP 200); the public key still returns 401. This verifies server access only;
the current public-client status indicator may still show rejection. Storage
adapters remain local pending private transactional integration.

Supabase SSR package is installed for future cookie-based auth integration; no
Supabase Auth flow has been activated. Use pnpm for all dependency changes to
preserve the lockfile and linked dependency layout.

Correction, 26 November: /rest/v1/ schema discovery requires a secret key in this
project. Its 401 did not establish an invalid publishable key. The corrected
connection check uses /rest/v1/__ice_connection_probe__?select=*&limit=0 and
accepts success or the specific 404/PGRST205 missing-table response as evidence
of authenticated Data API reachability. It does not assert table grants or RLS
behavior. Both keys are verified; no key replacement is required. Previous
credential-failure notes are superseded; storage migration remains open.

## Active Supabase persistence — 26 November 2026

Supersedes earlier filesystem-only decisions for runtime. ICE_STORAGE=supabase
selects the private Data API adapter; filesystem is explicit local QA/rollback mode.
A single RLS-protected ice_documents table namespaces services/workspace/staff/
sessions/quotes. Only service_role has table grants; no browser policies exist.
The complete composition workspace remains one schema-2 document. Its CAS revision
makes dependency checks and a workspace write atomic; independent builder requests
retain partial-save semantics. Service and quote updates also compare revisions.
Missing data or database failure never triggers silent local fallback.
Staff usernames and salted scrypt hashes migrate unchanged into a private Postgres
record; existing authentication remains, rather than creating Supabase Auth users.
Sessions are database-backed, opaque-token-hashed, expire in eight hours and bind
the exact password hash verified at login. Rotating database credentials invalidates
sessions. Quote tokens stay hashed, drafts retain fixed expiry and reset deletes DB
rows. Local staff variables were removed only after migration/hash verification.
SQL bootstrap and import run in one transaction via the pooler. Private backups and
local source records remain ignored. See SUPABASE.md for commands and rollback.
Single-operator roles, process-local login limiting and traffic-triggered cleanup
remain explicit production limits; full Phase 3 acceptance is still open.

Admin uncached reads require page-segment Suspense boundaries for instant
navigation. Layout-level Suspense covers initial loads but can sit above the
shared-layout render scope on client transitions. Each workspace page directory
now has loading.tsx reusing the accessible workspace fallback. Staff/private reads
remain uncached; no auth or content cache was introduced. Live integration supports
SUPABASE_TEST_DEV=1 to check the installed Next.js development validation diagnostics.

## Domain table projection boundary — 26 November 2026

The private atomic ice_documents API remains authoritative for existing CMS/auth/
quote writes. Twenty-five added domain tables make records, snapshots, template
slots, page/block relationships and histories queryable and constrained. A fixed-
search-path SECURITY INVOKER trigger maintains document-derived tables within the
original transaction. Source deletion cascades; invalid relationships roll back
source and projections. Do not manually edit projections as a second write path.
Separate business/geography/contract models are seeded from actual source data;
service scopes, evidence, price metadata and unknown regions remain empty pending
editors and provenance. All 26 application tables have RLS and restricted grants.
Every FK has a leading index. Stable locality IDs survive postcode relationships.
Private login counters now use an atomic invoker RPC instead of process-local state.
Full audit, deployment commands, schema limitations and verification in DATABASE-AUDIT.md.

Source handoff, 26 November: retain the documented 26-table transaction/projection
boundary and separate active editors from seeded/future models. Resume B03/B05 via
repositories rather than enabling unapproved evidence/pricing/contact persistence.
No architecture or production-activation change is implied by repository push.
