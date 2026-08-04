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

/**
 * One security held in one account, shaped like a row from Plaid's
 * `/investments/holdings/get`. That endpoint returns two parallel arrays —
 * `holdings[]` (the position) and `securities[]` (the ticker/name behind it) —
 * joined on `security_id`. This type is the *joined* row, the same way
 * `Transaction.accountName` is joined from `Account.name`; the Phase 2 backend
 * does the join so the UI never has to.
 *
 * Note the grain: it's one row per (account, security) pair, NOT per security.
 * The same ETF held in a brokerage account and a 401(k) is two rows. The
 * investments screen aggregates them — see `summarizeHoldings` in
 * investments.ts, which produces `Position`.
 */
export interface Holding {
  /** FK to `Account.account_id` — which investment account holds it. */
  account_id: string
  /**
   * Plaid's own ID for the *security* — the tradeable thing itself (a specific
   * ETF, stock, or fund), as opposed to your holding of it.
   *
   * Why this exists instead of just using the ticker: a ticker is a display
   * label, not a stable identifier. Tickers get reused after a company delists,
   * change on rebrands (FB → META), differ between exchanges for the same fund,
   * and are simply absent for a lot of institution-specific and money-market
   * funds. `security_id` is stable across all of that, and identical across
   * every account and every user holding that security.
   *
   * That stability is exactly why it's the grouping key in
   * `summarizeHoldings` — VTI held in a brokerage account and VTI held in a
   * 401(k) arrive as two rows carrying the same `security_id`, which is how we
   * know to roll them into one `Position` rather than showing VTI twice.
   *
   * Format is an opaque Plaid string; never parse it, only compare it.
   */
  security_id: string
  /** Ticker symbol (`Security.ticker_symbol`). Null for things that don't have
   *  one — some money-market and institution-specific funds. */
  ticker?: string | null
  /** Human name (`Security.name`), e.g. "Vanguard Total Stock Market ETF". */
  name: string
  /** Shares held. Fractional is normal, especially in retirement accounts. */
  quantity: number
  /** Current price per share, as the institution reports it. */
  institution_price: number
  /** Current market value of this row. Plaid returns this explicitly rather
   *  than making you multiply — and it can differ from `quantity ×
   *  institution_price` by a cent of rounding, so prefer this field. */
  institution_value: number
  /**
   * What was paid for the position — **a total, not a per-share figure**. Easy
   * to misread, and the difference is a factor of `quantity`.
   *
   * Optional because Plaid genuinely can't always supply it: on the Trial plan
   * cost basis is inconsistent across institutions (see docs/spec.md). Callers
   * must treat a missing value as "unknown gain", not as a $0 basis — a $0
   * basis would report the entire position as profit.
   */
  cost_basis?: number | null
  /** Price at the close of the *previous* trading day (Plaid `Security.close_price`).
   *  This is what makes the "today" change derivable from real data rather
   *  than invented: day change = (institution_price − close_price) × quantity. */
  close_price?: number | null
  iso_currency_code?: string | null
}

/**
 * One security aggregated across every account that holds it — what the
 * investments table and allocation donut render, one row per ticker.
 *
 * Purely derived (see `summarizeHoldings`), never fetched: there's no Plaid
 * endpoint for this shape, the same way `NetWorthBucket` has none.
 */
export interface Position {
  security_id: string
  ticker?: string | null
  name: string
  /** Total shares across all accounts. */
  quantity: number
  /** Current price per share (identical across the rolled-up rows). */
  price: number
  /** Total market value across all accounts. */
  value: number
  /** Total paid. `null` when any contributing row is missing cost basis —
   *  unknown, which is different from zero. */
  costBasis: number | null
  /** value − costBasis. `null` when cost basis is unknown. */
  gain: number | null
  /** gain ÷ costBasis, as a percentage. `null` when unknown or basis is 0. */
  gainPct: number | null
  /** Change since the previous close, in dollars and percent. */
  dayChange: number
  dayChangePct: number
  /** This position's share of the whole portfolio, as a percentage. */
  allocationPct: number
}

/**
 * The whole portfolio: headline stats plus the positions behind them.
 * Produced by `summarizeHoldings` — see investments.ts.
 */
export interface InvestmentsSummary {
  /** Total current market value. */
  marketValue: number
  /** Total paid, across positions where it's known. */
  costBasis: number
  /** marketValue − costBasis, and the same as a percentage of cost basis. */
  totalGain: number
  totalGainPct: number
  /** Change since the previous close. */
  dayChange: number
  dayChangePct: number
  /** Distinct securities held — the "N positions" figure. Note this counts
   *  positions, not holding rows, so one ETF in three accounts counts once. */
  positionCount: number
  /** Largest value first, so a caller can colour by array index without
   *  re-deriving the order (same contract `getSpending()` sets). */
  positions: Position[]
}
