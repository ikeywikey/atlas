import { summarizeTransactions } from "@/data"
import type { Transaction } from "@/data"

// Whole-dollar formatter — the summary reads as a quick glance ("+$3,499"), so
// cents would only add noise. Per-row amounts keep their cents.
const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/**
 * The one-line stat row above the feed: how many transactions are showing, and
 * the money in / money out totals. Derived from the *filtered* list so the
 * numbers always describe exactly what's on screen.
 */
function TransactionsSummary({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const { count, moneyIn, moneyOut } = summarizeTransactions(transactions)

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-1 font-mono text-xs tracking-wider text-muted-foreground">
      <span>
        SHOWING <span className="text-foreground">{count} transactions</span>
      </span>
      <span>
        IN{" "}
        <span className="text-positive">+{wholeDollars.format(moneyIn)}</span>
      </span>
      {/* Amber, deliberately departing from docs/design/transactions page.png,
          where this figure is white — don't "fix" it back to match the image.
          `warning` rather than `destructive` keeps red reserved for the states
          that are genuinely wrong (an overdrawn account, a position below its
          cost basis); money merely spent is neither.

          Only this total is coloured. The per-row amounts in TransactionRow
          stay neutral on purpose: a whole column of amber is the same wall-of-
          colour problem that keeps the holdings table's dollars uncoloured. */}
      <span>
        OUT{" "}
        <span className="text-warning">−{wholeDollars.format(moneyOut)}</span>
      </span>
    </div>
  )
}

export default TransactionsSummary
