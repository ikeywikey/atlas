import { describe, it, expect } from "vitest"
import {
  getNetWorthHistory,
  getNetWorthSummary,
  getNetWorthComposition,
  getManualItems,
  getAccounts,
  summarizeNetWorthComposition,
} from "@/data"
import type { NetWorthRange, Account, ManualItem } from "@/data"

// These tests pin the mock net-worth layer to the design-reference numbers it
// encodes (net worth page.png: $171,334 today, +$1,820 this month, +$14,362 /
// +9.1% over 6 months). The mock is deterministic — anchor days hit exact
// ANCHORS values and the seeded noise() never touches them — so the summary
// assertions can be exact, not approximate.

const RANGES: NetWorthRange[] = ["wk", "month", "6month", "1yr"]

// One extra than the range's day-count: the slice includes both the start day
// and today (see getNetWorthHistory's `RANGE_DAYS[range] + 1`).
const EXPECTED_LENGTH: Record<NetWorthRange, number> = {
  wk: 8,
  month: 31,
  "6month": 183,
  "1yr": 366,
}

const today = new Date().toISOString().slice(0, 10)

describe("getNetWorthHistory", () => {
  it("returns start-day + today for each range", () => {
    for (const range of RANGES) {
      expect(getNetWorthHistory(range)).toHaveLength(EXPECTED_LENGTH[range])
    }
  })

  it("is oldest-first and ends today", () => {
    for (const range of RANGES) {
      const history = getNetWorthHistory(range)
      expect(history[history.length - 1].date).toBe(today)
      const dates = history.map((s) => s.date)
      expect([...dates].sort()).toEqual(dates)
    }
  })

  it("never over-slices the 400-day window (no empty/negative-index result)", () => {
    for (const range of RANGES) {
      const history = getNetWorthHistory(range)
      expect(history.length).toBeGreaterThan(0)
      expect(history.every((s) => Number.isFinite(s.netWorth))).toBe(true)
    }
  })
})

describe("getNetWorthSummary", () => {
  it("reports the design-anchored current balance and month change on every range", () => {
    for (const range of RANGES) {
      const summary = getNetWorthSummary(range)
      expect(summary.current).toBe(171334)
      expect(summary.monthChange).toBe(1820)
    }
  })

  it("computes the 6-month range change and percentage", () => {
    const summary = getNetWorthSummary("6month")
    expect(summary.rangeChange).toBe(14362)
    expect(summary.rangeChangePct).toBeCloseTo(9.1, 1)
    expect(summary.rangeLabel).toBe("Past 6 months")
  })

  it("computes the 1-year range change", () => {
    const summary = getNetWorthSummary("1yr")
    expect(summary.rangeChange).toBe(33334)
    expect(summary.rangeLabel).toBe("Past year")
  })

  it("labels the week and month ranges", () => {
    expect(getNetWorthSummary("wk").rangeLabel).toBe("Past week")
    expect(getNetWorthSummary("month").rangeLabel).toBe("Past month")
    // Month range's change equals the fixed monthChange — same 30-day anchor.
    expect(getNetWorthSummary("month").rangeChange).toBe(1820)
  })
})

// summarizeNetWorthComposition is the pure summarizer behind the net-worth
// breakdown cards — same pure/seam split as summarizeTransactions, tested the
// same way: exercise the pure function directly with hand-built inputs, then
// pin the real mock data to the design-reference reconciliation.

