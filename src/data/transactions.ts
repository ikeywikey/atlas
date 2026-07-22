import type { Transaction } from "./types"
import { getAccounts } from "./accounts"

// Mock transactions shaped like Plaid's `/transactions/get` rows. Remember the
// sign convention (see the Transaction type): amount POSITIVE = money out
// (expense), NEGATIVE = money in (income). `account_id` references a real
// account from accounts.ts so the "All accounts" filter and the joined
// `accountName` line up with the accounts the rest of the app already knows.
const mockTransactions: Transaction[] = [
  {
    transaction_id: "txn_001",
    account_id: "acc_amex_gold",
    date: "2026-07-21",
    name: "Costco",
    category: "Groceries",
    amount: 112.58,
  },
  {
    transaction_id: "txn_002",
    account_id: "acc_chase_checking",
    date: "2026-07-20",
    name: "Skyline Apartments",
    category: "Housing",
    amount: 2150.0,
  },
  {
    transaction_id: "txn_003",
    account_id: "acc_chase_checking",
    date: "2026-07-20",
    name: "Tartine",
    category: "Dining",
    amount: 24.0,
  },
  {
    transaction_id: "txn_004",
    account_id: "acc_chase_checking",
    date: "2026-07-19",
    name: "Acme Corp Payroll",
    category: "Income",
    amount: -3210.44,
  },
  {
    transaction_id: "txn_005",
    account_id: "acc_amex_gold",
    date: "2026-07-18",
    name: "AMC Theatres",
    category: "Entertainment",
    amount: 16.9,
  },
  {
    transaction_id: "txn_006",
    account_id: "acc_ally_savings",
    date: "2026-07-17",
    name: "Ally Interest",
    category: "Income",
    amount: -39.1,
  },
  {
    transaction_id: "txn_007",
    account_id: "acc_chase_checking",
    date: "2026-07-16",
    name: "Uniqlo",
    category: "Shopping",
    amount: 34.75,
  },
  {
    transaction_id: "txn_008",
    account_id: "acc_amex_gold",
    date: "2026-07-15",
    name: "OpenAI ChatGPT",
    category: "Subscriptions",
    amount: 20.0,
  },
  {
    transaction_id: "txn_009",
    account_id: "acc_chase_checking",
    date: "2026-07-14",
    name: "United Airlines",
    category: "Travel",
    amount: 445.2,
  },
  {
    transaction_id: "txn_010",
    account_id: "acc_chase_checking",
    date: "2026-07-13",
    name: "PG&E",
    category: "Bills & Utilities",
    amount: 142.3,
  },
  {
    transaction_id: "txn_011",
    account_id: "acc_amex_gold",
    date: "2026-07-12",
    name: "Netflix",
    category: "Subscriptions",
    amount: 15.49,
  },
  {
    transaction_id: "txn_012",
    account_id: "acc_amex_gold",
    date: "2026-07-11",
    name: "Amazon",
    category: "Shopping",
    amount: 63.2,
  },
  {
    transaction_id: "txn_013",
    account_id: "acc_amex_gold",
    date: "2026-07-10",
    name: "Spotify",
    category: "Subscriptions",
    amount: 11.99,
  },
  {
    transaction_id: "txn_014",
    account_id: "acc_chase_checking",
    date: "2026-07-08",
    name: "Trader Joe's",
    category: "Groceries",
    amount: 58.4,
  },
  {
    transaction_id: "txn_015",
    account_id: "acc_amex_gold",
    date: "2026-07-06",
    name: "Chipotle",
    category: "Dining",
    amount: 30.97,
  },
  {
    transaction_id: "txn_016",
    account_id: "acc_amex_gold",
    date: "2026-07-04",
    name: "iCloud+",
    category: "Subscriptions",
    amount: 2.99,
  },
  {
    transaction_id: "txn_017",
    account_id: "acc_amex_gold",
    date: "2026-07-02",
    name: "Uber",
    category: "Travel",
    amount: 18.5,
  },
  {
    transaction_id: "txn_018",
    account_id: "acc_amex_gold",
    date: "2026-06-29",
    name: "Costco",
    category: "Groceries",
    amount: 91.66,
  },
]

/**
 * The unified transaction feed across all linked accounts. Data-access seam
 * (see accounts.ts) — components call this, never the mock array directly.
 *
 * Two things happen here that a real backend would do server-side:
 *  1. Each row is joined to its account so `accountName` is ready for display
 *     (the mock rows only carry `account_id`, same as a raw Plaid response).
 *  2. Rows are returned newest-first, the default order the feed shows.
 *
 * Phase 2 swaps the body for a real `/transactions/get` query; the signature
 * and the Transaction shape stay the same, so no UI changes.
 */
export function getTransactions(): Transaction[] {
  const accounts = getAccounts()
  return mockTransactions
    .map((txn) => ({
      ...txn,
      accountName: accounts.find((a) => a.account_id === txn.account_id)?.name,
    }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Totals for a set of transactions, used by the summary row. Kept as a pure
 * function (no data access) so it can run over the *filtered* list the screen
 * is currently showing, and so it's trivially unit-testable. `moneyIn` and
 * `moneyOut` are both returned as positive magnitudes; remember amount is
 * Plaid-signed, so income (negative) feeds `moneyIn` and expenses feed `moneyOut`.
 */
export function summarizeTransactions(transactions: Transaction[]): {
  count: number
  moneyIn: number
  moneyOut: number
} {
  let moneyIn = 0
  let moneyOut = 0
  for (const { amount } of transactions) {
    if (amount < 0) moneyIn += -amount
    else moneyOut += amount
  }
  return { count: transactions.length, moneyIn, moneyOut }
}
