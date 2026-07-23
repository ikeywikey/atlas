import type { Account } from "./types"

// Mock data shaped like Plaid's `/accounts/get` response. `balances.current` is
// the real Plaid balance — negative means money owed (e.g. a credit card).
// `logoUrl` would be joined from the institution.
//
// The balances here are not arbitrary: they're the source the net-worth
// breakdown is *derived* from (see netWorth.ts → summarizeNetWorthComposition),
// so they're taken from docs/design/dashboard.png and tuned to the bucket
// totals on docs/design/net worth pagepng.png —
// depository $40,920 · investment $119,354 · credit $1,240.
//
// Together with the manual items in manualItems.ts they sum to *exactly*
// $171,334.00, the headline the net-worth graph is anchored to:
//   (40,920.15 + 119,354.00 + 20,700.00) − (1,240.15 + 8,400.00) = 171,334.00
// Change a balance here and the whole screen moves with it, which is the point.
const mockAccounts: Account[] = [
  {
    account_id: "acc_chase_checking",
    name: "Chase Total Checking",
    mask: "4021",
    type: "depository",
    subtype: "checking",
    balances: {
      current: 8420.15,
      available: 8420.15,
      iso_currency_code: "USD",
    },
  },
  {
    account_id: "acc_amex_gold",
    name: "American Express Gold",
    mask: "1009",
    type: "credit",
    subtype: "credit card",
    balances: { current: -1240.15, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_ally_savings",
    name: "Ally Online Savings",
    mask: "8830",
    type: "depository",
    subtype: "savings",
    balances: { current: 32500, available: 32500, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_vanguard_brokerage",
    name: "Vanguard Brokerage",
    mask: "7741",
    type: "investment",
    subtype: "brokerage",
    balances: { current: 47180, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_vanguard_roth",
    name: "Vanguard Roth IRA",
    mask: "2274",
    type: "investment",
    subtype: "ira",
    balances: { current: 28940.5, iso_currency_code: "USD" },
  },
  {
    account_id: "acc_fidelity_401k",
    name: "Fidelity 401(k)",
    mask: "5518",
    type: "investment",
    subtype: "401k",
    balances: { current: 43233.5, iso_currency_code: "USD" },
  },
]

// Data-access seam: components call getAccounts(), never the mock array
// directly. In Phase 2 (see docs/spec.md) swap the body for a real API fetch —
// the signature and the Account shape stay the same, so no UI changes.
export function getAccounts(): Account[] {
  return mockAccounts
}