describe("summarizeNetWorthComposition", () => {
  it("sums buckets to their group total, for both assets and liabilities", () => {
    const composition = getNetWorthComposition()
    const assetsSum = composition.assets.buckets.reduce(
      (sum, b) => sum + b.amount,
      0
    )
    const liabilitiesSum = composition.liabilities.buckets.reduce(
      (sum, b) => sum + b.amount,
      0
    )
    expect(assetsSum).toBeCloseTo(composition.assets.total, 5)
    expect(liabilitiesSum).toBeCloseTo(composition.liabilities.total, 5)
  })

  it("reconciles netWorth = assets.total - liabilities.total, and the real mock data lands on exactly 171334", () => {
    const composition = getNetWorthComposition()
    expect(composition.netWorth).toBe(
      composition.assets.total - composition.liabilities.total
    )
    expect(composition.netWorth).toBe(171334)
  })

  it("normalises Plaid's negative credit balances to a positive liability bucket", () => {
    const accounts = getAccounts()
    const creditAccount = accounts.find((a) => a.type === "credit")
    // Guards the fixture itself: this test only proves something if Plaid's
    // sign convention (credit balances negative) is actually present.
    expect(creditAccount?.balances?.current).toBeLessThan(0)

    const composition = getNetWorthComposition()
    const creditBucket = composition.liabilities.buckets.find(
      (b) => b.label === "Credit cards"
    )
    expect(creditBucket).toBeDefined()
    expect(creditBucket!.amount).toBeGreaterThan(0)
    expect(creditBucket!.amount).toBeCloseTo(
      Math.abs(creditAccount!.balances!.current!),
      5
    )
  })

  it("drops $0 buckets instead of rendering an empty row", () => {
    const accounts: Account[] = [
      {
        account_id: "acc_only_checking",
        name: "Only Checking",
        type: "depository",
        balances: { current: 1000 },
      },
    ]
    const manualItems: ManualItem[] = []

    const composition = summarizeNetWorthComposition(accounts, manualItems)

    expect(composition.assets.buckets).toEqual([
      { label: "Cash & deposits", amount: 1000 },
    ])
    // No "Investments" or "Manual assets" $0 rows, and no liability buckets.
    expect(
      composition.assets.buckets.some((b) => b.label === "Investments")
    ).toBe(false)
    expect(
      composition.assets.buckets.some((b) => b.label === "Manual assets")
    ).toBe(false)
    expect(composition.liabilities.buckets).toEqual([])
  })

  it("handles empty inputs without producing NaN, including debtToAssetRatio's divide-by-zero guard", () => {
    const composition = summarizeNetWorthComposition([], [])

    expect(composition.assets.total).toBe(0)
    expect(composition.liabilities.total).toBe(0)
    expect(composition.assets.buckets).toEqual([])
    expect(composition.liabilities.buckets).toEqual([])
    expect(composition.netWorth).toBe(0)
    // The guard: with zero assets, a naive liabilities/assets division would
    // be NaN (or Infinity for nonzero liabilities) — it must resolve to 0.
    expect(composition.debtToAssetRatio).toBe(0)
    expect(Number.isNaN(composition.debtToAssetRatio)).toBe(false)
  })

  it("produces a negative netWorth in a liability-heavy scenario", () => {
    const accounts: Account[] = [
      {
        account_id: "acc_small_checking",
        name: "Small Checking",
        type: "depository",
        balances: { current: 500 },
      },
    ]
    const manualItems: ManualItem[] = [
      {
        id: "manual_big_loan",
        name: "Big Loan",
        kind: "liability",
        category: "Loan",
        value: 50000,
      },
    ]

    const composition = summarizeNetWorthComposition(accounts, manualItems)

    expect(composition.netWorth).toBe(500 - 50000)
    expect(composition.netWorth).toBeLessThan(0)
    expect(composition.debtToAssetRatio).toBeCloseTo((50000 / 500) * 100, 5)
  })
})

describe("getManualItems", () => {
  it("returns positive value magnitudes for both assets and liabilities — direction lives in kind, not sign", () => {
    const items = getManualItems()
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.value).toBeGreaterThan(0)
    }
    // Guards the fixture: prove both kinds are actually represented, so the
    // "for both kinds" assertion above isn't vacuously true.
    expect(items.some((i) => i.kind === "asset")).toBe(true)
    expect(items.some((i) => i.kind === "liability")).toBe(true)
  })
})
