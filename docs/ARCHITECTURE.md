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
Current service records are typed local data behind src/lib/content.ts; CMS and
database selection are intentionally deferred. Runtime validation, storage schemas,
permissions and a full block schema are future work; TypeScript types are not security checks.

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

Implemented: /, /services, /get-a-free-quote, /robots.txt and a custom not-found UI.
The quote route is an honest phone enquiry bridge; there is no submission backend,
calculator, booking confirmation or context persistence yet.
Home service links target real service-directory anchors. Planned service detail,
pricing, resources, proof and geography routes are not advertised as working pages.
The root provides homepage anchors for coverage, process and company introduction.

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
