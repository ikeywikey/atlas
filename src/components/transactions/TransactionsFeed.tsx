import { Card } from "@/components/ui/card.tsx"
import TransactionRow from "@/components/transactions/TransactionRow.tsx"
import type { Transaction } from "@/data"

// Tracked-out mono column labels. Uses the SAME horizontal padding scheme as
// the body cells in TransactionRow (px-4, with pl-6/pr-6 on the outer edges) so
// each title lines up exactly over its column. `text-align` is set per-column
// instead of here so it never fights a shared class.
const columnClass =
  "px-4 pt-5 pb-3 text-xs font-normal tracking-wider text-muted-foreground first:pl-6 last:pr-6"

/**
 * The transaction table. Takes an already-filtered list (the page owns filter
 * state) and renders it, or a helpful empty state when nothing matches. Wrapped
 * in an overflow-x-auto container so the table scrolls sideways on narrow
 * viewports instead of breaking the page layout.
 */
function TransactionsFeed({ transactions }: { transactions: Transaction[] }) {
  return (
    <Card className="p-0">
      {transactions.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-foreground">No transactions match</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search or clear the filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-xl text-sm">
            <thead>
              <tr>
                <th className={`${columnClass} text-left`}>Date</th>
                <th className={`${columnClass} text-left`}>Merchant</th>
                <th className={`${columnClass} text-left`}>Category</th>
                <th className={`${columnClass} text-left`}>Account</th>
                <th className={`${columnClass} text-right`}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.transaction_id}
                  transaction={transaction}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default TransactionsFeed
