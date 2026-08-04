import { Card } from "@/components/ui/card"
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts"
import type { PieSectorShapeProps } from "recharts"
import AllocationRow from "./AllocationRow"
import { rampColor } from "@/lib/palette"
import type { Position } from "@/data"

/**
 * Portfolio allocation as a donut plus a legend.
 *
 * Everything on this card is derived from the `positions` array it's handed —
 * the donut's segments, the legend's rows, and the count in the middle are all
 * reading the same list. Add or remove a holding in the data layer and all
 * three move together; there is no hardcoded segment, colour assignment, or
 * "8" anywhere in this file.
 *
 * A donut is a weak chart past ~6 slices (adjacent small arcs stop being
 * distinguishable) and it encodes its categories purely by colour. Both are
 * covered by pairing it with the legend below, which prints every position's
 * exact percentage as text — and by the holdings table's PORT % column, which
 * does the same. The donut is the fast visual read; the numbers are the truth.
 */
function AllocationCard({ positions }: { positions: Position[] }) {
  // Recharts needs the colour on the datum itself, since the `shape` callback
  // only receives the payload — it can't see the array index.
  const data = positions.map((position, i) => ({
    ...position,
    color: rampColor(i),
  }))

  return (
    <Card className="flex flex-col">
      <h2 className="font-sans text-sm font-semibold text-foreground">
        Allocation
      </h2>

      {positions.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Nothing to allocate yet.
        </p>
      ) : (
        <>
          {/* `relative` so the centre label can be absolutely positioned over
              the donut — Recharts has no built-in centre-content slot. */}
          <div className="relative mt-5">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="ticker"
                  innerRadius="72%"
                  outerRadius="100%"
                  // A small gap between segments; without it the two smallest
                  // positions, which share the neutral tail colour, would read
                  // as one slice.
                  paddingAngle={2}
                  // Not cosmetic — without this the donut renders as nothing.
                  // Recharts starts each entrance sector collapsed
                  // (startAngle === endAngle) and here the animation never
                  // advances past elapsed-time 0, so all eight sectors stay
                  // zero-width forever. Turning the entrance off paints them at
                  // their real angles immediately. It also matches the chart
                  // guidance that data should be readable at once rather than
                  // gated behind an animation.
                  isAnimationActive={false}
                  // Overriding `shape` (rather than mapping <Cell>) is how the
                  // rest of the app colours a Pie — see DashboardSpendingCard.
                  shape={(props: PieSectorShapeProps) => (
                    <Sector
                      {...props}
                      fill={props.payload?.color}
                      stroke="none"
                    />
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* pointer-events-none so the label never intercepts a hover meant
                for the segment underneath it. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl tabular-nums text-foreground">
                {positions.length}
              </p>
              <p className="text-xs text-muted-foreground">
                {positions.length === 1 ? "HOLDING" : "HOLDINGS"}
              </p>
            </div>
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {data.map((position, i) => (
              <AllocationRow
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

export default AllocationCard
