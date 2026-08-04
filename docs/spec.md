# atlas — AI Personal Finance Dashboard (Scoped MVP)

## Overview

atlas links your real bank, credit card, and investment accounts into one dashboard: a unified transaction feed, balances, net worth tracking, spending breakdowns, your investment holdings, and an AI search bar that answers natural-language questions over your own data.

**Scope note:** this is the September-target MVP, built on _real_ data. Features are split into MVP (ships), Stretch (feasible, added if time allows), and Future (out of scope for now). The Stretch/Future items are all possible — they're cut to protect frontend time, since the dashboard is UI-heavy and React is being learned alongside it.

## Current state (as of 2026-08-03)

The project is **frontend-first**: the dashboard UI and its design system are being built ahead of the backend, rather than in strict vertical slices. **Weeks 1–4 are complete** — every screen in `docs/design/` now exists on mock data. Week 5 (AI shell, states, responsive/PWA, deploy) is next.

**Built:**

- Vite + **React 19** + **Tailwind v4** (CSS-first, no `tailwind.config.js`) + **shadcn (radix-nova)** scaffold, running **dark-only**.
- A dark design system with tokens in `src/index.css` — brand roles (`brand` blue, `positive` teal), a `chart-1..6` spending ramp, radius/font scales.
- UI primitives: `card`, `avatar`, `button`, `progress`, `select`, `toggle`, `toggle-group` (the canonical pattern feature components mirror).
- **App shell + routing** (`react-router@8`): a persistent icon nav rail and shared `PageHeader`/`SyncStatus` wrapping every route via a pathless layout route.
- **Dashboard** on the design's two-column grid, complete on mock data: `NetWorthCard` (with a working W/M/6M/Y range toggle), `AccountsCard` + `AccountsCardItem`, `DashboardSpendingCard`, `DashboardInvestmentsCard`.
- **Transactions screen** — filterable/searchable feed with a summary row.
- **Net worth screen** — the `NetWorthCard` at hero scale plus `Assets`/`Liabilities` composition cards, derived from the account list rather than hardcoded, so the breakdown always reconciles to the headline.
- **Investments screen** — market value / total gain / cost basis tiles, a per-security holdings table, and an allocation donut. Holdings aggregate across accounts by `security_id`, and each account's holdings sum to that account's balance, so this screen reconciles to net worth too.
- **Spending screen** — a by-category donut with a ranked bar list, a cash-flow card (income vs spending, net saved, savings rate), and a six-month bar chart. The categories are the only input: the total, the cash-flow figures, the current month's bar, and the dashboard card's rolled-up six rows are all derived from them.
- The typed **mock-data layer** — `src/data/{types,accounts,netWorth,spending,transactions,manualItems,investments}.ts` behind the `@/data` barrel. Types are API-shaped (Plaid-mirroring), so Phase 2 is a data-source swap rather than a UI rewrite.
- A **Vitest** unit suite in `src/tests/` covering the data layer's pure logic.
- The agentic Claude Code workflow described under **Development workflow** below, with four subagents live.

**Not yet built on the frontend:** the AI search-bar shell, loading/empty/error states, and the responsive/PWA pass (all Week 5). The app is deliberately **desktop-first** until Week 5. Manual assets/liabilities are currently read-only — CRUD needs real persistence and lands in Phase 2.

**Not started — the entire backend:** Node.js + TypeScript API, Postgres, Plaid integration, the daily snapshot job, and the AI NL-query layer. The frontend currently runs against no live data. Everything from **Foundation** onward in this spec is the plan, not yet the reality.

## Foundation: data sourcing

Use **Plaid via the Trial plan** — free, real production data, auto-approved for personal use, up to 10 linked institutions. Sign up at the Plaid dashboard and select "Personal use." No full Production approval needed, and most OAuth institutions (including Vanguard) are available on the Trial plan.

Products used (all included in the Trial bundle):

- **Transactions** — history + categories across banks and cards
- **Balance** — current account balances
- **Investments** — current holdings, plus investment transactions (buys/sells/dividends)

