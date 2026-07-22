import { cn } from "@/lib/utils"
import type { Transaction } from "@/data"

// Curated subset of the brand ramp for the category dots — same approach as
// AccountsCardItem's avatar colors: hash the category name to a stable color so
// the palette looks varied but never flickers between renders. Color is a
// presentation concern only; it's never stored on the transaction data.
const categoryColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--brand)",
]

function categoryColor(category: string) {
  // "Income" is money coming in — give it the semantic teal so its dot matches
  // the teal amount on the same row. Everything else gets a ramp color by hash.
  if (category === "Income") return "var(--positive)"
  let hash = 0
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) | 0
  }
  return categoryColors[Math.abs(hash) % categoryColors.length]
}

// Compact institution label for the tight ACCOUNT column ("Chase", "Amex",
// "Ally") — the full account name is joined onto the row, this just shortens it
// for display. Presentation-only.
function shortAccountName(name: string) {
  if (/express/i.test(name)) return "Amex"
  return name.split(" ")[0]
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

function formatDate(iso: string) {
  // Append a time so the string parses as local midnight, not UTC — otherwise a
  // "2026-07-21" date can render as the 20th in western timezones.
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { date, name, category, amount, accountName } = transaction

  // Flip Plaid's sign for display: a negative amount is money in (income) and
  // reads as +$ in teal; a positive amount is spending and reads as −$.
  const isIncome = amount < 0
  const displayAmount = `${isIncome ? "+" : "−"}${currency.format(Math.abs(amount))}`

  return (
    <tr className="border-t border-border/60 transition-colors hover:bg-muted/40">
      <td className="px-4 py-4 text-muted-foreground tabular-nums whitespace-nowrap first:pl-6 last:pr-6">
        {formatDate(date)}
      </td>
      <td className="px-4 py-4 font-sans font-medium text-foreground first:pl-6 last:pr-6">
        {name}
      </td>
      <td className="px-4 py-4 first:pl-6 last:pr-6">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor(category) }}
          />
          {category}
        </span>
      </td>
      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap first:pl-6 last:pr-6">
        {accountName ? shortAccountName(accountName) : "—"}
      </td>
      <td
        className={cn(
          "px-4 py-4 text-right tabular-nums whitespace-nowrap first:pl-6 last:pr-6",
          isIncome ? "text-positive" : "text-foreground"
        )}
      >
        {displayAmount}
      </td>
    </tr>
  )
}

export default TransactionRow
