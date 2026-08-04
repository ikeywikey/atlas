import type { Holding, InvestmentsSummary, Position } from "./types"

// Mock data shaped like Plaid's `/investments/holdings/get` response, already
// joined with its securities (see the `Holding` docblock for why that join
// happens in the backend).
//
// These numbers are not arbitrary. They're pinned at both ends:
//
//  - UPWARD, to accounts.ts. Each account's rows sum to exactly that account's
//    `balances.current`: brokerage $47,180.00 · Roth IRA $28,940.50 ·
//    401(k) $43,233.50. Those three are the "Investments" bucket in
//    summarizeNetWorthComposition, so they roll into the $171,334 net-worth
//    headline that src/tests/netWorth.test.ts pins. Break the tie here and the
//    net-worth screen silently disagrees with the investments screen.
//
//  - SIDEWAYS, to docs/design/investments page.png: per-security totals are
//    VTI $48,905 · VOO $19,576 · AAPL $13,913 · VXUS $13,618 · BND $8,681 ·
//    VMFXX $5,400 · NVDA $5,389 · SCHD $3,872, summing to $119,354, with cost
//    basis summing to $94,976 (a $24,378 / +25.7% gain).
//
// Note that several securities appear TWICE, in different accounts — holding
// the same ETF in a taxable account and a retirement account is ordinary, and
// it's also forced here: VTI alone ($48,905) is larger than any single account.
// That's the case `summarizeHoldings` exists to collapse.
//
// src/tests/investments.test.ts asserts both anchors, so editing a value here
// fails loudly rather than quietly drifting.
//
// One deliberate departure from the design: `close_price` values are set so
// each position's day change matches the reference's per-ticker percentages
// (+0.6% VTI, +1.1% VOO, −0.8% AAPL, …), which makes the portfolio day change
// derive to +$546, not the +$554 printed on the mockup. The mockup's figure
// comes from multiplying *today's* value by the percentage; a day change is
// measured against the previous close, so the correct total for those same
// percentages is $546. We keep the derivation honest rather than back-fitting
// close prices to a figure computed the wrong way — don't "fix" this.
const mockHoldings: Holding[] = [
  // ── Vanguard Brokerage (acc_vanguard_brokerage) — $47,180.00 ──────────────
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_vti",
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    quantity: 70.51,
    institution_price: 268.12,
    institution_value: 18905.0,
    cost_basis: 13988.0,
    close_price: 266.52,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_voo",
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    quantity: 20.638,
    institution_price: 512.45,
    institution_value: 10576.0,
    cost_basis: 8466.0,
    close_price: 506.87,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_aapl",
    ticker: "AAPL",
    name: "Apple Inc.",
    quantity: 41.64,
    institution_price: 214.05,
    institution_value: 8913.0,
    cost_basis: 6295.0,
    close_price: 215.78,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_nvda",
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    quantity: 42.0,
    institution_price: 128.3,
    institution_value: 5389.0,
    cost_basis: 2709.0,
    close_price: 125.29,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_schd",
    ticker: "SCHD",
    name: "Schwab US Dividend Equity ETF",
    quantity: 92.173,
    institution_price: 27.66,
    institution_value: 2549.5,
    cost_basis: 2549.5,
    close_price: 27.63,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_brokerage",
    security_id: "sec_vmfxx",
    // A money-market settlement fund: priced at a constant $1.00/share, so its
    // value and its share count are the same number and it never shows a gain.
    ticker: "VMFXX",
    name: "Vanguard Federal Money Market",
    quantity: 847.5,
    institution_price: 1.0,
    institution_value: 847.5,
    cost_basis: 847.5,
    close_price: 1.0,
    iso_currency_code: "USD",
  },

  // ── Vanguard Roth IRA (acc_vanguard_roth) — $28,940.50 ────────────────────
  {
    account_id: "acc_vanguard_roth",
    security_id: "sec_vxus",
    ticker: "VXUS",
    name: "Vanguard Total Intl Stock ETF",
    quantity: 209.992,
    institution_price: 64.85,
    institution_value: 13618.0,
    cost_basis: 12201.0,
    close_price: 64.66,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_roth",
    security_id: "sec_voo",
    ticker: "VOO",
    name: "Vanguard S&P 500 ETF",
    quantity: 17.563,
    institution_price: 512.45,
    institution_value: 9000.0,
    cost_basis: 7204.0,
    close_price: 506.87,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_roth",
    security_id: "sec_aapl",
    ticker: "AAPL",
    name: "Apple Inc.",
    quantity: 23.359,
    institution_price: 214.05,
    institution_value: 5000.0,
    cost_basis: 3533.0,
    close_price: 215.78,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_vanguard_roth",
    security_id: "sec_schd",
    ticker: "SCHD",
    name: "Schwab US Dividend Equity ETF",
    quantity: 47.813,
    institution_price: 27.66,
    institution_value: 1322.5,
    cost_basis: 1322.5,
    close_price: 27.63,
    iso_currency_code: "USD",
  },

  // ── Fidelity 401(k) (acc_fidelity_401k) — $43,233.50 ──────────────────────
  {
    account_id: "acc_fidelity_401k",
    security_id: "sec_vti",
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    quantity: 111.891,
    institution_price: 268.12,
    institution_value: 30000.0,
    cost_basis: 22200.0,
    close_price: 266.52,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_fidelity_401k",
    security_id: "sec_bnd",
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    quantity: 120.003,
    institution_price: 72.34,
    institution_value: 8681.0,
    // Above market value — bonds are the one position sitting at a loss, which
    // is what exercises the negative branch of the gain colouring.
    cost_basis: 9108.0,
    close_price: 72.48,
    iso_currency_code: "USD",
  },
  {
    account_id: "acc_fidelity_401k",
    security_id: "sec_vmfxx",
    ticker: "VMFXX",
    name: "Vanguard Federal Money Market",
    quantity: 4552.5,
    institution_price: 1.0,
    institution_value: 4552.5,
    cost_basis: 4552.5,
    close_price: 1.0,
    iso_currency_code: "USD",
  },
]

