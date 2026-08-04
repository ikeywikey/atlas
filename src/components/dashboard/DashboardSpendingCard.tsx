import { Card } from "@/components/ui/card"
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts"
import type { PieSectorShapeProps } from "recharts"
import { currency, rampColor } from "@/lib/palette"
import { getSpending, rollUpCategories } from "@/data"

// The dashboard shows six rows; the spending screen shows all eight. Rather
// than a second hardcoded list, the tail is folded into a derived "Other" —
// see rollUpCategories in data/spending.ts. That's what keeps this card's
// total identical to the spending screen's while showing fewer rows.
const DASHBOARD_ROWS = 6

function DashboardSpendingCard() {
  const { period, categories } = getSpending()
  const spending = rollUpCategories(categories, DASHBOARD_ROWS).map(
    (item, i) => ({
      ...item,
      color: rampColor(i),
    })
  )
  const total = spending.reduce((sum, item) => sum + item.amount, 0)

  return (
    <Card className="@container min-h-50 min-w-90">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground font-semibold font-sans">Spending</h2>
        <p className="text-muted-foreground text-xs font-semibold font-sans">
          {period}
        </p>
      </div>

      <div className="flex items-stretch justify-between gap-4 pt-1">
        <div className="relative w-44 shrink-0">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={spending}
                dataKey="amount"
                nameKey="category"
                innerRadius="80%"
                outerRadius="100%"
                paddingAngle={2}
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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xl tracking-wide text-foreground">
              {currency(total)}
            </p>
            <p className="text-muted-foreground text-xs font-sans">SPENT</p>
          </div>
        </div>

        <ul className="flex flex-1 flex-col justify-between py-1">
          {spending.map((item) => (
            <li
              key={item.category}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-xs"
                  style={{ backgroundColor: item.color }}
                />
                {item.category}
              </span>
              <span className="text-xs tabular-nums text-foreground">
                {currency(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

export default DashboardSpendingCard
