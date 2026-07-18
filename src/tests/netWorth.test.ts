import { describe, it, expect } from "vitest"
import { getNetWorthHistory, getNetWorthSummary } from "@/data"
import type { NetWorthRange } from "@/data"

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