/**
 * Rolls raw holding rows up into the per-security positions the investments
 * screen renders, plus the portfolio headline stats.
 *
 * Pure (takes its inputs, reads no module state) so it's trivially testable and
 * so a caller can run it over a subset — the same split as
 * `summarizeNetWorthComposition` in netWorth.ts and `summarizeTransactions` in
 * transactions.ts, where the `get*` function is the seam and the summarizer is
 * pure.
 *
 * The grouping key is `security_id`, not `ticker` — see the `Holding` docblock
 * for why the ticker isn't a safe identifier.
 *
 * Cost basis is treated as *unknown* rather than zero when any contributing row
 * is missing it (Plaid's Trial plan doesn't reliably supply it). A missing
 * basis silently coerced to 0 would report the entire position as pure profit,
 * which is worse than showing nothing. Portfolio-level `costBasis`/`totalGain`
 * therefore sum only the positions where it *is* known.
 */
export function summarizeHoldings(holdings: Holding[]): InvestmentsSummary {
  // Accumulate per security. A Map (not a plain object) because it preserves
  // insertion order and takes the id as a real key rather than stringifying it.
  const grouped = new Map<
    string,
    {
      holding: Holding
      quantity: number
      value: number
      // null once any row in the group lacks cost basis — "unknown" is sticky,
      // so a partially-known position doesn't report a misleadingly small basis.
      costBasis: number | null
      previousValue: number
    }
  >()

  for (const h of holdings) {
    const existing = grouped.get(h.security_id)
    // Fall back to the current price when close_price is missing, which yields
    // a day change of exactly 0 rather than an invented one.
    const previousValue = (h.close_price ?? h.institution_price) * h.quantity

    if (!existing) {
      grouped.set(h.security_id, {
        holding: h,
        quantity: h.quantity,
        value: h.institution_value,
        costBasis: h.cost_basis ?? null,
        previousValue,
      })
      continue
    }

    existing.quantity += h.quantity
    existing.value += h.institution_value
    existing.previousValue += previousValue
    existing.costBasis =
      existing.costBasis === null || h.cost_basis == null
        ? null
        : existing.costBasis + h.cost_basis
  }

  const marketValue = [...grouped.values()].reduce((sum, g) => sum + g.value, 0)

  const positions: Position[] = [...grouped.values()]
    .map((g) => {
      const gain = g.costBasis === null ? null : g.value - g.costBasis
      const dayChange = g.value - g.previousValue

      return {
        security_id: g.holding.security_id,
        ticker: g.holding.ticker,
        name: g.holding.name,
        quantity: g.quantity,
        price: g.holding.institution_price,
        value: g.value,
        costBasis: g.costBasis,
        gain,
        // Guard the divide: a position with a $0 basis (a gift, a spin-off)
        // has no meaningful percentage return.
        gainPct:
          gain === null || !g.costBasis ? null : (gain / g.costBasis) * 100,
        dayChange,
        dayChangePct:
          g.previousValue === 0 ? 0 : (dayChange / g.previousValue) * 100,
        // Guard the divide: an empty portfolio has no total to divide by.
        allocationPct: marketValue === 0 ? 0 : (g.value / marketValue) * 100,
      }
    })
    // Largest first, so consumers can colour by index straight off the array.
    .sort((a, b) => b.value - a.value)

  // Only positions with a known basis contribute — see the docblock.
  const costBasis = positions.reduce((sum, p) => sum + (p.costBasis ?? 0), 0)
  const totalGain = positions.reduce((sum, p) => sum + (p.gain ?? 0), 0)
  const dayChange = positions.reduce((sum, p) => sum + p.dayChange, 0)
  const previousValue = marketValue - dayChange

  return {
    marketValue,
    costBasis,
    totalGain,
    totalGainPct: costBasis === 0 ? 0 : (totalGain / costBasis) * 100,
    dayChange,
    dayChangePct: previousValue === 0 ? 0 : (dayChange / previousValue) * 100,
    positionCount: positions.length,
    positions,
  }
}

// Data-access seam (see accounts.ts) — components call these, never the mock
// array directly. Phase 2 swaps the bodies for a real `/investments/holdings/get`
// call; the signatures and shapes stay the same, so no UI changes.

/**
 * Raw holding rows, optionally narrowed to a single account. The filter is here
 * rather than left to callers so a future per-account drill-down needs no new
 * function — and so the "which account holds this" question always goes through
 * the seam.
 */
export function getHoldings(accountId?: string): Holding[] {
  return accountId
    ? mockHoldings.filter((h) => h.account_id === accountId)
    : mockHoldings
}

/** The whole portfolio, aggregated. What the investments screen renders. */
export function getInvestmentsSummary(): InvestmentsSummary {
  return summarizeHoldings(getHoldings())
}
