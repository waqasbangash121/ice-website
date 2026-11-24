# Phase 2 — Customer journey review build

Updated: 24 November 2026 (Asia/Karachi).
Status: review implementation complete; production activation is deferred.

## Authorised scope

The user requested Phase 2 and explicitly instructed:
- Keep CRM submission disabled; CRM will be connected later.
- Use draft content and proposed questions for now.
- Reuse relevant data, images and content from https://www.instantcleaningexperts.com.au/.

Those decisions replace the original Phase 2 requirement for live lead delivery
during this milestone. There is deliberately no successful submission or booking state.
Final operational content and full production acceptance remain open.

## Delivered

- A03 end-of-lease service page with sourced scope topics, extras, process and FAQs.
- A04 locality finder and crawlable NSW/Sydney route chain.
- A05 Sydney NSW 2000 hub, plus A06 Sydney end-of-lease page using the shared template.
- Source-aware quote links carrying public service/location context and a stable sourced Sydney ID in saved records.
- Two-step proposed quote form for all twelve services, with extra end-of-lease questions.
- Server-validated cleaning drafts, autosave, manual continuation, editable summary,
  clear/reset, same-browser recovery, fixed 24-hour expiry and stale-tab conflict handling.
- First-entry attribution kept separately from editable service/location.
- Entry-context marker prevents original link parameters overwriting saved edits on refresh.
- Contact fields stay in component memory only; they are neither saved nor transmitted.
- Disabled submission button and server endpoint returning HTTP 503 with no acceptance.
- Existing-site photograph and service icons, without job/provenance claims.
- Development noindex/robots policy retained.

## Routes

- /services/end-of-lease-cleaning
- /locations
- /locations/nsw
- /locations/nsw/suburbs/sydney
- /locations/nsw/suburbs/sydney/end-of-lease-cleaning
- /get-a-free-quote
- /api/quote-draft (GET, POST, DELETE)
- /api/quote-submit (POST always rejects; delivery disabled)

Only Sydney NSW 2000 currently resolves in the finder. Unknown input leads to
an enquiry path, never an assertion that the area is unserved. The Sydney ID is a
planning/source record, not an invented official register ID. Resolve it against
the supplied register before broader geographic publication.

## Proposed questions

All services: service, suburb/postcode, property type, optional preferred date,
optional requirements (500 characters).
End-of-lease: bedrooms (Studio = 0), bathrooms, furnishing, property condition,
optional additional requirements and conditional Other description (500 characters).
Review only: first/last name, email, Contact Number, optional business name and a
proposed contact-consent checkbox. Contact data clears on refresh.

The live site's quote form informed contact and business fields. Its regional
Territory restriction and internal CRM fields (brand, source, status) were not
copied into the national customer flow. Final field requirements and consent
wording still require business review. Native date presentation follows the browser;
the review summary displays DD/MM/YYYY.

## Draft storage and lifecycle

src/lib/quote/store.ts is the development storage adapter. It uses Node filesystem
records in .data/quote-drafts, excluded from Git. QUOTE_DRAFT_DIR can override the
directory. Use an absolute private path if configuring it.

An HttpOnly SameSite=Strict cookie contains a random 256-bit token; its hash names
the server-side record. Cookie and record expire 24 hours after creation, without
sliding renewal. Secure cookies are used for HTTPS requests. Writes use a lock,
atomic rename and optimistic versions so conflicting tabs do not overwrite data.

Expired records are never returned. Cleanup runs on draft API usage (up to 500
records each call); deployment needs scheduled retention cleanup independent of
traffic. Cleaning notes could contain personal data if the visitor ignores the
instruction; do not log payloads or treat the draft store as public content.

This adapter is suitable for a single-node local review. Before multi-instance or
serverless hosting, replace it with transactional durable storage, confirm HTTPS/
reverse-proxy origin handling, configure abuse controls and define retention.
No API token, CRM endpoint or live credentials are configured.

The API limits JSON requests to 12 KB, checks same-origin mutations, validates
service/property/enumerations/dates/lengths, ignores contact fields and never trusts
browser-supplied pricing. There is no estimator to invalidate in this build;
service changes clear irrelevant end-of-lease answers instead.

## Verification

Passed:
- pnpm lint
- pnpm typecheck
- pnpm build
- pnpm verify:foundation http://localhost:3001
- pnpm test:journey (requires this checkout running locally on port 3001; the expiry test ages only its own synthetic draft fixture)

HTTP checks cover eight pages, twelve services, internal links/anchors, one H1 per
page, noindex, robots and actual HTTP 404.
Three API integration tests cover session isolation/recovery, TTL metadata and expired-record rejection/deletion, input
validation, origin/media-type/body-size rejection, stale-tab concurrency, immutable
attribution, entry-context validation, service-specific normalization, ignored
contact data, reset and disabled submission.

Browser checked at 1440px desktop and 390px mobile:
service → Sydney service → prefilled quote → validation → Studio and Other fields →
review, disabled submission, refresh recovery, edited service/location recovery,
draft reset and finder success/fallback. No horizontal overflow at tested mobile
width and no console errors observed. Sourced hero image loaded through next/image.

## Deferred activation work

- CRM destination, server-side delivery validation, idempotency, accepted/rejected
  delivery handling and real acknowledgement.
- Approved pricing rules/versioning/GST presentation and estimator.
- Final scope, exclusion, policy and consent approval.
- Authoritative geography register import/reconciliation.
- Production database, retention job, hosting, monitoring and operational review.

## Next step

Begin Phase 3 when requested: choose durable storage, staff authentication and media
management, then implement repositories and protected editing. Preserve the disabled
submission endpoint until the user explicitly requests CRM connection.
