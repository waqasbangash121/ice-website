# Template reference audit

Reviewed 25 November 2026 against the user-supplied HTML, revision 3 (17 November 2026).
SHA-256: FA2B6FA827CBBE8AFBA3B5C50B18BA5F226856E2E7719D3138FE9E16CA028058.

The file defines 20 page families, 44 block contracts (4 shell + 40 content/interaction),
12 services and 41 demonstration pages/variants. A template is a content/behavior
contract, not a single page or unrelated visual theme. Variants share a family;
content records, context and canonical URL make individual pages.

Review covered the main architecture, all twenty ordered specifications, service
configurations, hierarchy, pricing/checklist policy, geography scenarios, intent
ownership, guide/blog proposals, evidence models, quote journey, release/migration
rules, and the bundled preview structure/runtime. Preview interactions include
menus, finder, collection filters/reset, printing, calculator staleness/handoff,
quote steps, same-session recovery and demonstration-only submissions. The demo
finder knows Sydney only; calculator rates, case records/reviews and sample receipt
states are demonstrations, not approved business data or a production integration.
Historical prompts/approval language inside the HTML are reference history, not
instructions overriding the user's current implementation request.

## What the 20 families mean

| ID | Family | Use / variants | Implementation at this checkpoint |
|---|---|---|---|
| A01 | Homepage | One broad national brand/service discovery page | Existing coded review homepage; CMS family wiring pending |
| A02 | Service directory | All twelve services grouped by customer need | Existing coded directory; service-card content editable |
| A03 | Service landing | National service and justified subservice pages | Composer connected; end-of-lease review page exists; other service-specific content remains to be delivered |
| A04 | Location directory | National finder and crawlable geographic discovery | Existing planning directory/finder; full register/disambiguation/pagination pending |
| A05 | Location hub | State/territory, region/city and locality variants | NSW/Sydney planning examples; CMS/geography model wiring pending |
| A06 | Local service landing | One service × one locality/region | Composer connected; Sydney end-of-lease example; register/region expansion pending |
| A07 | Pricing | National overview and substantive service cost guides | Design drafts; approved schedules/calculator/pricing-family implementation pending |
| A08 | Checklist | Full itemised, printable service scope | Design drafts; B19 checklist and B20 contents/print integration pending |
| A09 | Guide hub | National and service-specific evergreen advice collections | Design drafts; editorial records, filtering/results/pagination pending |
| A10 | Guide article | Preparation, aftercare, comparison and task guidance | Design drafts; authors/reviewers, sources, article-family implementation pending |
| A11 | Blog index | Editorial discovery with service/topic filters | Design drafts; collection/results/pagination pending |
| A12 | Blog article | Narrower customer questions and editorial stories | Design drafts; distinct editorial records, attribution and family rendering pending |
| A13 | Case-study index | Filter genuine jobs by service/geography | Design drafts; consented job evidence and discovery pending |
| A14 | Case-study detail | Real job facts, scope, process, bounded outcome | Design drafts; service-aware job/evidence/consent editors pending |
| A15 | Reviews | Attributable reviews with source/date/filtering | Design drafts; review provenance, deduplication and display pending |
| A16 | About / partnerships | Verified business identity and approved partner proposition | Design drafts; business facts and distinct partnership enquiry routing pending |
| A17 | Quote journey | Direct/service/location/estimate/partner entry | Existing review journey; CRM/pricing disabled, final fields/consent and partner/estimate variants pending |
| A18 | Support | Contact, grouped FAQ and conditional rectification | Design drafts; approved policy and non-sales support reporting/routing pending |
| A19 | Legal / utility | Privacy, terms, accessibility and HTML sitemap | Design drafts; approved versioned documents and published-link sitemap pending |
| A20 | Not found | Reusable error recovery with an actual HTTP 404 | Existing coded 404; CMS recovery-family wiring pending |

The existing A01/A02/A04/A05/A17/A20 routes are implementations outside the generic
composer. Their presence does not mean the complete specification is satisfied or
that administrators can replace those routes through a custom template.

## Backend changes delivered in this session

- Visible searchable architecture catalogue, separate from saved custom layouts.
- Protected per-family specification view: purpose, variants, routes, evidence/CMS
  fields, internal links, mobile behavior, technical constraints and acceptance question.
- Full ordered reference import into a private visual design draft for all twenty
  families. Planned blocks are retained and labelled, never silently stripped.
- Optional immutable referenceId on managed templates, backward compatible with
  schema-2 records without that field. New records do not mutate old layouts/pages.
- Required reference functions must remain required and present. Custom layouts can
  still repeat section types; introduction/CTA order remains validated. A20 correctly
  starts with B39 rather than inventing a promotional introduction.
- All 40 content-block types can be planned in template drafts; only implemented
  blocks can be selected/rendered on actual pages. Shell G01–G04 remain layout-owned.
- Server approval/publication gates reject missing required renderers and families
  whose dedicated composer implementation is pending. Review/design storage remains
  possible. A03/A06 and supported custom layouts keep working; unavailable optional
  features remain omitted in actual pages.
- Reference purpose/guidance/readiness in the inspector; duplicate-layout action
  carries structure, source and family into an independent new draft.
- A03/A06 page creation requires an actual service, A06 also requires a locality,
  and A03 rejects locality context. Published reference-derived custom templates use
  the same checks. The form indicates required context and disables locality for A03.

## Rules carried forward

R means required answer/function; C means include when the documented evidence,
feature or variant applies; O means optional. A required answer need not occupy a
large standalone visual section. Missing proof is omitted, never fabricated.

One shared scope record should supply landing/checklist content. Pricing summary
belongs on every service page; a detailed price guide requires useful approved data
and distinct intent. Guides teach enduring tasks; blogs answer narrower situations.
Reviews/jobs require provenance, relationships, consent and bounded outcomes.
Locality identity is stable and independent of postcode; a candidate URL is not an
instruction to mass-publish. A missing locality page does not imply no coverage.
Quote receipt occurs only after actual lead acceptance; an enquiry is not a booking.

## Remaining implementation work / exact next step

This delivery makes the reference actionable in template administration; it does
not implement all twenty production page families. Variant-specific conditional
requirements are displayed as guidance, not a complete executable rule engine.
Canonical family/variant path enforcement, parent/keyword ownership, evidence
repositories, dated business approvals, role separation, media and production
storage remain future work. Current reference support checks are centralized and
must be updated only alongside real family/rendering capabilities.

Next implement B03 service selection and B05 geographic directory data/renderers,
then connect A01/A02/A04/A05 to managed compositions without replacing existing
public URLs inadvertently. Add variant records and requirement evaluation next;
B19/B20 checklist/contents with one shared scope version is a bounded subsequent
family milestone. Author/source/policy/evidence records are required before article,
case, review and policy families can meet their acceptance questions. Production
geography needs the authoritative register rather than the single Sydney fixture.

CRM submission, numerical pricing, demo proof and search indexing remain disabled.
No website deployment or Git push was performed.
