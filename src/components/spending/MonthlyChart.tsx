// Recharts pieces used here, and what each one is:
//   BarChart   — the plot container; it owns the data and the scales
//   Bar        — one series of bars, keyed to a field on each datum
//   Rectangle  — the default mark a Bar draws; re-used here to recolour one
//   XAxis      — the category axis along the bottom
//   LabelList  — text drawn against each bar, from a field on the datum
// This is the app's first bar chart; every other Recharts usage so far has been
// a Pie (AllocationCard, DashboardSpendingCard) or an Area (NetWorthChart).
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  XAxis,
} from "recharts"
import type { RectangleProps } from "recharts"

import { Card } from "@/components/ui/card"
import { currency } from "@/lib/palette"
import type { MonthlySpending } from "@/data"

/**
 * Total spend per month for the last six months.
 *
 * Deliberately spare: no y-axis, no grid lines, no tooltip. Every bar's exact
 * value is printed directly above it, which is possible because there are only
 * six of them — and once the number is already on screen, an axis and a hover
 * tooltip are two more ways to read a value you can read at a glance. Grid
 * lines would compete with the bars for the same ink.
 *
 * The final bar is the current month and is the only one in the bright brand
 * blue; the earlier months sit in the neutral tail colour. Colour here is
 * saying "you are here", not encoding a value — the month labels underneath
 * carry that regardless, so nothing depends on seeing the highlight.
 */
function MonthlyChart({ months }: { months: MonthlySpending[] }) {
  // Pre-format the labels rather than passing a `formatter` to LabelList: the
  // label then reads off a plain field, same as every other dataKey on the
  // chart, and there's no callback to keep in sync with the currency helper.
  const lastIndex = months.length - 1

  const data = months.map((month, i) => ({
    ...month,
    label: currency(month.amount),
    // Colour lives on the datum because the `shape` callback below only
    // receives the payload — it can't see the array index. Same reason the
    // Pie charts in this app carry a `color` field.
    // `muted` rather than the chart ramp's neutral tail: this isn't a ranked
    // series where each bar means something different, it's one series where
    // five bars are context and one is "now". A recessive surface token says
    // that; chart-6 was light enough to compete with the highlight.
    color: i === lastIndex ? "var(--chart-1)" : "var(--muted)",
  }))

  return (
    <Card>
      <h2 className="font-sans font-semibold text-foreground">
        Monthly spending — last 6 months
      </h2>

      {data.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No spending history yet.
        </p>
      ) : (
        <div className="mt-4">
          {/* ResponsiveContainer measures its parent and hands the chart a
              pixel width — Recharts renders SVG, which needs real numbers, not
              percentages. The top margin is what keeps the value labels from
              being clipped above the tallest bar.
              The height is the design reference's (~150px of plot), not a
              guess: this card sits below the fold-critical row, so every pixel
              it takes is one the screen can't spare. Six labelled bars stay
              perfectly readable at this size. */}
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              data={data}
              margin={{ top: 24, right: 8, bottom: 0, left: 8 }}
            >
              {/* `interval={0}` forces every month to be labelled; Recharts
                  otherwise drops ticks it thinks would collide. */}
              <XAxis
                dataKey="month"
                interval={0}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Bar
                dataKey="amount"
                maxBarSize={80}
                // Same reason as the donuts: Recharts' entrance animation has
                // rendered charts as nothing in this app before. Data should be
                // readable immediately, not after a transition.
                isAnimationActive={false}
                // Overriding `shape` is how the rest of the app recolours a
                // Recharts series (see AllocationCard). The alternative,
                // mapping <Cell> children, is deprecated in Recharts 3.
                shape={(
                  props: RectangleProps & { payload?: (typeof data)[number] }
                ) => (
                  <Rectangle
                    {...props}
                    fill={props.payload?.color}
                    // Rounded top corners only — the bottom sits on the
                    // baseline, so rounding it would lift the bar off its own
                    // axis.
                    radius={[6, 6, 0, 0]}
                  />
                )}
              >
                <LabelList
                  dataKey="label"
                  position="top"
                  offset={12}
                  fill="var(--muted-foreground)"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default MonthlyChart
