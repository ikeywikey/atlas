import PageHeader from "@/components/layout/PageHeader.tsx"
import SummaryTile from "@/components/investments/SummaryTile.tsx"
import HoldingsTable from "@/components/investments/HoldingsTable.tsx"
import AllocationCard from "@/components/investments/AllocationCard.tsx"
import {
  changeTone,
  currency,
  signedCurrency,
  signedPercent,
} from "@/lib/palette"
import { getInvestmentsSummary } from "@/data"

function Investments() {
  // Read once per render. A plain synchronous call into the mock data layer
  // today; when it becomes a fetch in Phase 2 this is the line that grows
  // loading/error states, and nothing below it changes shape.
  const {
    marketValue,
    costBasis,
    totalGain,
    totalGainPct,
    dayChange,
    dayChangePct,
    positionCount,
    positions,
  } = getInvestmentsSummary()

  return (
    <div>
      <PageHeader title="Investments" />

      <div className="flex flex-col gap-5">
        {/* Three KPIs. Stacks on narrow viewports rather than squeezing three
            large figures into one row. */}
        <div className="grid gap-5 sm:grid-cols-3">
          <SummaryTile
            label="MARKET VALUE"
            value={currency(marketValue)}
            // The whole line is coloured, dollars included. The
            // colour-the-percentage-only rule applies to the *holdings table*,
            // where a column of coloured dollar figures becomes a wall of teal;
            // a single summary line is one figure and reads better whole. Same
            // call as the TOTAL GAIN tile beside it and the dashboard
            // investments card.
            sub={
              <span className={changeTone(dayChange)}>
                {signedCurrency(dayChange)} ({signedPercent(dayChangePct)}) today
              </span>
            }
          />
          <SummaryTile
            label="TOTAL GAIN"
            value={signedCurrency(totalGain)}
            // Headline stays neutral like the other two tiles — the signed
            // figure already says which way it went. Colour lives on the
            // sub-line only, so all three tiles read as one row.
            sub={
              <span className={changeTone(totalGain)}>
                {signedPercent(totalGainPct)} all time
              </span>
            }
          />
          <SummaryTile
            label="COST BASIS"
            value={currency(costBasis)}
            sub={`${positionCount} ${positionCount === 1 ? "position" : "positions"}`}
          />
        </div>

        {/* Table beside the allocation card on wide screens, stacked below
            lg — the table needs the room, and a 320px donut column would
            squeeze it well before that. */}
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <HoldingsTable positions={positions} />
          <AllocationCard positions={positions} />
        </div>
      </div>
    </div>
  )
}

export default Investments
