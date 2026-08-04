import { cn } from "@/lib/utils"
import type { Position } from "@/data"
import { changeTone, signedCurrency, signedPercent } from "./palette"

interface HoldingRowProps {
  position: Position
  /** Colour for the ticker dot, matched to this position's donut segment. */
  color: string
}

// Shared cell padding. Mirrors TransactionRow's scheme exactly — px-4 with
// pl-6/pr-6 on the outer edges — so the column headers in HoldingsTable can
// reuse the same values and line up over their columns.
const cellClass = "px-4 py-4 align-middle first:pl-6 last:pr-6"

/**
 * One security in the holdings table.
 *
 * Most cells stack two lines: the primary figure over a muted secondary. That
 * keeps eight columns' worth of information in five columns, which is what
 * makes the table readable at this density.
 */
function HoldingRow({ position, color }: HoldingRowProps) {
  const { ticker, name, quantity, price, value, gain, gainPct } = position

  return (
    <tr className="border-t border-border">
      {/* Ticker + its colour key. The dot is decoration: the ticker text is
          always present, so nothing here depends on seeing the colour. */}
      <td className={cellClass}>
        <span className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-xs"
            style={{ backgroundColor: color }}
          />
          {/* A ticker is a code, so it keeps the Card's mono default — that's
              what makes the column scan. Not every security has one (some
              money-market funds don't), and the fallback is a prose fund name,
              which switches to font-sans like every other name in the app. */}
          <span
            className={cn(
              "font-semibold text-foreground",
              !ticker && "font-sans"
            )}
          >
            {ticker ?? name}
          </span>
        </span>
      </td>

      {/* Market value over "quantity · full name". */}
      <td className={cellClass}>
        <p className="tabular-nums text-foreground">
          ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {quantity.toLocaleString("en-US", { maximumFractionDigits: 1 })} sh ·{" "}
          {name}
        </p>
      </td>

      {/* Price over today's move. */}
      <td className={cn(cellClass, "text-right")}>
        <p className="tabular-nums text-foreground">
          ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p
          className={cn(
            "mt-1 text-xs tabular-nums",
            changeTone(position.dayChangePct)
          )}
        >
          {signedPercent(position.dayChangePct)}
        </p>
      </td>

      {/* Total gain over gain %. Both null when cost basis is unknown — Plaid
          doesn't always supply it, and an em dash says "unknown" where a $0
          would wrongly claim the position is exactly break-even. */}
      <td className={cn(cellClass, "text-right")}>
        {gain === null ? (
          <p className="text-muted-foreground">—</p>
        ) : (
          <>
            {/* Amount stays neutral, percentage carries the colour — the same
                split as the price column above and the summary tiles. With
                every row coloured on both lines the table turned into a wall
                of teal; confining it to one line per cell makes the figures
                that matter stand out. The +/− sign means direction is still
                readable without seeing colour at all. */}
            <p className="tabular-nums text-foreground">
              {signedCurrency(gain)}
            </p>
            {gainPct !== null && (
              <p className={cn("mt-1 text-xs tabular-nums", changeTone(gain))}>
                {signedPercent(gainPct)}
              </p>
            )}
          </>
        )}
      </td>

      <td className={cn(cellClass, "text-right tabular-nums text-foreground")}>
        {position.allocationPct.toFixed(1)}%
      </td>
    </tr>
  )
}

export default HoldingRow
