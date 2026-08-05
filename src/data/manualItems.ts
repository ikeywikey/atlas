import type { ManualItem, ManualItemsSummary } from "./types"

// Manually-entered assets and liabilities — the things Plaid can't see. Taken
// from the design reference (docs/design/Assets and liabilities.png), and
// tuned so the buckets they roll up into match the net-worth page:
// manual assets $20,700 · loans $8,400.
//
// Unlike accounts/transactions there's no Plaid endpoint behind this — in
// Phase 2 these rows come from Atlas's own table, edited through the manual
// CRUD screen (spec Week 10). Until then they're read-only.
const mockManualItems: ManualItem[] = [
  {
    id: "manual_rav4",
    name: "2019 Toyota RAV4",
    kind: "asset",
    category: "Vehicle",
    value: 19500,
    note: "KBB private-party value",
  },
  {
    id: "manual_cash_on_hand",
    name: "Cash on hand",
    kind: "asset",
    category: "Cash",
    value: 1200,
  },
  {
    id: "manual_student_loan",
    name: "Student loan",
    kind: "liability",
    category: "Loan",
    value: 8400,
    note: "Refi 2023 · 4.1% APR",
  },
]

// Data-access seam (see accounts.ts) — components call this, never the mock
// array directly. Phase 2 swaps the body for a real query.
export function getManualItems(): ManualItem[] {
  return mockManualItems
}

/**
 * Splits manual items by `kind` and totals each side.
 *
 * Pure (takes its input, reads no module state), matching the split every other
 * derivation in this layer uses — `summarizeNetWorthComposition` in netWorth.ts
 * and `summarizeTransactions` in transactions.ts are the same shape: a pure
 * summarizer plus a `get*` seam below it.
 *
 * `ManualItem.value` is always a positive magnitude with `kind` carrying the
 * direction (see types.ts), so no sign normalising is needed here — unlike
 * accounts, where Plaid signs a credit balance negative. Both totals come back
 * positive; which card they land in is what says whether they count for or
 * against you.
 *
 * Order within each side is preserved from the input rather than sorted, so the
 * rows read in the order they were entered — the same order the design shows.
 */
export function summarizeManualItems(items: ManualItem[]): ManualItemsSummary {
  const of = (kind: ManualItem["kind"]) => items.filter((i) => i.kind === kind)
  const total = (list: ManualItem[]) =>
    list.reduce((sum, i) => sum + i.value, 0)

  const assets = of("asset")
  const liabilities = of("liability")

  return {
    assets: { total: total(assets), items: assets },
    liabilities: { total: total(liabilities), items: liabilities },
  }
}

/**
 * Data-access seam for the split — components call this, never the summarizer
 * directly.
 *
 * These totals are the same numbers `summarizeNetWorthComposition` folds into
 * its "Manual assets" and "Loans" buckets, reached by a different path. That
 * they must agree is asserted in src/tests/manualItems.test.ts, so this screen
 * can't drift from the net-worth one.
 */
export function getManualItemsSummary(): ManualItemsSummary {
  return summarizeManualItems(getManualItems())
}
