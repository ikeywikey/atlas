// Domain types for Atlas, shaped to the eventual API responses so a real
// endpoint maps in with no transformation. This is the contract that both the
// mock-data layer (now) and the Node.js/Plaid backend (Phase 2) satisfy — see
// docs/spec.md, "Principle: frontend-first."

/**
 * Mirrors Plaid's `AccountBase` (from `/accounts/get`) so an API response maps
 * in with no transformation, plus two joined/derived fields:
 *  - `logoUrl`  — from `/institutions/get_by_id` → `institution.logo`
 *  - `spent`    — aggregated from `/transactions/get` for the period
 */
export interface Account {
  account_id: string
  name: string
  official_name?: string | null
  /** Last 2–4 digits of the account number (Plaid `mask`). */
  mask?: string | null
  /** Broad category (Plaid `type`): depository | credit | loan | investment | ... */
  type: string
  /** Specific category (Plaid `subtype`): checking | savings | credit card | ... */
  subtype?: string | null
  balances?: {
    current?: number | null
    available?: number | null
    iso_currency_code?: string | null
  }
  /** Institution logo. Plaid returns a base64 PNG — prefix it with
   *  `data:image/png;base64,` before passing it here. Falls back to the
   *  initial-on-color avatar when absent or it fails to load. */
  logoUrl?: string
  /** Derived per-account spend for the period (not a raw Plaid account field). */
  spent?: number
}

/**
 * One day's net-worth snapshot. Plaid only returns *current* balances, so
 * this is the row shape Atlas's own daily snapshot job will write going
 * forward (see docs/spec.md, "Key constraint to design around") — the net
 * worth graph is built entirely from a series of these, never backfilled.
 */
export interface NetWorthSnapshot {
  /** ISO date (YYYY-MM-DD), one row per day. */
  date: string
  netWorth: number
}

/**
 * A category's aggregated spend for a period. Mirrors what a `/transactions/get`
 * aggregation by category would produce. No color here — color is a
 * presentation concern assigned by the consuming component, same as how
 * `AccountsCardItem` derives its avatar color rather than storing it on `Account`.
 */
export interface SpendingCategory {
  category: string
  amount: number
}

/**
 * One transaction, shaped like a row from Plaid's `/transactions/get` (see
 * docs/spec.md — transactions arrive *with* history, unlike balances). A real
 * API response maps in with no transformation, plus one joined/derived field.
 */
export interface Transaction {
  transaction_id: string
  /** FK to `Account.account_id` — which linked account it belongs to. */
  account_id: string
  /** ISO date (YYYY-MM-DD) the transaction posted. */
  date: string
  /** Merchant/description as Plaid returns it (Plaid `name`). */
  name: string
  merchant_name?: string | null
  /**
   * Plaid's sign convention: a POSITIVE amount is money *leaving* the account
   * (an expense); a NEGATIVE amount is money *coming in* (income/refund). The
   * UI flips this for display — see TransactionRow — so income reads as +$ and
   * spending as −$, which is how people expect to see it.
   */
  amount: number
  iso_currency_code?: string | null
  /** Simplified single label (Plaid `personal_finance_category.primary`). */
  category: string
  /** Joined from `Account.name` for display (e.g. "Chase Total Checking").
   *  Derived, not a raw Plaid transaction field — the backend joins it in Phase 2. */
  accountName?: string
}

/**
 * A manually-entered asset or liability — the things Plaid can't see (a car,
 * cash under the mattress, a private loan). Deliberately NOT Plaid-shaped:
 * unlike every other type in this file, this one has no upstream API to mirror.
 * It's Atlas's own table, so this shape *is* the contract the Phase 2 backend
 * will be written to (see docs/spec.md — manual CRUD lands in Week 10).
 *
 * Manual items fold straight into net worth alongside linked accounts; see
 * `summarizeNetWorthComposition` in netWorth.ts.
 */
export interface ManualItem {
  id: string
  name: string
  /** Which side of the balance sheet it sits on. */
  kind: "asset" | "liability"
  /** Display subtype: vehicle | cash | loan | property | ... */
  category: string
  /** Always a POSITIVE magnitude — `kind` carries the direction, not the sign.
   *  (Contrast `Account.balances.current`, where Plaid signs credit balances
   *  negative, and `Transaction.amount`, where positive means money out.) */
  value: number
  /** Free-text detail shown under the name ("KBB private-party value"). */
  note?: string
}

/**
 * One bucket of the net-worth breakdown — "Cash & deposits", "Loans", etc.
 * Purely derived (aggregated from accounts + manual items), never fetched.
 */
export interface NetWorthBucket {
  label: string
  /** Positive magnitude; which side it's on is implied by the group it's in. */
  amount: number
}

/**
 * The full assets-vs-liabilities breakdown behind the net-worth headline.
 * Produced by `summarizeNetWorthComposition` — see netWorth.ts.
 */
export interface NetWorthComposition {
  assets: { total: number; buckets: NetWorthBucket[] }
  liabilities: { total: number; buckets: NetWorthBucket[] }
  /** assets.total − liabilities.total. */
  netWorth: number
  /** liabilities ÷ assets, as a percentage. 0 when there are no assets. */
  debtToAssetRatio: number
}

// Future domain types (investment holdings) land here as their screens get
// built — same API-shaped contract, so the Phase 2 backend swap stays a
// data-source change, not a rewrite.
