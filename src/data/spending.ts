import type { CashFlow, MonthlySpending, SpendingCategory } from "./types"

// Mock category totals, shaped like a `/transactions/get` aggregation for a
// period. Values are read off the design reference (docs/design/spending
// page.png), which prints all eight categories:
//
//   Housing 2150 · Shopping 886 · Groceries 544 · Travel 298 ·
//   Bills & Utilities 214 · Entertainment 153 · Dining 153 · Other 92
//
// Two things about these numbers are deliberate:
//
//  1. They sum to $4,490, while the mockup's donut prints **$4,491**. The total
//     here is always *derived* from the rows (see `sumCategories`), so the
//     screen is self-consistent; we don't inflate a category by a dollar to
//     back-fit a figure the mockup rounded. Same discipline as netWorth.ts,
//     where the headline is derived from the composition rather than hardcoded.
//
//  2. The dashboard card (docs/design/dashboard.png) shows only six rows,
//     ending in "Other $398" — which is exactly these last three folded
//     together (153 + 153 + 92). That fold is `rollUpCategories`, not a second
//     hardcoded array, so editing a category moves both screens at once.
//
// src/tests/spending.test.ts pins both, so a drifting edit fails loudly.
const mockSpending: SpendingCategory[] = [
  { category: "Housing", amount: 2150 },
  { category: "Shopping", amount: 886 },
  { category: "Groceries", amount: 544 },
  { category: "Travel", amount: 298 },
  { category: "Bills & Utilities", amount: 214 },
  { category: "Entertainment", amount: 153 },
  { category: "Dining", amount: 153 },
  { category: "Other", amount: 92 },
]

// Money in for the period. The only mock *input* to the cash-flow card —
// `spending`, `netSaved` and the savings rate are all computed from it and from
// the categories above, so the two cards on the spending screen can't disagree.
// Matches the $6,602 printed on the design reference.
//
// Annotated `number` rather than left to infer: without it TypeScript narrows
// the type to the literal `6602` and then flags the divide-by-zero guard below
// as unreachable. The guard isn't hypothetical — in Phase 2 this value arrives
// from a query and a month with no income is entirely possible.
const MOCK_INCOME: number = 6602

// The five months *before* the current one, oldest first, from the design's
// 6-month bar chart. The sixth (current) month is derived from the categories —
// see `getMonthlySpending`.
//
// One departure from the mockup: it draws January at **$252**, an order of
// magnitude below every other month and with a bar too short to read. That's a
// mockup glitch rather than a story about the data, so this uses a plausible
// $3,900 in its place.
const MOCK_PRIOR_MONTHS = [3900, 4115, 3720, 4025, 5886]

/** Total spend across a set of categories. */
function sumCategories(categories: SpendingCategory[]): number {
  return categories.reduce((total, c) => total + c.amount, 0)
}

/** The current calendar month, e.g. "August" — see `getSpending`. */
function currentPeriod(): string {
  return new Date().toLocaleString("en-US", { month: "long" })
}

/**
 * Collapses a category list down to at most `maxRows` rows, folding everything
 * past the cut into a single derived "Other" bucket.
 *
 * Pure (takes its input, reads no module state), like `summarizeHoldings` in
 * investments.ts — the `get*` functions are the data seam, the summarizers are
 * plain functions.
 *
 * This exists because the dashboard card and the spending screen render the
 * *same* spend at different densities: the screen shows all eight categories,
 * the dashboard has room for six. Deriving the short list means there's one
 * source of truth — the fold can never lose or invent a dollar, and the
 * dashboard's "Other" moves automatically when a category is edited.
 *
 * Any pre-existing "Other" is folded in too, so the result has exactly one.
 * The output keeps the input's contract: largest-first, "Other" pinned last.
 */
export function rollUpCategories(
  categories: SpendingCategory[],
  maxRows: number
): SpendingCategory[] {
  // Already short enough — nothing to fold. Copy rather than return the input
  // so a caller can't mutate the caller's array through ours.
  if (categories.length <= maxRows) return [...categories]

  // Keep maxRows − 1 rows and reserve the last slot for the fold. Guard against
  // a nonsensical maxRows (0 or negative) collapsing to a negative slice index,
  // which would silently take rows off the *end*.
  const keep = Math.max(maxRows - 1, 0)
  const head = categories.slice(0, keep)
  const tail = categories.slice(keep)

  return [...head, { category: "Other", amount: sumCategories(tail) }]
}

// Data-access seam (see accounts.ts) — components call these, never the mock
// arrays directly. Phase 2 swaps the bodies for real `/transactions/get`
// aggregation queries; the shapes stay the same, so no UI changes.

/**
 * Spending by category for the current period. `period` is always today's
 * calendar month (not hardcoded) — real transaction aggregation is
 * inherently period-bound, so the mock should behave the same way rather
 * than freezing on whatever month the data was written in.
 */
export function getSpending(): {
  period: string
  categories: SpendingCategory[]
} {
  // Largest amount first so a caller can color by array index (chart-1 =
  // biggest category) without re-deriving the order itself. "Other" is
  // pinned last regardless of amount — it's the neutral catch-all bucket
  // (chart-6 in index.css), not necessarily the smallest slice.
  const categories = [...mockSpending].sort((a, b) => {
    if (a.category === "Other") return 1
    if (b.category === "Other") return -1
    return b.amount - a.amount
  })
  return { period: currentPeriod(), categories }
}

/**
 * Income vs spending for the current period, plus what was left over.
 *
 * Only `income` is mock input. `spending` is summed from `getSpending()` and
 * the rest is arithmetic on the two, so the cash-flow card is structurally
 * incapable of disagreeing with the category donut beside it.
 */
export function getCashFlow(): CashFlow {
  const { period, categories } = getSpending()
  const spending = sumCategories(categories)
  const netSaved = MOCK_INCOME - spending

  return {
    period,
    income: MOCK_INCOME,
    spending,
    netSaved,
    // Guard the divide: a period with no income has no savings *rate*, even if
    // it happens to have spending.
    savingsRate: MOCK_INCOME === 0 ? 0 : (netSaved / MOCK_INCOME) * 100,
  }
}

/**
 * The last six months of total spend, oldest first, ending with the current
 * month — what the "Monthly spending" bar chart renders.
 *
 * The final entry is *derived* from `getSpending()` rather than listed in
 * `MOCK_PRIOR_MONTHS`: the current month's bar and the category donut are two
 * views of the same period, so they're computed from one number. That's the
 * same reconciliation rule as holdings → account balance → net worth (see
 * CLAUDE.md, "Key constraints").
 *
 * Labels are generated backwards from today for the same reason `period` is —
 * a hardcoded "Jan…Jun" would read as stale within a month.
 */
export function getMonthlySpending(): MonthlySpending[] {
  const now = new Date()
  const amounts = [
    ...MOCK_PRIOR_MONTHS,
    sumCategories(getSpending().categories),
  ]

  return amounts.map((amount, i) => {
    // `new Date(year, month, 1)` with a negative or out-of-range month rolls
    // into the neighbouring year on its own, so December → January needs no
    // special case. Day 1 avoids the classic end-of-month bug where "one month
    // before Mar 31" lands back in March.
    const monthsAgo = amounts.length - 1 - i
    const date = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    return {
      month: date.toLocaleString("en-US", { month: "short" }),
      amount,
    }
  })
}
