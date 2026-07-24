import { describe, it, expect } from "vitest"
import {
  getInvestmentsSummary,
  getHoldings,
  getAccounts,
  summarizeHoldings,
} from "@/data"
import type { Holding } from "@/data"

// These tests pin the mock investments layer to the design-reference numbers
// it encodes (docs/design/investments page.png) and to the accounts.ts
// balances it must reconcile with (see investments.ts's docblock). The mock
// is deterministic, so the anchor assertions are exact, not approximate.

describe("getInvestmentsSummary", () => {
  const summary = getInvestmentsSummary()

  it("reports the design-anchored portfolio totals", () => {
    expect(summary.marketValue).toBe(119354)
    expect(summary.costBasis).toBe(94976)
    expect(summary.totalGain).toBe(24378)
    expect(summary.totalGainPct).toBeCloseTo(25.7, 1)
    expect(summary.positionCount).toBe(8)
  })

  it("derives a day change of ~$546.17, not the mockup's $554", () => {
    // The mockup's +$554 multiplies today's value by the per-ticker
    // percentage; a day change is properly measured against the previous
    // close (institution_value - close_price * quantity, summed). See the
    // comment above `mockHoldings` in investments.ts for the full case
    // against back-fitting close prices to the mockup's (wrong) figure.
    expect(summary.dayChange).toBeCloseTo(546.17, 1)
  })

  it("sums allocationPct to ~100 across positions", () => {
    const totalAllocation = summary.positions.reduce(
      (sum, p) => sum + p.allocationPct,
      0
    )
    expect(totalAllocation).toBeCloseTo(100, 5)
  })
})

describe("cross-module reconciliation with getAccounts", () => {
  it("sums each investment account's holdings to exactly that account's balance", () => {
    const investmentAccounts = getAccounts().filter(
      (a) => a.type === "investment"
    )
    // Guards the fixture: this test only proves something if there actually
    // are investment accounts to check.
    expect(investmentAccounts.length).toBeGreaterThan(0)

    for (const account of investmentAccounts) {
      const holdingsTotal = getHoldings(account.account_id).reduce(
        (sum, h) => sum + h.institution_value,
        0
      )
      expect(holdingsTotal).toBeCloseTo(account.balances!.current!, 2)
    }
  })
})

describe("aggregation across accounts (summarizeHoldings on the real mock)", () => {
  const summary = getInvestmentsSummary()
  const bySecurity = new Map(summary.positions.map((p) => [p.ticker, p]))

  it("collapses securities held in multiple accounts into a single position", () => {
    // VTI, VOO, AAPL, VMFXX, and SCHD each appear in more than one account —
    // a naive per-row render (or a group-by-ticker that doesn't dedupe
    // account rows) would show each of these twice.
    for (const ticker of ["VTI", "VOO", "AAPL", "VMFXX", "SCHD"]) {
      const matches = summary.positions.filter((p) => p.ticker === ticker)
      expect(matches).toHaveLength(1)
    }
  })

  it("sums VTI's value and quantity across both accounts", () => {
    const vti = bySecurity.get("VTI")
    expect(vti).toBeDefined()
    expect(vti!.value).toBe(48905)
    expect(vti!.quantity).toBeCloseTo(70.51 + 111.891, 3)
  })

  it("sorts positions by value descending", () => {
    const values = summary.positions.map((p) => p.value)
    const sorted = [...values].sort((a, b) => b - a)
    expect(values).toEqual(sorted)
    // Pin the actual order too — a naive amount-only sort with unstable
    // grouping could still coincidentally look sorted without this.
    expect(summary.positions.map((p) => p.ticker)).toEqual([
      "VTI",
      "VOO",
      "AAPL",
      "VXUS",
      "BND",
      "VMFXX",
      "NVDA",
      "SCHD",
    ])
  })
})

describe("summarizeHoldings (pure)", () => {
  it("returns zeros and an empty positions array for an empty input, with no NaN/Infinity", () => {
    const summary = summarizeHoldings([])

    expect(summary.marketValue).toBe(0)
    expect(summary.costBasis).toBe(0)
    expect(summary.totalGain).toBe(0)
    expect(summary.totalGainPct).toBe(0)
    expect(summary.dayChange).toBe(0)
    expect(summary.dayChangePct).toBe(0)
    expect(summary.positionCount).toBe(0)
    expect(summary.positions).toEqual([])

    for (const value of Object.values(summary)) {
      if (typeof value === "number") {
        expect(Number.isNaN(value)).toBe(false)
        expect(Number.isFinite(value)).toBe(true)
      }
    }
  })

  it("treats a missing cost basis as unknown (null), not zero", () => {
    const holdings: Holding[] = [
      {
        account_id: "acc_test",
        security_id: "sec_unknown_basis",
        ticker: "TST",
        name: "Test Security",
        quantity: 10,
        institution_price: 100,
        institution_value: 1000,
        cost_basis: null,
        close_price: 100,
      },
    ]

    const summary = summarizeHoldings(holdings)
    const position = summary.positions[0]

    // Not 0 — a $0 basis would misreport the entire position as profit.
    expect(position.costBasis).toBeNull()
    expect(position.gain).toBeNull()
    expect(position.gainPct).toBeNull()
    // Portfolio-level costBasis/totalGain only sum known positions, so an
    // all-unknown portfolio still resolves to 0, not NaN.
    expect(summary.costBasis).toBe(0)
    expect(summary.totalGain).toBe(0)
  })

  it("makes an unknown basis sticky: one row missing cost basis nulls the whole position", () => {
    const holdings: Holding[] = [
      {
        account_id: "acc_a",
        security_id: "sec_partial_basis",
        ticker: "PRT",
        name: "Partial Basis Security",
        quantity: 5,
        institution_price: 50,
        institution_value: 250,
        cost_basis: 200,
        close_price: 50,
      },
      {
        account_id: "acc_b",
        security_id: "sec_partial_basis",
        ticker: "PRT",
        name: "Partial Basis Security",
        quantity: 5,
        institution_price: 50,
        institution_value: 250,
        cost_basis: null,
        close_price: 50,
      },
    ]

    const summary = summarizeHoldings(holdings)
    expect(summary.positions).toHaveLength(1)
    expect(summary.positions[0].costBasis).toBeNull()
    expect(summary.positions[0].gain).toBeNull()
  })

  it("falls back to institution_price when close_price is missing, giving a day change of exactly 0", () => {
    const holdings: Holding[] = [
      {
        account_id: "acc_test",
        security_id: "sec_no_close",
        ticker: "NCP",
        name: "No Close Price Security",
        quantity: 10,
        institution_price: 25,
        institution_value: 250, // exactly quantity * institution_price
        cost_basis: 200,
        close_price: null,
      },
    ]

    const summary = summarizeHoldings(holdings)
    expect(summary.positions[0].dayChange).toBe(0)
    expect(summary.positions[0].dayChangePct).toBe(0)
    expect(summary.dayChange).toBe(0)
  })
})

describe("getHoldings", () => {
  it("filters to a single account when given an account id", () => {
    const holdings = getHoldings("acc_vanguard_brokerage")
    expect(holdings.length).toBeGreaterThan(0)
    expect(holdings.every((h) => h.account_id === "acc_vanguard_brokerage")).toBe(
      true
    )
  })

  it("returns all rows when called with no argument", () => {
    const all = getHoldings()
    const brokerage = getHoldings("acc_vanguard_brokerage")
    const roth = getHoldings("acc_vanguard_roth")
    const the401k = getHoldings("acc_fidelity_401k")
    expect(all.length).toBe(brokerage.length + roth.length + the401k.length)
  })
})
