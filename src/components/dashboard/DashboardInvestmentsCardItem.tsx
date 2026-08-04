import { currency } from "@/lib/palette"
import { cn } from "@/lib/utils"
import type { Position } from "@/data"

interface DashboardInvestmentsCardItemProps {
  position: Position
  /** Swatch colour, matched to this position's segment of the allocation bar. */
  color: string
}

/**
 * One holding on the dashboard's investments card: swatch, ticker, name,
 * value, and share of the portfolio.
 *
 * Its own file rather than inline JSX, matching every other per-item row in
 * the app (AccountsCardItem, AllocationRow, CompositionRow, HoldingRow,
 * CategoryRow) — a card component should read as its own layout, not as a
 * layout with a row template buried in a `.map()`.
 *
 * The swatch is what ties the row to the bar above it, and it's decoration on
 * top of a printed ticker and amount, so nothing here depends on colour.
 */
function DashboardInvestmentsCardItem({
  position,
  color,
}: DashboardInvestmentsCardItemProps) {
  return (
    <li className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-xs"
        style={{ backgroundColor: color }}
      />
      {/* Fixed-width ticker column so the names all start on the same line,
          the way the design aligns them. Mono for the ticker (a code),
          font-sans on the prose fallback — same rule as HoldingRow. */}
      <span
        className={cn(
          "w-14 shrink-0 truncate text-sm font-semibold text-foreground",
          !position.ticker && "font-sans"
        )}
      >
        {position.ticker ?? position.name}
      </span>
      {/* min-w-0 is what lets `truncate` actually bite: a flex child won't
          shrink below its content width without it. */}
      <span className="min-w-0 flex-1 truncate font-sans text-xs text-muted-foreground">
        {position.name}
      </span>
      <span className="shrink-0 text-sm tabular-nums text-foreground">
        {currency(position.value)}
      </span>
      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {position.allocationPct.toFixed(1)}%
      </span>
    </li>
  )
}

export default DashboardInvestmentsCardItem
