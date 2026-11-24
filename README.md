# Instant Cleaning Experts Website

Website project for Instant Cleaning Experts (ICE), bootstrapped with Create Next App. Phase 1 now provides the branded site foundation, responsive layout, twelve-service catalogue, initial content types and route conventions. The quote destination currently supports phone enquiries; the connected form and CMS are later phases.

## Project continuity

Read [Project status](docs/PROJECT-STATUS.md) first when resuming, then [Roadmap](docs/ROADMAP.md) and [Architecture decisions](docs/ARCHITECTURE.md). These files record completed phases, checks, outstanding inputs and the next implementation step. `AGENTS.md` directs future sessions to maintain this handoff.

Phase 1 routes: `/`, `/services`, `/get-a-free-quote`, `/robots.txt`, and a custom 404. Development pages are intentionally **noindex** and crawling is disallowed until production approval. No live hosting has been configured.

## Technology stack

| Component | Version / configuration |
| --- | --- |
| Framework | Next.js 16.4.6 with the App Router |
| UI | React and React DOM 19.3.0 |
| Language | TypeScript 5.x with strict mode |
| Styling | Tailwind CSS 4.3.3 |
| CSS integration | `@tailwindcss/turbopack` 4.3.3 |
| Build tooling | Turbopack |
| Linting | ESLint 9.x and `eslint-config-next` 16.4.6, with Core Web Vitals and TypeScript rules |
| Fonts | Self-hosted Manrope headings and DM Sans body through `next/font/local` |
| Package manager | pnpm 10.10.0 |
| Runtime | Node.js 20.9.0 or newer |

Dependency declarations are in `package.json`; `pnpm-lock.yaml` records the resolved versions. Node.js and React TypeScript definitions are included as development dependencies.

## Initial local setup

Install Git, Node.js 20.9.0 or newer, and pnpm 10.10.0. To install the pinned package manager with npm:

```bash
npm install --global pnpm@10.10.0
```

Clone the repository and install dependencies:

```bash
git clone https://github.com/waqasbangash121/ice-website.git
cd ice-website
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Edit `src/app/page.tsx` to update the home page; the development server reloads changes automatically.

On Windows with WSL, run these commands inside the WSL terminal with Node.js and pnpm installed in that environment.

No environment variables or external services are required by Phase 1. Fonts and their SIL OFL licences are stored in `src/app/fonts`; builds do not fetch Google Fonts.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Generate Next.js route types and check TypeScript |
| `pnpm build` | Create the production build |
| `pnpm start` | Serve an existing production build |

To run locally in production mode:

```bash
pnpm lint
pnpm build
pnpm start
```

With a development or production server running, use `pnpm verify:foundation` to check page responses, service count, internal destinations/anchors, development metadata, robots and HTTP 404 behaviour. Pass another origin when needed: `pnpm verify:foundation http://localhost:3001`. Full quote/CMS integration tests will follow those features.

## Project structure

```text
src/app/
  page.tsx             Home page
  layout.tsx           Root layout, fonts, and site metadata
  globals.css          Tailwind import, theme tokens, and global styles
  favicon.ico          Site icon
src/components/        Shared layout and UI primitives
src/config/            Business identity, navigation and template registry
src/data/              Typed service catalogue
src/lib/               Public content loaders and route builders
src/types/             Initial domain and editorial contracts
docs/                  Roadmap, status, decisions and extracted source reference
scripts/               Foundation HTTP verification
public/                Static assets and original supplied logo
next.config.ts         Next.js and Turbopack configuration
eslint.config.mjs      ESLint configuration
tsconfig.json          TypeScript configuration and import aliases
package.json           Dependencies and scripts
pnpm-lock.yaml         Locked dependency versions
pnpm-workspace.yaml    pnpm dependency build settings
AGENTS.md              Repository instructions for coding agents
```

## Current configuration

- The `@/*` import alias resolves to `src/*`.
- Cache Components and partial prefetching are enabled in `next.config.ts`.
- CSS is processed through the Tailwind Turbopack loader.
- Global styles use the approved ICE navy/lime palette, Manrope headings and DM Sans body text.
- `pnpm-workspace.yaml` lists `sharp` and `unrs-resolver` under `ignoredBuiltDependencies`.
- Dependencies, generated builds, and `.env*` files are excluded from Git.

## Deployment

The source repository is [waqasbangash121/ice-website](https://github.com/waqasbangash121/ice-website), with `main` as the primary branch. Pushing to GitHub publishes source code; hosting must be configured separately.

For a Node.js hosting environment, install dependencies with `pnpm install --frozen-lockfile`, build with `pnpm build`, and start with `pnpm start`. The production server uses port 3000 by default; set `PORT` when the host requires another port. A hosting platform with Next.js support can also build from this repository.
