import { describe, it, expect } from "vitest"
import { getTransactions, getAccounts, summarizeTransactions } from "@/data"
import type { Transaction } from "@/data"

// Pins the transactions data layer's contracts: getTransactions() returns the
// full mock feed (18 rows) with every row carrying the fields a TransactionRow
// needs, sorted newest-first, and joined to a real accountName from
// getAccounts() (never left undefined). It also pins Plaid's sign convention
// (amount < 0 = income, amount > 0 = expense) on a couple of known rows, since
// summarizeTransactions and the UI's display-sign flip both depend on it.
// summarizeTransactions is tested as the pure function it is: totals are
// positive magnitudes split by sign, independent of getTransactions().

const REQUIRED_FIELDS: (keyof Transaction)[] = [
  "transaction_id",
  "account_id",
  "date",
  "name",
  "amount",
  "category",
]

describe("getTransactions", () => {
  it("returns all 18 mock rows with the required fields present", () => {
    const txns = getTransactions()
    expect(txns).toHaveLength(18)
    for (const txn of txns) {
      for (const field of REQUIRED_FIELDS) {
        expect(txn[field]).not.toBeUndefined()
      }
    }
  })

  it("is sorted newest-first (date descending)", () => {
    const dates = getTransactions().map((t) => t.date)
    const sortedDesc = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sortedDesc)
  })

  it("joins accountName from getAccounts() for every row", () => {
    const accounts = getAccounts()
    const txns = getTransactions()
    for (const txn of txns) {
      expect(txn.accountName).toBeDefined()
      const account = accounts.find((a) => a.account_id === txn.account_id)
      expect(txn.accountName).toBe(account?.name)
    }
  })

  it("honors the Plaid sign convention: income rows are negative, expenses positive", () => {
    const txns = getTransactions()
    const payroll = txns.find((t) => t.name === "Acme Corp Payroll")
    const interest = txns.find((t) => t.name === "Ally Interest")
    expect(payroll?.amount).toBeLessThan(0)
    expect(interest?.amount).toBeLessThan(0)

    const expenseNames = ["Costco", "Skyline Apartments", "Tartine", "Uber"]
    for (const name of expenseNames) {
      const row = txns.find((t) => t.name === name)
      expect(row?.amount).toBeGreaterThan(0)
    }
  })
})

describe("summarizeTransactions", () => {
  it("totals the full feed into count, moneyIn, and moneyOut as positive magnitudes", () => {
    const txns = getTransactions()
    const summary = summarizeTransactions(txns)
    expect(summary.count).toBe(18)
    expect(summary.moneyIn).toBeGreaterThan(0)
    expect(summary.moneyOut).toBeGreaterThan(0)

    const expectedMoneyIn = txns
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + -t.amount, 0)
    const expectedMoneyOut = txns
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    expect(summary.moneyIn).toBeCloseTo(expectedMoneyIn, 5)
    expect(summary.moneyOut).toBeCloseTo(expectedMoneyOut, 5)
    // Guards against a naive "sum all amounts" implementation, which would net
    // income against expenses instead of returning two separate magnitudes.
    expect(summary.moneyIn).not.toBe(summary.moneyOut)
  })

  it("returns zeroed totals for an empty list", () => {
    expect(summarizeTransactions([])).toEqual({
      count: 0,
      moneyIn: 0,
      moneyOut: 0,
    })
  })
})
