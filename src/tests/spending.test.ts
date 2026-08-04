import { describe, it, expect } from "vitest"
import {
  getCashFlow,
  getMonthlySpending,
  getSpending,
  rollUpCategories,
} from "@/data"

// Pins the mock spending layer's contracts.
//
// The important ones are the *reconciliation* guards at the bottom: the
// category total, the cash-flow figures and the final bar of the 6-month chart
// are three views of one number, and the spending screen shows all three at
// once. If they ever stop agreeing, that must fail here rather than be spotted
// by eye on the rendered page.

const total = (amounts: number[]) => amounts.reduce((sum, n) => sum + n, 0)

describe("getSpending", () => {
  it("returns all eight mock categories", () => {
    const { categories } = getSpending()
    expect(categories).toHaveLength(8)
    expect(categories.map((c) => c.category).sort()).toEqual(
      [
        "Bills & Utilities",
        "Dining",
        "Entertainment",
        "Groceries",
        "Housing",
        "Other",
        "Shopping",
        "Travel",
      ].sort()
    )
  })

  it("sorts by amount descending", () => {
    const { categories } = getSpending()
    // Exclude the pinned "Other" bucket, then confirm the rest are descending.
    const ranked = categories.filter((c) => c.category !== "Other")
    const amounts = ranked.map((c) => c.amount)
    expect([...amounts].sort((a, b) => b - a)).toEqual(amounts)
  })

  it("pins 'Other' last", () => {
    const { categories } = getSpending()
    expect(categories[categories.length - 1].category).toBe("Other")
  })

  it("labels the period with the current calendar month", () => {
    const { period } = getSpending()
    const expected = new Date().toLocaleString("en-US", { month: "long" })
    expect(period).toBe(expected)
  })

  it("totals the $4,490 the design reference's rows sum to", () => {
    const { categories } = getSpending()
    expect(total(categories.map((c) => c.amount))).toBe(4490)
  })
})

describe("rollUpCategories", () => {
  it("folds the tail into a derived 'Other' matching the dashboard design", () => {
    const { categories } = getSpending()
    const rolled = rollUpCategories(categories, 6)

    expect(rolled).toHaveLength(6)
    expect(rolled[rolled.length - 1].category).toBe("Other")
    // Entertainment 153 + Dining 153 + the source "Other" 92. This is the
    // $398 printed on docs/design/dashboard.png — the dashboard card showing
    // six rows must still agree with the eight-row spending screen.
    expect(rolled[rolled.length - 1].amount).toBe(398)
  })

  it("loses nothing in the fold", () => {
    const { categories } = getSpending()
    const rolled = rollUpCategories(categories, 6)
    expect(total(rolled.map((c) => c.amount))).toBe(
      total(categories.map((c) => c.amount))
    )
  })

  it("keeps the head rows untouched and still largest-first", () => {
    const { categories } = getSpending()
    const rolled = rollUpCategories(categories, 6)
    expect(rolled.slice(0, 5)).toEqual(categories.slice(0, 5))
  })

  it("returns the list unchanged when it already fits", () => {
    const { categories } = getSpending()
    expect(rollUpCategories(categories, 8)).toEqual(categories)
    expect(rollUpCategories(categories, 99)).toEqual(categories)
  })

  it("folds a pre-existing 'Other' in rather than emitting two", () => {
    const rolled = rollUpCategories(
      [
        { category: "Housing", amount: 100 },
        { category: "Travel", amount: 50 },
        { category: "Dining", amount: 20 },
        { category: "Other", amount: 5 },
      ],
      2
    )
    expect(rolled).toEqual([
      { category: "Housing", amount: 100 },
      { category: "Other", amount: 75 },
    ])
    expect(rolled.filter((c) => c.category === "Other")).toHaveLength(1)
  })

  it("survives a nonsensical row limit instead of slicing from the end", () => {
    const categories = [
      { category: "Housing", amount: 100 },
      { category: "Travel", amount: 50 },
    ]
    // maxRows 0 would make `maxRows - 1` negative, and a negative slice index
    // counts from the end — which would silently keep the *smallest* rows.
    expect(rollUpCategories(categories, 0)).toEqual([
      { category: "Other", amount: 150 },
    ])
  })

  it("does not mutate its input", () => {
    const { categories } = getSpending()
    const before = JSON.stringify(categories)
    rollUpCategories(categories, 3)
    expect(JSON.stringify(categories)).toBe(before)
  })
})

describe("getCashFlow", () => {
  it("derives spending from the same categories the donut renders", () => {
    const { categories } = getSpending()
    expect(getCashFlow().spending).toBe(total(categories.map((c) => c.amount)))
  })

  it("reconciles income, spending and net saved", () => {
    const { income, spending, netSaved } = getCashFlow()
    expect(income).toBe(6602)
    expect(netSaved).toBe(income - spending)
    expect(netSaved).toBe(2112)
  })

  it("derives the savings rate the design prints as 32%", () => {
    const { savingsRate, netSaved, income } = getCashFlow()
    expect(savingsRate).toBeCloseTo((netSaved / income) * 100, 10)
    expect(Math.round(savingsRate)).toBe(32)
  })

  it("shares the period label with getSpending", () => {
    expect(getCashFlow().period).toBe(getSpending().period)
  })
})

describe("getMonthlySpending", () => {
  it("returns six months, oldest first, ending with the current one", () => {
    const months = getMonthlySpending()
    expect(months).toHaveLength(6)
    expect(months[months.length - 1].month).toBe(
      new Date().toLocaleString("en-US", { month: "short" })
    )
  })

  it("labels the months consecutively backwards from today", () => {
    const months = getMonthlySpending()
    const now = new Date()
    const expected = Array.from({ length: 6 }, (_, i) =>
      new Date(now.getFullYear(), now.getMonth() - (5 - i), 1).toLocaleString(
        "en-US",
        { month: "short" }
      )
    )
    expect(months.map((m) => m.month)).toEqual(expected)
  })

  it("derives the current month's bar from the category total", () => {
    const months = getMonthlySpending()
    const { categories } = getSpending()
    // The last bar and the donut are the same period, so they're the same
    // number — this is the guard that keeps the two cards from drifting.
    expect(months[months.length - 1].amount).toBe(
      total(categories.map((c) => c.amount))
    )
    expect(months[months.length - 1].amount).toBe(getCashFlow().spending)
  })

  it("uses the corrected January figure, not the mockup's $252 glitch", () => {
    const amounts = getMonthlySpending().map((m) => m.amount)
    // Every month should be within a plausible band of the others; the
    // reference's $252 was an order of magnitude out.
    expect(Math.min(...amounts)).toBeGreaterThan(3000)
  })
})