**Sandbox still useful** for fast iteration without hitting real connections, and for the demo recording when you don't want your actual balances on camera.

**Key constraint to design around:** Plaid returns _current_ balances only, not balance history. The net worth graph must be built from **daily snapshots the app records going forward** — you cannot backfill. For the demo, seed synthetic historical snapshots so the time-series charts aren't empty; the live snapshot job runs in parallel and takes over with real data. (Transaction history and investment transactions are the exception — those come with history.)

## Core features (MVP)

### Accounts & transactions

- Plaid Link flow to connect real accounts
- Unified transaction feed across all linked banks and credit cards
- Filter/search by account, category, amount, and date
- Per-account balances (checking, savings, credit)

### Manual assets & liabilities

- Add/edit/delete assets and liabilities Plaid can't see (cash, vehicles, real estate, private loans)
- Plain CRUD: name, type, value, optional notes — no external API
- Included in the net worth total and in the daily snapshot, so manual items show up in the graph like linked accounts

### Net worth

- Headline figure: total assets − total liabilities (linked accounts + investments + manual entries)
- **Net this month** (e.g. +$2,530)
- Net gain/loss over selectable ranges (week, month, 6 months)
- Net worth graph over time (SoFi-style), built from daily snapshots

### Investments

- **Current holdings** (primary): ticker, name, quantity, current price, market value, and share of portfolio — via Plaid `/investments/holdings/get`
- **Buy/sell tracking** (secondary, if time): investment transactions — buys, sells, dividends, fees — via `/investments/transactions/get`
- Note: per-holding return % depends on cost-basis data, which Plaid provides inconsistently. Show market value reliably; show return only where cost basis is available.

### Spending & cash flow

- Income vs. spending for the period
- Category breakdown (donut chart) grouping transactions by category
- Cash flow view (money in vs. out over time)

## AI feature (MVP)

**Natural-language queries** — an AI search bar that answers questions over your own data:

- "How much did I spend on food this quarter vs. last?"
- "Show transactions over $100 this month."
- "What's my biggest holding right now?"

Implemented as NL → structured query (tool/function calling against the DB), so the model reasons over query _results_ rather than raw account dumps. This is the core "AI-powered" premise and is non-negotiable.

**Privacy:** financial data stays in the app's own store; the model receives only the minimal data needed to answer (aggregates, query results), never full account exports.

## Export (MVP)

- Export transactions and summaries to CSV

## Demo & distribution

**The problem:** the Plaid Trial plan caps at 10 linked institutions, so atlas is single-user by design — it runs on _my_ real accounts and can't offer public sign-up. That means a recruiter or reviewer can't just click a link and try it with their own bank. This section closes that gap.

**The fix — two complementary things:**

1. **Sandbox-backed live deploy.** A public URL anyone can click, running against Plaid **Sandbox** with synthetic accounts instead of real ones. It's the _same app_ as my personal instance — the only difference is the `DEMO_MODE` config flag (sandbox keys + seeded demo data). So reviewers explore a real, working version without me exposing my actual finances or needing a multi-user product.
2. **Demo video.** A short recorded walkthrough that tells the story end to end. This is what most reviewers actually watch, and it's the fallback if the live deploy is ever down. Record it in demo mode so no real balances appear on camera.

**Why both:** the video carries the narrative; the live deploy lets a curious reviewer click around and confirm it's real. Together they make a single-user project fully legible to someone who can't sign up.

**Framing (for the README):** single-tenant is a deliberate architecture choice given the Trial-plan limit — not a dead end. The codebase is structured so going multi-user later is a clean addition, not a rewrite.

**Installable app (iOS PWA).** atlas ships as a **Progressive Web App** so it installs to the iPhone home screen — same web app plus a manifest, icons, and a service worker (via `vite-plugin-pwa`). Install is Safari → Share → **Add to Home Screen**; it then runs full-screen with its own icon, indistinguishable from a native app for daily use. This needs **no Mac and no App Store** — it rides entirely on the responsive UI (Week 5), so the packaging is a thin layer, not a second codebase. Honest iOS caveats: install is manual/undiscoverable (fine for a personal app), cached storage can be evicted under pressure, web-push is limited (iOS 16.4+), and OS-level FaceID isn't available to a PWA. Those limits — plus a true `.ipa` / native feel — are what the **Capacitor** stretch (below) buys later. A React Native rewrite is deliberately _not_ the path: it would discard the responsive web UI.

