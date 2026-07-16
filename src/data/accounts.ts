import type { Account } from "./types"

// Mock data shaped like Plaid's `/accounts/get` response. `balances.current` is
// the real Plaid balance — negative means money owed (e.g. a credit card).
// `logoUrl` would be joined from the institution.
const mockAccounts: Account[] = [
  {
    account_id: "acc_chase_checking",
    name: "Chase Total Checking",
    mask: "4021",
    type: "depository",
    subtype: "checking",
    balances: { current: 8250.75, available: 8250.75, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_amex_gold",
    name: "American Express Gold",
    mask: "1009",
    type: "credit",
    subtype: "credit card",
    balances: { current: -2430.18, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_ally_savings",
    name: "Ally Online Savings",
    mask: "7752",
    type: "depository",
    subtype: "savings",
    balances: { current: 15200, available: 15200, iso_currency_code: "USD" },
  },
]

// Data-access seam: components call getAccounts(), never the mock array
// directly. In Phase 2 (see docs/spec.md) swap the body for a real API fetch —
// the signature and the Account shape stay the same, so no UI changes.
export function getAccounts(): Account[] {
  return mockAccounts
}
