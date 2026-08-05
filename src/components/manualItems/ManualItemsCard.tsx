import { Card } from "@/components/ui/card"
import ManualItemRow from "./ManualItemRow.tsx"
import { currency } from "@/lib/palette"
import { cn } from "@/lib/utils"
import type { ManualItem } from "@/data"

interface ManualItemsCardProps {
  title: string
  total: number
  items: ManualItem[]
  /** Which side of the balance sheet — drives the total's colour and sign. */
  tone: "asset" | "liability"
}

/**
 * One side of the manual balance sheet — "Manual assets" or "Manual
 * liabilities" — as a heading with its total plus a row per item.
 *
 * Generic over both sides rather than two near-identical components, the same
 * shape `CompositionCard` takes on the net-worth screen: the only differences
 * are the sign, the colour, and the rows, all passed in.
 */
function ManualItemsCard({ title, total, items, tone }: ManualItemsCardProps) {
  const isLiability = tone === "liability"

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          {title}
        </h2>
        {/* `warning`, not `destructive` — the line AccountsCardItem drew and
            CompositionCard follows: amber is money owed, red is reserved for
            genuinely overdrawn. A student loan is the former. */}
        <p
          className={cn(
            "text-base tabular-nums",
            isLiability ? "text-warning" : "text-positive"
          )}
        >
          {isLiability && "−"}
          {currency(total)}
        </p>
      </div>

      {/* Empty state rather than a bare card: with nothing listed, a card
          showing only "$0" reads as broken. This is reachable today — delete
          the one liability from the mock and this side goes empty. */}
      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">
          Nothing added yet.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <ManualItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ManualItemsCard
