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
Status: not started.

- [ ] Refine homepage and service directory against the visual architecture.
- [ ] Build the end-of-lease A03 service template with approved scope.
- [ ] Build a Sydney A05 location hub and A06 local-service example from real records.
- [ ] Define and implement final service-specific quote questions.
- [ ] Add opaque server-side drafts, same-session recovery and expiry.
- [ ] Add service/locality context handoff, editable summaries and accessible errors.
- [ ] Connect submission to an agreed lead destination with duplicate protection.
- [ ] Only enable the estimator after approved rules, GST display and versioning exist.
- [ ] Verify successful/rejected submissions and context/estimate invalidation.

Acceptance: customer can discover a service, select a real location, complete the
quote journey and receive an accurate acknowledgement after accepted delivery.
Dependencies: approved scope, locality record, quote fields/consent, lead destination;
production pricing is required for estimator delivery, not for a non-priced enquiry.

## Phase 3 — Content administration
Status: not started.

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
