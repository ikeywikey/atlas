import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts"
import type { PieSectorShapeProps } from "recharts"

import { Card } from "@/components/ui/card"
import { currency, rampColor } from "@/lib/palette"
import CategoryRow from "./CategoryRow"
import type { SpendingCategory } from "@/data"

interface CategoryCardProps {
  categories: SpendingCategory[]
  /** Calendar month the figures cover, shown top-right. */
  period: string
}

/**
 * Where the month's money went: a donut beside a ranked list of categories.
 *
 * The two halves are the same data twice, on purpose. A donut is a weak chart
 * past ~6 slices — adjacent small arcs stop being distinguishable — and it
 * encodes its categories purely by colour, which fails for colourblind readers.
 * The list is what makes that acceptable: every category is named and its exact
 * amount printed, so the donut is the fast visual read and the rows are the
 * truth. Same pairing the investments AllocationCard uses.
 *
 * Nothing here is hardcoded to eight categories — the segments, rows, colours
 * and centre total are all derived from `categories`, so the card follows the
 * data layer.
 */
function CategoryCard({ categories, period }: CategoryCardProps) {
  // Recharts needs the colour on the datum itself: the `shape` callback only
  // receives the payload, so it can't see the array index.
  const data = categories.map((category, i) => ({
    ...category,
    color: rampColor(i),
  }))

  const total = categories.reduce((sum, c) => sum + c.amount, 0)
  // `getSpending()` guarantees largest-first, so the first row is the max the
  // bars are scaled against. Guarded for the empty case.
  const max = categories[0]?.amount ?? 0

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-semibold text-foreground">By category</h2>
        <p className="font-sans text-xs font-semibold text-muted-foreground">
          {period}
        </p>
      </div>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No spending recorded for {period}.
        </p>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-6 lg:flex-row">
          {/* `relative` so the centre label can be absolutely positioned over
              the donut — Recharts has no built-in centre-content slot.
              Sized to the design reference (~160px) rather than left to fill
              the column: the eight rows beside it already set the card's
              height, and a larger donut would only push the screen past the
              fold without telling anyone anything more. */}
          <div className="relative w-44 shrink-0">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius="72%"
                  outerRadius="100%"
                  // A small gap between segments; without it the smallest
                  // categories, which share the neutral tail colour, would read
                  // as one slice.
                  paddingAngle={2}
                  // Not cosmetic — without this the donut can render as
                  // nothing. Recharts starts each entrance sector collapsed
                  // (startAngle === endAngle) and the animation has been
                  // observed never advancing past elapsed-time 0, leaving every
                  // sector zero-width forever. See AllocationCard for the full
                  // note. It also matches the chart rule that data should be
                  // readable at once rather than gated behind an animation.
                  isAnimationActive={false}
                  // Overriding `shape` (rather than mapping <Cell>) is how the
                  // rest of the app colours a Pie — see AllocationCard and
                  // DashboardSpendingCard.
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
              <p className="text-2xl tracking-wide text-foreground">
                {currency(total)}
              </p>
              <p className="font-sans text-xs text-muted-foreground">SPENT</p>
            </div>
          </div>

          <ul className="flex w-full flex-1 flex-col gap-2">
            {data.map((category, i) => (
              <CategoryRow
                key={category.category}
                category={category}
                max={max}
                color={rampColor(i)}
              />
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

export default CategoryCard
