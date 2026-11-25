# Implementation roadmap

This is the shared delivery plan for the custom Instant Cleaning Experts website.
Read PROJECT-STATUS.md first for the current checkpoint. Status is based on working
code and recorded checks, not on whether a template has been listed.

## Phase 1 — Foundation
Status: complete (24 November 2026).

- [x] Apply supplied navy/lime brand tokens, spacing, control and card styles.
- [x] Extract supplied logo and self-host Manrope / DM Sans with font licences.
- [x] Add responsive header, mobile navigation, footer, skip link and breadcrumbs.
- [x] Add reusable container, section, action and page-introduction components.
- [x] Define twelve services, twenty template IDs and canonical route conventions.
- [x] Define initial content, locality, scope, pricing, evidence and quote-draft types.
- [x] Put public content behind a shared loader boundary.
- [x] Add a foundation homepage, grouped service directory and phone enquiry page.
- [x] Record architecture, phases, source provenance and resume instructions.
- [x] Complete lint, typecheck, production build and route/content checks.
- [x] Inspect desktop/mobile layouts, menu keyboard behaviour and real 404 response.
- [x] Commit and push the verified checkpoint.

Acceptance: responsive branded shell, typed domain foundation, working destinations,
documented route decisions, successful checks and an explicit handoff.
This phase does not implement all 44 blocks, twenty full templates, CMS, calculator
or connected form. The initial pages are development compositions, not approved copy.

## Phase 2 — Complete customer journey
Status: review build complete (24 November 2026). Production activation deferred.

The user requested draft content/proposed fields and disabled CRM delivery,
then authorised existing-site content and image reuse. See PHASE-2.md and SOURCE-INVENTORY.md.

- [x] Refine homepage with sourced imagery and improve service/context links.
- [x] Build A03 end-of-lease page with sourced draft scope, extras, process and FAQs.
- [x] Build A04 directory, NSW/Sydney A05 hubs and Sydney A06 service example.
- [x] Implement proposed universal/service-specific quote questions and review step.
- [x] Add opaque server-side drafts, recovery, reset and fixed 24-hour expiry.
- [x] Add contextual handoff, editable summary, errors and service-dependent normalization.
- [x] Verify session isolation, concurrency, validation, refresh and disabled submission.
- [x] Preserve explicit no-submission UI and backend rejection as requested.
- [ ] Reconcile the Sydney planning ID with the authoritative register before expansion.
- [ ] Obtain final business approval of scope, exclusions, form and consent wording.
- [ ] Connect the CRM and verify idempotent accepted/rejected delivery when requested.
- [ ] Enable estimator only after approved prices, GST display and versioned rules exist.

Review acceptance: service/locality discovery, editable saved draft and complete review
flow work without transmitting an enquiry. Achieved. Original production acceptance
(real lead receipt and approved operational data) remains deferred, not silently passed.

## Phase 3 — Content administration
Status: in progress (25 November 2026); initial local service-admin review build.

- [x] Add protected Content Studio shell and local single-operator sign-in.
- [x] Edit service catalogue cards with private previews, revision history and
  draft/review/approval/publication transitions; isolate unpublished changes.
- [x] Verify authentication, expiry/logout, workflow, cache invalidation and conflicts.
- [x] Import all 44 block contracts and 20 template placement specifications.
- [x] Add shared-block editing/variants and A03/A06 composition, preview and
  dependency-aware publication for the two existing end-of-lease pages.
- [x] Embed desktop/mobile preview in the composer with live unsaved composition
  updates and refresh of saved shared blocks.
- [x] Create new blocks, custom templates with repeated slots and pages with
  unique public URLs; verify private 404 and actual publication without rebuilding.
- [x] Upgrade version-1 composition storage without losing existing records and
  resolve stale publication metadata with request-local public snapshots.

These checks cover service cards, twelve block renderers, custom page compositions
and one operator, not the full acceptance
below. See PHASE-3.md for setup, reference, local storage and remaining limits.

- [ ] Decide database, media storage and staff authentication.
- [ ] Implement repositories and migrations behind existing public loaders.
- [ ] Add protected editing and previews for shared content and evidence.
- [ ] Implement draft → review → approval → checks → publish.
- [ ] Track sources, responsible owner, revisions, consent and approval dates.
- [ ] Verify permissions and prevent unpublished records leaking into public results.

Acceptance: staff manage approved content without editing application code.
Phase 2 may require a minimal durable lead/draft store before the full CMS exists.

## Phase 4 — Full template coverage
Status: not started.

- [ ] Complete A01–A20 and the 44 block contracts with evidence-based visibility.
- [ ] Complete all twelve service pages using approved service-specific scope.
- [ ] Add conditional pricing/checklists, guide hubs/articles and blog index/articles.
- [ ] Add case studies, reviews, About, partnerships, support and approved policies.
- [ ] Add filtering, pagination, print views and useful empty states where relevant.
- [ ] Validate relationships, metadata and visible-content-aligned structured data.

Acceptance: each template has a reviewed representative implementation; unavailable
proof is omitted and absent content does not generate empty indexable routes.

## Phase 5 — Controlled location expansion
Status: not started.

- [ ] Import the actual geography register with source/version tracking.
- [ ] Validate unique locality IDs and state-local canonical slug collisions.
- [ ] Represent multiple postcodes, region relationships and external territories.
- [ ] Implement finder disambiguation and crawlable paginated directories.
- [ ] Publish selected useful local hubs and service pages after editorial review.
- [ ] Measure route coverage and duplicate intent before expanding.

Acceptance: stable locality identity, useful reviewed pages and accurate lookup.
Source page-count scenarios are capacity inputs, never automatic publishing targets.

## Phase 6 — Launch
Status: not started.

- [ ] Configure production hosting, domain, secrets, media and durable lead storage.
- [ ] Inventory existing live URLs and approve exact redirect mappings.
- [ ] Finalise contact, policy, consent and operational claims.
- [ ] Add approved canonical origin, generated sitemaps and indexation policy.
- [ ] Remove development noindex only for approved production publication.
- [ ] Verify mobile, keyboard, form delivery, performance and error responses.
- [ ] Configure monitoring, backups and conversion events without personal data.
- [ ] Record deployment, rollback procedure and operational handoff.

Acceptance: production journeys work and approved pages are discoverable.
GitHub push is source publication; it is not website hosting.
