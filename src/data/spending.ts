import type { SpendingCategory } from "./types"

// Mock category totals, shaped like a `/transactions/get` aggregation for a
// period. Values match the design reference (spending page.png / dashboard.png).
const mockSpending: SpendingCategory[] = [
  { category: "Housing", amount: 2150 },
  { category: "Shopping", amount: 886 },
  { category: "Groceries", amount: 544 },
  { category: "Travel", amount: 298 },
  { category: "Bills & Utilities", amount: 214 },
  { category: "Other", amount: 399 },
]

/**
 * Spending by category for the current period. `period` is always today's
 * calendar month (not hardcoded) — real transaction aggregation is
 * inherently period-bound, so the mock should behave the same way rather
 * than freezing on whatever month the data was written in. Data-access seam
 * (see accounts.ts) — components call this, never the mock array directly.
 * Phase 2 swaps the body for a real `/transactions/get` aggregation query.
 */
export function getSpending(): {
  period: string
  categories: SpendingCategory[]
} {
  const period = new Date().toLocaleString("en-US", { month: "long" })
  // Largest amount first so a caller can color by array index (chart-1 =
  // biggest category) without re-deriving the order itself. "Other" is
  // pinned last regardless of amount — it's the neutral catch-all bucket
  // (chart-6 in index.css), not necessarily the smallest slice.
  const categories = [...mockSpending].sort((a, b) => {
    if (a.category === "Other") return 1
    if (b.category === "Other") return -1
    return b.amount - a.amount
  })
  return { period, categories }
}
