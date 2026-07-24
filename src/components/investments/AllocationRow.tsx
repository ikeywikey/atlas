import { cn } from "@/lib/utils"
import type { Position } from "@/data"

interface AllocationRowProps {
  position: Position
  /** Swatch colour, matched to this position's donut segment. */
  color: string
}

/**
 * One line of the allocation legend: colour swatch, ticker, percentage.
 *
 * The percentage is text, not just a slice size — which is what makes the donut
 * readable without relying on colour or arc length. See CompositionRow for the
 * same principle on the net-worth screen.
 */
function AllocationRow({ position, color }: AllocationRowProps) {
  return (
    <li className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-xs"
          style={{ backgroundColor: color }}
        />
        {/* truncate so an unusually long fund name can't push the percentage
            off the card's edge. Mono for the ticker (a code), font-sans on the
            prose fallback — same rule as HoldingRow. */}
        <span
          className={cn(
            "truncate text-sm text-foreground",
            !position.ticker && "font-sans"
          )}
        >
          {position.ticker ?? position.name}
        </span>
      </span>
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        {position.allocationPct.toFixed(1)}%
      </span>
    </li>
  )
}

export default AllocationRow
