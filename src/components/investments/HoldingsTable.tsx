import { Card } from "@/components/ui/card"
import HoldingRow from "./HoldingRow"
import { rampColor } from "@/lib/palette"
import type { Position } from "@/data"

// Tracked-out mono column labels, using the SAME horizontal padding as the body
// cells in HoldingRow (px-4, pl-6/pr-6 on the outer edges) so each title lines
// up exactly over its column. Alignment is set per-column so it never fights a
// shared class. Lifted from TransactionsFeed — same table, same rules.
const columnClass =
  "px-4 pt-5 pb-3 text-xs font-normal tracking-wider text-muted-foreground first:pl-6 last:pr-6"

/**
 * The holdings table — one row per security, largest position first.
 *
 * Renders whatever positions it's handed; it holds no data of its own, so
 * adding or removing a holding upstream changes this table with no edit here.
 *
 * This table is also the allocation donut's accessibility fallback: a donut
 * conveys its segments by colour alone, so the exact percentage for every
 * position has to be readable as text somewhere. That's the PORT % column.
 */
function HoldingsTable({ positions }: { positions: Position[] }) {
  return (
    <Card className="p-0">
      {positions.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm text-foreground">No holdings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Link a brokerage or retirement account to see your positions here.
          </p>
        </div>
      ) : (
        // Scrolls sideways on narrow viewports instead of breaking the page.
        <div className="overflow-x-auto">
          <table className="w-full min-w-xl text-sm">
            <thead>
              <tr>
                <th className={`${columnClass} text-left`}>Ticker</th>
                <th className={`${columnClass} text-left`}>Value / Qty</th>
                <th className={`${columnClass} text-right`}>Price</th>
                <th className={`${columnClass} text-right`}>Gain</th>
                <th className={`${columnClass} text-right`}>% of Portfolio</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, i) => (
                <HoldingRow
                  key={position.security_id}
                  position={position}
                  // Index-matched to the donut: positions arrive largest-first
                  // from summarizeHoldings, and the donut walks the same array.
                  color={rampColor(i)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

export default HoldingsTable
