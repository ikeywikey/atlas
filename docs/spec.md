# atlas — AI Personal Finance Dashboard (Scoped MVP)

## Overview

atlas links your real bank, credit card, and investment accounts into one dashboard: a unified transaction feed, balances, net worth tracking, spending breakdowns, your investment holdings, and an AI search bar that answers natural-language questions over your own data.

**Scope note:** this is the September-target MVP, built on _real_ data. Features are split into MVP (ships), Stretch (feasible, added if time allows), and Future (out of scope for now). The Stretch/Future items are all possible — they're cut to protect frontend time, since the dashboard is UI-heavy and React is being learned alongside it.

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

**Deploy target:** decide early (Fly.io, Railway, or Render — all handle Bun + managed Postgres well) so the week-13 task is "deploy," not "learn how to deploy."

## Stack

- Runtime/API: Bun + TypeScript
- Frontend: React + Recharts
- DB: Postgres — transactions, balances, holdings, manual entries, snapshots
- Aggregation: Plaid (Trial plan, real data)
- AI: an LLM API with tool/function calling for NL queries
- Scheduled daily job to record balance/net-worth snapshots — powers every time-series chart
- **Demo mode:** a `DEMO_MODE` config flag that points the app at Plaid **Sandbox** with synthetic accounts. Same codebase as the real personal instance — only the config differs (sandbox keys + seeded demo data). Powers the public demo deploy.

## Timeline & feasibility

**Verdict:** achievable by end of September, but at the upper edge of a part-time scope while learning React. Assumes ~10–12 hrs/week over ~14 weeks. Two front-loaded risks: the React ramp (weeks 1–3) and Plaid OAuth/Vanguard quirks (week 4). Keep the buffer week sacred.

**Principle:** build **vertically** — thin end-to-end slices, not the whole backend then the whole frontend. Aim to be demo-able from week 3 onward, so a slipped schedule still leaves something to show.

| Week | Dates        | Focus                                                                                             | Milestone                     |
| ---- | ------------ | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| 1    | Jun 23–29    | React fundamentals (throwaway practice) + scaffold: Bun API, Postgres, one data endpoint in React | React ↔ Bun ↔ Postgres talk   |
| 2    | Jun 30–Jul 6 | Plaid **sandbox** Link flow; pull transactions + balances into Postgres                           | Real-shaped data in DB        |
| 3    | Jul 7–13     | Transaction feed + balances UI (first full vertical slice)                                        | First demo-able screen        |
| 4    | Jul 14–20    | Swap to Plaid **Trial** (real data); connect bank + Vanguard; handle OAuth quirks                 | Your real accounts showing    |
| 5    | Jul 21–27    | Net worth headline, net-this-month, ranges; daily snapshot job + synthetic seed                   | Net worth + snapshot pipeline |
| 6    | Jul 28–Aug 3 | Net worth graph (Recharts) from snapshots; dashboard shell tying screens together                 | SoFi-style graph              |
| 7    | Aug 4–10     | Manual assets/liabilities CRUD, folded into net worth + snapshots                                 | Complete net worth            |
| 8    | Aug 11–17    | Investments tab — holdings table                                                                  | Holdings view                 |
| 9    | Aug 18–24    | Spending — category donut + cash flow                                                             | Spending insights             |
| 10   | Aug 25–31    | AI NL queries: define ~5 typed tool functions, wire LLM tool-calling, search bar UI               | Ask-a-question works          |
| 11   | Sep 1–7      | AI hardening (robust on ~10 common questions) + CSV export                                        | AI reliable + export          |
| 12   | Sep 8–14     | Polish: styling, empty/loading/error states                                                       | Looks intentional             |
| 13   | Sep 15–21    | Record demo, README, clean repo, deploy or local-demo                                             | Shippable                     |
| 14   | Sep 22–28    | Buffer / stretch (subscriptions or buy/sell if ahead)                                             | Done                          |

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

## Future (out of scope for now)

- **Forecasting / goal-setting AI** — second AI feature; NL queries cover the "AI-powered" claim alone
- **PDF export** — fiddly to style; CSV covers the export story

Each is a clean add-on — the snapshot + Plaid + DB foundation already supports them.