**Deploy target: Vercel**, production at **`atlaswealth.xyz`** (the real personal instance, real Plaid data). The public sandbox demo sits on a `demo.atlaswealth.xyz` subdomain or the same deployment in `DEMO_MODE`. Vercel is an ideal fit for the React frontend + PWA; the Phase-2 backend maps onto Vercel's serverless model — API routes as serverless functions, the **daily snapshot job as a Vercel Cron**, and managed **Vercel/Neon Postgres** — rather than an always-on Express server. Wiring this early keeps the week-13 task "deploy," not "learn how to deploy."

## Stack

- Runtime/API: Node.js + TypeScript (Express, deployed as Vercel serverless functions)
- Frontend: React + Recharts, shipped as an installable **PWA** (`vite-plugin-pwa` — manifest + service worker)
- Host: **Vercel** (production `atlaswealth.xyz`); daily snapshot job via Vercel Cron
- DB: Postgres — transactions, balances, holdings, manual entries, snapshots
- Aggregation: Plaid (Trial plan, real data)
- AI: an LLM API with tool/function calling for NL queries
- Scheduled daily job to record balance/net-worth snapshots — powers every time-series chart
- **Demo mode:** a `DEMO_MODE` config flag that points the app at Plaid **Sandbox** with synthetic accounts. Same codebase as the real personal instance — only the config differs (sandbox keys + seeded demo data). Powers the public demo deploy.

## Development workflow

atlas is built with an agentic Claude Code workflow using **task-scoped subagents** (scoped to a job, not a persona). Config lives in the repo (`.claude/`, `CLAUDE.md`) so it's version-controlled.

**The loop — Build → Audit → Verify → Gate → Ship:**

| Stage  | Job                                                                                                                     | Owner                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Build  | consult the `ui-ux-pro-max` skill for design direction, then write the component/feature within our tokens + primitives | primary session                                                                   |
| Audit  | design-system drift (Card primitive, tokens, shadcn conventions)                                                        | `ui-consistency-checker`                                                          |
| Verify | renders correctly dark-only + responsive across viewports                                                               | claude-in-chrome screenshot / `/run` now; `e2e-tester` (Playwright) once UI grows |
| Gate   | typecheck + lint + correctness review of the diff                                                                       | `code-checker`                                                                    |
| Ship   | branch, commit, open PR                                                                                                 | `github-handler`                                                                  |

A **testing sector** runs alongside the loop on a per-session / per-milestone cadence (not a per-change gate): `unit-tester` (pure-logic Vitest) now, `e2e-tester` (browser flows + responsive rendering) later.

**Subagents:**

- **Active now:** `ui-consistency-checker` (UI/design-system audit), `code-checker` (correctness gate), `github-handler` (git/PR); slash commands `/audit-ui`, `/check`, `/ship` invoke them. Plus `unit-tester` — writes/runs/reviews **Vitest unit tests** for pure logic (starts with the `src/data/*` mock/access layer; tests live in `src/tests/`). Invoked by name as a checkpoint, deliberately **no `/test` command**.
- **Planned:**
  - **`e2e-tester`** — one task-scoped Playwright agent owning the **Verify** stage as a _repeatable committed suite_: key user flows plus responsive rendering across a viewport set (mobile 375 / tablet 768 / desktop 1440) and a dark-only render sanity pass. Build it alongside the Week-2 router / Week-5 responsive-polish work — there's nothing to E2E while the app is a single non-responsive page; until then Verify stays the interactive claude-in-chrome / `/run` check. Combines E2E and responsiveness in one agent (same tool, same skill) rather than splitting them.
