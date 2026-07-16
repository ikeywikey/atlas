// Domain types for Atlas, shaped to the eventual API responses so a real
// endpoint maps in with no transformation. This is the contract that both the
// mock-data layer (now) and the Bun/Plaid backend (Phase 2) satisfy — see
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

// Future domain types (transactions, holdings, net-worth snapshots, manual
// assets/liabilities) land here as their screens get built — same API-shaped
// contract, so the Phase 2 backend swap stays a data-source change, not a rewrite.
