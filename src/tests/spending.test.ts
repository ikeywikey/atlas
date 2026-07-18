import { describe, it, expect } from "vitest"
import { getSpending } from "@/data"

// Pins the mock spending layer's two contracts the NetWorthCard / spending
// donut rely on: categories come out largest-first so a caller can color by
// index, with "Other" always pinned last (it's the neutral catch-all, not the
// smallest slice), and `period` tracks the current calendar month rather than
// freezing on whatever month the mock was written in.

describe("getSpending", () => {
  it("returns all six mock categories", () => {
    const { categories } = getSpending()
    expect(categories).toHaveLength(6)
    expect(categories.map((c) => c.category).sort()).toEqual(
      ["Bills & Utilities", "Groceries", "Housing", "Other", "Shopping", "Travel"].sort()
    )
  })

  it("sorts by amount descending", () => {
    const { categories } = getSpending()
    // Exclude the pinned "Other" bucket, then confirm the rest are descending.
    const ranked = categories.filter((c) => c.category !== "Other")
    const amounts = ranked.map((c) => c.amount)
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts)
  })

  it("pins 'Other' last even though it isn't the smallest amount", () => {
    const { categories } = getSpending()
    const other = categories.find((c) => c.category === "Other")
    expect(categories[categories.length - 1].category).toBe("Other")
    // Guards against a naive amount-only sort: Other ($399) outranks several
    // categories, so a plain descending sort would not place it last.
    const smallest = Math.min(...categories.map((c) => c.amount))
    expect(other?.amount).toBeGreaterThan(smallest)
  })

  it("labels the period with the current calendar month", () => {
    const { period } = getSpending()
    const expected = new Date().toLocaleString("en-US", { month: "long" })
    expect(period).toBe(expected)
  })
})
