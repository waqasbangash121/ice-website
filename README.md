# Instant Cleaning Experts Website

Website project for Instant Cleaning Experts (ICE), bootstrapped with Create Next App. The repository currently contains the initial application scaffold; business pages and integrations are still to be implemented.

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
| Fonts | Geist and Geist Mono through `next/font/google` |
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

No environment variables or external services are required by the current scaffold. Google fonts are fetched during the build, so the build environment needs access to Google Fonts.

## Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm lint` | Run ESLint |
| `pnpm exec tsc --noEmit` | Check TypeScript types after `pnpm dev` or `pnpm build` has generated Next.js route types |
| `pnpm build` | Create the production build |
| `pnpm start` | Serve an existing production build |

To run locally in production mode:

```bash
pnpm lint
pnpm build
pnpm start
```

There is currently no automated test suite or test script.

## Project structure

```text
src/app/
  page.tsx             Home page
  layout.tsx           Root layout, fonts, and site metadata
  globals.css          Tailwind import, theme tokens, and global styles
  favicon.ico          Site icon
public/                Static assets
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
- Global styles include light and dark color tokens based on the system preference.
- `pnpm-workspace.yaml` lists `sharp` and `unrs-resolver` under `ignoredBuiltDependencies`.
- Dependencies, generated builds, and `.env*` files are excluded from Git.

## Deployment

The source repository is [waqasbangash121/ice-website](https://github.com/waqasbangash121/ice-website), with `main` as the primary branch. Pushing to GitHub publishes source code; hosting must be configured separately.

For a Node.js hosting environment, install dependencies with `pnpm install --frozen-lockfile`, build with `pnpm build`, and start with `pnpm start`. The production server uses port 3000 by default; set `PORT` when the host requires another port. A hosting platform with Next.js support can also build from this repository.
