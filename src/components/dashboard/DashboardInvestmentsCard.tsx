// `Link` is react-router's anchor. It renders a real <a href> — so it stays
// middle-clickable, right-click-copyable and crawlable — but intercepts the
// click and updates the History API instead of letting the browser navigate.
// A plain <a> here would trigger a full page load: React would unmount, the
// bundle would re-parse, and AppShell (nav rail included) would remount and
// flash. Inside the router, always Link.
import { Link } from "react-router"

import { Card } from "@/components/ui/card"
import AllocationBar from "@/components/investments/AllocationBar"
import DashboardInvestmentsCardItem from "./DashboardInvestmentsCardItem"
import {
  changeTone,
  currency,
  rampColor,
  signedCurrency,
  signedPercent,
} from "@/lib/palette"
import { cn } from "@/lib/utils"
import { getInvestmentsSummary } from "@/data"

// How many holdings the dashboard shows before deferring to the full screen.
// This card is a summary; the investments page has the complete table.
const TOP_HOLDINGS = 4

/**
 * Portfolio summary for the dashboard: headline value, today's move, the
 * allocation bar, and the largest few holdings.
 *
 * This is the one place `AllocationBar` is mounted — the compact geometry it
 * was built for. The investments screen uses the donut instead, because it has
 * the room for a legend; here a bar plus four labelled rows says the same thing
 * in a third of the height.
 */
function DashboardInvestmentsCard() {
  const { marketValue, dayChange, dayChangePct, positions } =
    getInvestmentsSummary()

  // `summarizeHoldings` already returns positions largest-first, so this is a
  // slice, not a re-sort — and the colours stay tied to each position's rank in
  // the *whole* portfolio, matching the bar above them and the donut on the
  // investments screen.
  const top = positions.slice(0, TOP_HOLDINGS)

  return (
    <Card className="min-w-100">
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          Investments
        </h2>
        <Link
          to="/investments"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          view all →
        </Link>
      </div>

      {positions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No holdings yet.</p>
      ) : (
        <>
          <p className="mt-4 text-3xl tracking-wide text-foreground">
            {currency(marketValue)}
          </p>
          {/* The whole line takes the gain/loss colour here, unlike the
              investments screen where only the percentage is tinted. That
              split exists to stop a *table* of gains reading as a wall of
              teal; this is a single summary line, and the design reference
              colours all of it. The +/− sign still carries direction on its
              own, so the colour is reinforcement rather than the only cue. */}
          <p className={cn("mt-1.5 text-sm", changeTone(dayChange))}>
            {signedCurrency(dayChange)} ({signedPercent(dayChangePct)}) today
          </p>

          <div className="mt-4">
            <AllocationBar positions={positions} />
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {top.map((position, i) => (
              <DashboardInvestmentsCardItem
                key={position.security_id}
                position={position}
                color={rampColor(i)}
              />
            ))}
          </ul>
        </>
      )}
    </Card>
  )
}

export default DashboardInvestmentsCard
