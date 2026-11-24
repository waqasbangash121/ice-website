# Project checkpoint

Updated: 24 November 2026 (Asia/Karachi).
Current phase: Phase 2 — Customer journey.
Status: review build complete; CRM, pricing and final business approval deferred
by the user's instructions. Phase 1 remains complete.

## Start here when resuming

1. Read this file, ROADMAP.md, ARCHITECTURE.md and PHASE-2.md.
2. Run git status and inspect any uncommitted changes.
3. Read the relevant installed Next.js documentation before editing.
4. Next implementation phase is Phase 3: durable content storage, staff auth,
   protected editing and approval workflows.
5. Do not enable CRM submission, publish prices or remove noindex automatically.
   The user explicitly requested disabled delivery and draft content.

## Latest delivered checkpoint

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

- Passed: pnpm lint, pnpm typecheck and pnpm build.
- Passed: pnpm verify:foundation http://localhost:3001 (eight public pages, service
  count, links/anchors, metadata, robots and HTTP 404).
- Passed: pnpm test:journey (server sessions, expiry/deletion, validation, conflicting updates,
  attribution, context, conditional answers, reset and disabled submission).
- Browser checked at 1440px/390px: service/Sydney context, errors, Studio/Other,
  review, edit-and-refresh recovery, disabled send, reset and locality finder.
- No observed horizontal overflow or browser console errors at tested widths.
- Temporary QA production server is stopped at session end.
- This checkpoint is committed and pushed to origin/main with its code.

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
