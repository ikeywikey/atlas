import type { ManualItem } from "./types"

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
