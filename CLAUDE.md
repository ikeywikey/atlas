# CLAUDE.md — Atlas

Atlas is an **AI personal-finance dashboard**. Full product spec + roadmap: **`docs/spec.md`** (read it for feature scope, Plaid details, and the timeline).

## Current state

Frontend-only at present: a **React 19 + Vite + Tailwind v4 (CSS-first) + shadcn (radix-nova)** dashboard, running **dark-only**. The backend described in the spec (Node.js API, Postgres, Plaid, daily snapshots, AI query layer) is **not built yet**. Don't assume live data or server code exists.

## Design system (enforced by the `ui-consistency-checker` agent)

- **Primitives are canon.** `src/components/ui/{card,avatar,button,toggle,toggle-group}.tsx` are the correct pattern — mirror `card.tsx`/`avatar.tsx` when building. Feature components (dashboard cards) **consume** primitives + tokens, never re-implement them.
- **Use theme tokens, never raw values.** Tokens live in `src/index.css` (Tailwind v4 CSS-first — there is no `tailwind.config.js`). Use `bg-card`/`border-border`/`text-foreground`/`text-muted-foreground` instead of `bg-white/4`/`text-white`/`text-gray-*`. Atlas brand tokens: `brand` (emphasis/chart blue), `positive` (gain teal), `chart-1..6` (spending ramp; `chart-6` = neutral "Other"). Don't repurpose shadcn's `accent` (it's the hover token).
- **Code style:** no semicolons, double quotes, 2-space (Prettier: `semi: false`). Primitives use `cn()`, `React.ComponentProps<...>`, and `data-slot`.
- **Always consult the `ui-ux-pro-max` skill when building or reworking any UI component** — for layout, spacing, hierarchy, and interaction/animation direction. Take its *ideas*, but always render them in **our** system: our tokens, primitives, and code style above. The skill informs the design; it never overrides the design system.
- **Match the design references in `docs/design/`** — screenshots of the intended look are the visual source of truth. Check the relevant one before building a screen it covers; pull colors/spacing into theme tokens, never hardcode raw values to match an image.

## Project structure

```
src/
  components/
    ui/          shadcn primitives ONLY (avatar, button, card, toggle, toggle-group) — canonical
    dashboard/   dashboard feature components (NetWorthCard, AccountsCard, AccountsCardItem, DashboardSpendingCard)
    visuals/     decorative/visual components (Globe, PixelGlobe)
  data/          the mock→real data seam: types.ts (API-shaped domain types), accounts.ts (mock + getAccounts()), index.ts (barrel)
  pages/         Dashboard.tsx
  lib/           utils.ts (cn)
```

Rules: new **primitives** go in `ui/`; new **feature UI** goes in `components/<feature>/`, never in `ui/`. **All data access goes through `@/data`** (never inline mock arrays in components) — that's the single seam we swap to real API calls in Phase 2. Domain types are API-shaped (mirror Plaid) so the swap needs no UI changes.

## Commands

```
npm run dev         # Vite dev server
npm run typecheck   # tsc -b
npm run lint        # eslint .   (lint:fix to autofix)
npm run test        # vitest run   (unit tests in src/tests/)
npm run format      # prettier --write .   (format:check to verify)
npm run build       # tsc -b && vite build
```

## Workflow: Build → Audit → Verify → Gate → Ship

| Stage | Do this |
|---|---|
| **Build** | Consult the **`ui-ux-pro-max`** skill for design direction, then write the component — mirroring the primitives and staying within our tokens/styling. |
| **Audit** | `/audit-ui` → `ui-consistency-checker` for design-system drift. |
| **Verify** | Screenshot via claude-in-chrome / `/run` — confirm it renders correctly dark-only (and responsive, once the UI grows). The `e2e-tester` (Playwright) will own this as a committed suite later. |
| **Gate** | `/check` → `code-checker` runs typecheck + lint and reviews the diff for correctness. |
| **Ship** | `/ship` → `github-handler` branches, commits, and opens the PR. |

Alongside the loop, a **testing checkpoint** runs per-session / per-milestone (not per-change): the **`unit-tester`** agent writes/runs/reviews **Vitest unit tests** for pure logic (starts with `src/data/*`; tests live in **`src/tests/`**). Invoke it by name — there is deliberately **no `/test` command**. Bug-hunting the diff stays with `code-checker`; deep multi-file review stays with `/code-review`.

Subagents are **task-scoped** (jobs, not personas) and live in `.claude/agents/`. Planned agents live in `docs/spec.md`: **`e2e-tester`** (Playwright — browser flows + responsive viewports; built with the Week-2 router / Week-5 responsive work) and the backend trio (`plaid-integrator`, `db-steward`, `ai-query-builder`, when the backend lands).

## Key constraint to remember

Plaid returns **current balances only — no history**. The net-worth graph is built from **daily snapshots recorded going forward**; you cannot backfill. (See `docs/spec.md`.)