- **Planned (build when the backend lands)** — one task-scoped agent per backend domain:
  - **`plaid-integrator`** — owns the Plaid Link/token-exchange flow and the Transactions/Balance/Investments products, honoring the Trial-plan constraints (≤10 institutions; current balances only — no backfill; inconsistent cost basis).
  - **`db-steward`** — owns the Postgres schema, migrations, and the daily net-worth snapshot job (forward-only migrations; idempotent daily snapshots; money as integer minor units).
  - **`ai-query-builder`** — owns the NL→structured-query layer: LLM tool/function-calling over the DB (never open-ended text-to-SQL), enforcing the privacy guardrail that the model sees only aggregates/results.
  - As each backend area gets real code, add a matching **read-only checker** (mirroring `ui-consistency-checker`) so review stays advisory and separate from building.

**Supporting foundations:** root `CLAUDE.md` (grounds every session in stack + design-system rules + this workflow); npm `typecheck`/`lint`/`format` scripts; a `PostToolUse` hook that runs ESLint on edited `src` files for immediate feedback (fills the no-CI gap).

## Timeline & feasibility

**Verdict:** paced for a **safe, stable result over speed**. Two milestones: a **resume-ready, deployed frontend demo on mock data by ~mid-August** (Phase 1), then the **real full-stack app — live Plaid data, all screens, real net-worth snapshots — through September**, with the **AI layer, hardening, and deploy landing early-to-mid October** (Phase 2). Sustainable ~10–12 hrs/week, no crunch weeks, re-based from mid-July 2026. The dominant risk is **Plaid Trial/OAuth (esp. Vanguard)** — it gets its own week, with the sandbox path de-risking everything built before it; a slip there costs the "real accounts" milestone, not the rest. Because the mock-data frontend is already deployed and on the resume by mid-August, the backend timeline can breathe.

**Principle: frontend-first.** Build the **complete UI against a typed mock-data layer**, then build the backend and swap the mocks for real endpoints — screen by screen. This suits a UI-heavy dashboard being built while learning React: the app is visually demo-able early, the design system stabilizes before backend complexity arrives, and — critically — it puts a **presentable, deployable product on the resume weeks before the data layer exists**.

**The one rule that makes this work:** the mock-data layer must be **shaped to the eventual API** (Plaid-shaped `Account`, transactions, holdings, daily snapshots). If the mock types match the real response types, Phase 2 is a data-source swap, not a UI rewrite. Keep data access behind a thin module so there's a single seam to move from mock → fetch.

Legend: ✅ done · 🔄 in progress · ⬜ not started.

### Phase 1 — Frontend on mock data → 🎯 **resume-ready demo by mid-August**

The goal of this phase is a **polished, clickable, deployed dashboard** running on API-shaped mock data — the version that goes on the resume. It looks and behaves like the finished product; only the data is synthetic. Manual assets/liabilities CRUD is deferred to Phase 2 (it needs real persistence) and is the first cut if a week runs tight.

| Week | Dates        | Focus                                                                                                                                                                               | Milestone                                                 | Status |
| ---- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------ |
| 1    | Jul 13–19    | Finish in-progress dashboard cards (`AccountsCard`, `DashboardSpendingCard`); stand up the typed **mock-data layer** (API-shaped) behind a thin access module                       | Dashboard cards complete on mocks                         | ✅     |
| 2    | Jul 20–26    | **App shell + router** (persistent nav rail, shared page header); transactions feed + filter/search UI (account, category, amount, date)                                            | Navigable app + transactions screen                       | ✅     |
| 3    | Jul 27–Aug 2 | Net worth: headline, net-this-month, ranges + SoFi-style Recharts graph (mock snapshots); assets/liabilities composition breakdown                                                  | Net worth screen                                          | ✅     |
| 4    | Aug 3–9      | Investments holdings table UI; spending category donut + cash flow UI                                                                                                               | Investments + spending screens                            | ✅     |
| 5    | Aug 10–16    | AI search-bar UI shell (mock responses); loading/empty/error states; dark-only + responsive polish; **PWA (installable home-screen app)**; **deploy to Vercel (`atlaswealth.xyz`)** | 🎯 **Resume-ready frontend demo — installable on iPhone** | ⬜     |

