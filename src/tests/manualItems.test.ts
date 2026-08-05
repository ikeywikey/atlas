import { describe, it, expect } from "vitest"
import {
  getManualItems,
  getManualItemsSummary,
  getNetWorthComposition,
  summarizeManualItems,
} from "@/data"
import type { ManualItem } from "@/data"

// These tests pin the manual items summary to the design-anchored totals
// (assets $20,700, liabilities $8,400) and to the "Manual assets"/"Loans"
// buckets summarizeNetWorthComposition folds them into — the same
// cross-module reconciliation src/tests/investments.test.ts does for holdings
// vs account balances.

describe("summarizeManualItems (real mock)", () => {
  const summary = getManualItemsSummary()

  it("totals the design-anchored assets and liabilities", () => {
    expect(summary.assets.total).toBe(20700)
    expect(summary.liabilities.total).toBe(8400)
  })

  it("puts the right count of items on each side", () => {
    expect(summary.assets.items).toHaveLength(2)
    expect(summary.liabilities.items).toHaveLength(1)
  })

  it("splits by kind with no overlap and no dropped items", () => {
    const all = getManualItems()
    const onBothSides = summary.assets.items.some((asset) =>
      summary.liabilities.items.includes(asset)
    )
    expect(onBothSides).toBe(false)

    const accountedFor = summary.assets.items.length + summary.liabilities.items.length
    expect(accountedFor).toBe(all.length)

    for (const item of all) {
      const inAssets = summary.assets.items.includes(item)
      const inLiabilities = summary.liabilities.items.includes(item)
      expect(inAssets !== inLiabilities).toBe(true)
      expect(item.kind === "asset" ? inAssets : inLiabilities).toBe(true)
    }
  })
})

describe("summarizeManualItems (pure, hand-built input)", () => {
  it("returns zero totals and empty arrays for an empty input", () => {
    const summary = summarizeManualItems([])

    expect(summary.assets.total).toBe(0)
    expect(summary.liabilities.total).toBe(0)
    expect(summary.assets.items).toEqual([])
    expect(summary.liabilities.items).toEqual([])
  })

  it("leaves the empty side at 0, not undefined or NaN, on a single-sided list", () => {
    const items: ManualItem[] = [
      {
        id: "manual_a",
        name: "Boat",
        kind: "asset",
        category: "Vehicle",
        value: 5000,
      },
      {
        id: "manual_b",
        name: "Jewelry",
        kind: "asset",
        category: "Valuables",
        value: 2500,
      },
    ]

    const summary = summarizeManualItems(items)

    expect(summary.assets.total).toBe(7500)
    expect(summary.liabilities.total).toBe(0)
    expect(Number.isNaN(summary.liabilities.total)).toBe(false)
    expect(summary.liabilities.items).toEqual([])
  })

  it("preserves input order within each side", () => {
    const items: ManualItem[] = [
      { id: "a1", name: "First asset", kind: "asset", category: "Cash", value: 100 },
      { id: "l1", name: "First liability", kind: "liability", category: "Loan", value: 50 },
      { id: "a2", name: "Second asset", kind: "asset", category: "Cash", value: 200 },
      { id: "l2", name: "Second liability", kind: "liability", category: "Loan", value: 75 },
    ]

    const summary = summarizeManualItems(items)

    expect(summary.assets.items.map((i) => i.id)).toEqual(["a1", "a2"])
    expect(summary.liabilities.items.map((i) => i.id)).toEqual(["l1", "l2"])
  })
})

describe("cross-module reconciliation with getNetWorthComposition", () => {
  it("matches the 'Manual assets' and 'Loans' buckets exactly", () => {
    const summary = getManualItemsSummary()
    const composition = getNetWorthComposition()

    const manualAssetsBucket = composition.assets.buckets.find(
      (b) => b.label === "Manual assets"
    )
    const loansBucket = composition.liabilities.buckets.find(
      (b) => b.label === "Loans"
    )

    expect(manualAssetsBucket).toBeDefined()
    expect(loansBucket).toBeDefined()

    expect(summary.assets.total).toBe(manualAssetsBucket!.amount)
    expect(summary.liabilities.total).toBe(loansBucket!.amount)
  })
})
