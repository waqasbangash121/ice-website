# Project checkpoint

Updated: 24 November 2026 (Asia/Karachi).
Current phase: Phase 1 — Foundation.
Status: Phase 1 complete. Ready for Phase 2.

## Start here when resuming

1. Read this file, ROADMAP.md and ARCHITECTURE.md.
2. Run git status and inspect uncommitted changes before editing.
3. Reuse the existing Next.js project and read relevant installed Next.js docs.
4. Phase 1 is complete; preserve its checks and start the Phase 2 tasks.
5. Next feature milestone is Phase 2: end-of-lease service and Sydney journey;
   obtain the real scope/locality/quote requirements before inventing operational data.

## Implemented this session

- Extracted original logo and locally hosted Manrope/DM Sans with font licences.
- Replaced starter theme with ICE colours, spacing and responsive primitives.
- Added shared header/footer, skip link, breadcrumbs and Escape-dismissable menu.
- Added development home, twelve-service directory, phone quote bridge and 404 UI.
- Added service catalogue, content loader, initial domain types and template registry.
- Added slug-validating canonical route builders independent of postcode.
- Added typecheck script and development-only noindex/robots controls.
- Preserved extracted source text and documented provenance and architecture.
- Added roadmap and mandatory handoff reading/updating instructions in AGENTS.md.

## Validation

- Passed: pnpm lint, pnpm typecheck and production pnpm build.
- Passed: pnpm verify:foundation http://localhost:3001 (three pages, twelve services,
  all internal links/anchors, noindex, robots and an actual HTTP 404).
- Browser checked at 1440px desktop and 390px mobile; mobile menu opens, Escape
  closes it and returns focus. Service and quote destinations were inspected.
- No horizontal overflow observed at the tested mobile width; no browser console errors.
- Initial build exposed a Cache Components restriction on runtime new Date() in the
  footer. Removed the runtime date and reran the production build successfully.
- Repository checkpoint: commit containing this file; pushed to origin/main.
- Temporary production QA server is stopped after validation.

## Important limitations

Not production-ready. There is no CMS, connected quote form, pricing calculator,
geography import, service-detail template, published proof or live hosting.
All twelve services appear in the catalogue, not twelve complete landing pages.
Original interactive HTML is not in the repo; extracted architecture text is.
Copy is provisional. Do not remove noindex until production content is approved.
No credentials or customer personal data are stored in the repository.

## Development environment

Windows PowerShell opens this WSL checkout through a UNC path. Native Windows Git
cannot reliably read the working directory. Use WSL Git from
/home/waqasbangash/apps/ice-website. Node is available after sourcing
/home/waqasbangash/.nvm/nvm.sh; the verified Node version is 22.23.2.
Use pnpm 10.10.0. On a new environment install requirements normally; the nvm path
is specific to this workstation.

Commands: pnpm lint; pnpm typecheck; pnpm build; pnpm dev.
If WSL returns access denied, request the tool's escalation rather than bypass it.
Windows Git Credential Manager is available through WSL at
/mnt/c/Program Files/Git/mingw64/bin/git-credential-manager.exe when pushing.
Do not store tokens. The normal WSL credential helper may point to an unavailable
credential-manager executable; use a per-command helper override if necessary.

## Session handoff rule

At session end, record current phase/status, actual checks, remaining limitations
and exact next action here; update roadmap checkboxes. Never infer completion from
the plan alone. Keep the code and checkpoint in the same Git commit where feasible.