### Phase 2 — Backend & integration (replace mocks with real data)

One focus per week, sustainable pace. The real full-stack substance — Node.js/Postgres API, live Plaid data across every screen, real net-worth snapshots — lands **through September**; the AI query layer, hardening, and deploy follow in **early-to-mid October**. Plaid OAuth gets its own dedicated week so it can't derail the rest. The "if behind, cut" order below protects the core.

| Week | Dates        | Focus                                                                                                                    | Milestone                                      | Status |
| ---- | ------------ | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- | ------ |
| 6    | Aug 17–23    | Scaffold Node.js + Express + TypeScript API + Postgres; wire one real endpoint end-to-end, replacing one mock            | React ↔ Express ↔ Postgres                     | ⬜     |
| 7    | Aug 24–30    | Plaid **sandbox** Link flow; ingest transactions + balances → Postgres                                                   | Real-shaped data in DB                         | ⬜     |
| 8    | Aug 31–Sep 6 | Swap accounts/transactions/balances screens mock → real endpoints                                                        | Dashboard on live sandbox data                 | ⬜     |
| 9    | Sep 7–13     | Investments ingestion (holdings + txns); swap investments + spending screens to real                                     | Investments + spending live                    | ⬜     |
| 10   | Sep 14–20    | Daily **snapshot job** + synthetic seed; net worth graph on real snapshots; manual assets/liabilities CRUD + persistence | Complete net worth on real data                | ⬜     |
| 11   | Sep 21–27    | Swap to Plaid **Trial** (real accounts); connect bank + Vanguard; handle OAuth quirks                                    | 🎯 **Real accounts — full-stack on real data** | ⬜     |
| 12   | Sep 28–Oct 4 | AI NL layer: typed tool functions + LLM tool-calling wired to DB (replaces mock AI); CSV export                          | Ask-a-question works + export                  | ⬜     |
| 13   | Oct 5–11     | AI hardening (~10 questions); demo video, README, deploy (`DEMO_MODE` sandbox); buffer                                   | Shippable                                      | ⬜     |

**AI scope note:** keep the NL feature bounded — define a small set of typed tool functions (e.g. `query_transactions(filters)`, `spending_by_category(period)`, `get_holdings()`, `net_worth(range)`), let the model pick and fill arguments, execute against the DB, and have it narrate the result. This is ~a week of work once the data layer exists. Avoid open-ended text-to-SQL — that's where this feature balloons.

**If behind, cut in this order** (don't touch the buffer first):

1. Cash flow view (net worth + spending already tell the story)
2. Buy/sell investment history (already secondary)
3. Reduce AI to a smaller, fixed question set
4. CSV export

Non-negotiable core for a credible demo: real accounts linked, net worth + graph, spending donut, holdings, and the AI search bar.

## Stretch (feasible — add if time allows)

All of these work with the Trial plan and products above. Cut from MVP for time, not capability.

- **Buy/sell investment history** — promote from secondary to a full tab (already part of Investments)
- **Subscriptions** — auto-detected recurring charges via Plaid's Recurring Transactions (part of the Transactions product): merchant, amount, frequency, next expected date
- **Debt / liabilities breakdown** — credit card APRs, student loans, mortgages via the Liabilities product (also in the Trial bundle)
- **Budgeting** — per-category spending caps with progress and alerts
- **Capacitor native iOS shell** — wrap the same React build in a native WebView to produce a real installable `.ipa`, unlocking OS-level FaceID, secure storage, and native push beyond what the PWA offers. Needs an Apple Developer account and a cloud-Mac build (dev is on Windows). This is the _upgrade path_ from the Week-5 PWA, not a rewrite — a React Native rebuild is explicitly out (it would discard the responsive web UI).

## Future (out of scope for now)

- **Forecasting / goal-setting AI** — second AI feature; NL queries cover the "AI-powered" claim alone
- **PDF export** — fiddly to style; CSV covers the export story

Each is a clean add-on — the snapshot + Plaid + DB foundation already supports them.
