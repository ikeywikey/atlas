import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import NetWorthChart from "@/components/netWorth/NetWorthChart.tsx"
import { cn } from "@/lib/utils"
import {
  getNetWorthHistory,
  getNetWorthSummary,
  type NetWorthRange,
} from "@/data"

const RANGE_OPTIONS: { value: NetWorthRange; label: string }[] = [
  { value: "wk", label: "W" },
  { value: "month", label: "M" },
  { value: "6month", label: "6M" },
  { value: "1yr", label: "Y" },
]

// A net-worth change can go either way (a down month, a losing range) even
// though today's mock series only trends up — render the sign/arrow/color
// from the actual value instead of assuming positive.
function formatChange(value: number) {
  const isPositive = value >= 0
  return {
    isPositive,
    amount: `${isPositive ? "+" : "-"}$${Math.abs(value).toLocaleString("en-US")}`,
  }
}

/**
 * The same card at two scales — a tile on the dashboard, and the hero of the
 * net-worth page. Comparing docs/design/dashboard.png against
 * "net worth pagepng.png", they differ in exactly four things, all captured in
 * this table. Everything else (state, range toggle, data access, formatting)
 * is shared, which is why this is one component with a variant rather than two.
 */
const VARIANTS = {
  card: {
    eyebrow: "NET WORTH",
    card: "min-h-65 min-w-100",
    headline: "text-[clamp(1.75rem,8cqw,3rem)]",
    chartHeight: 200,
    /** Cents on the tile, whole dollars on the hero — at hero size the ".00"
     *  is two characters of noise on the page's loudest number. */
    fractionDigits: 2,
  },
  hero: {
    eyebrow: "TOTAL NET WORTH",
    card: "",
    // Sized so the hero plus both composition cards clear a ~825px viewport
    // without scrolling, the way docs/design/net worth pagepng.png reads —
    // the whole point of the screen is seeing the total and what's behind it
    // at a glance.
    headline: "text-[clamp(2rem,5cqw,3.25rem)] tracking-tight",
    chartHeight: 230,
    fractionDigits: 0,
  },
} as const

interface NetWorthCardProps {
  title?: string
  /** "card" = dashboard tile (default), "hero" = net-worth page headline. */
  variant?: keyof typeof VARIANTS
}

function NetWorthCard({ title, variant = "card" }: NetWorthCardProps) {
  const [range, setRange] = useState<NetWorthRange>("6month")
  const history = getNetWorthHistory(range)
  const summary = getNetWorthSummary(range)
  const monthChange = formatChange(summary.monthChange)
  const rangeChange = formatChange(summary.rangeChange)

  const styles = VARIANTS[variant]
  const isHero = variant === "hero"

  return (
    <Card className={cn("@container", styles.card)}>
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs">
          {title ?? styles.eyebrow}
        </h2>

        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => {
            if (value) setRange(value as NetWorthRange)
          }}
          className="rounded-md bg-muted p-1"
        >
          {RANGE_OPTIONS.map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              size="sm"
              className="rounded-sm cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className={cn("text-foreground mt-0.5", styles.headline)}>
        $
        {summary.current.toLocaleString("en-US", {
          minimumFractionDigits: styles.fractionDigits,
          maximumFractionDigits: styles.fractionDigits,
        })}
      </p>

      {/* The hero leads with the selected range on one line; the dashboard tile
          shows the fixed "this month" change alongside it. */}
      {isHero ? (
        <p className="mt-2.5 ml-1 text-sm">
          <span
            className={
              rangeChange.isPositive ? "text-positive" : "text-destructive"
            }
          >
            {rangeChange.amount} ({rangeChange.isPositive ? "+" : "-"}
            {Math.abs(summary.rangeChangePct).toFixed(1)}%)
          </span>
          <span className="text-muted-foreground"> · {summary.rangeLabel}</span>
        </p>
      ) : (
        <div className="flex gap-5 mt-2.5 ml-1">
          <h3
            className={cn(
              "font-semibold text-xs",
              monthChange.isPositive ? "text-positive" : "text-destructive"
            )}
          >
            {monthChange.isPositive ? "▲" : "▼"} {monthChange.amount} this month
          </h3>
          <h3 className="text-muted-foreground text-xs">
            {summary.rangeLabel} ·{" "}
            <span
              className={
                rangeChange.isPositive ? "text-positive" : "text-destructive"
              }
            >
              {rangeChange.amount} ({rangeChange.isPositive ? "+" : "-"}
              {Math.abs(summary.rangeChangePct).toFixed(1)}%)
            </span>
          </h3>
        </div>
      )}

      {/* Bleeds the chart out to (just past) the card's edges. Kept at -mx-6
          against the Card's p-5 exactly as it was before this component was
          split — changing it would move the dashboard tile. */}
      <div className="-mx-6">
        <NetWorthChart data={history} height={styles.chartHeight} />
      </div>
    </Card>
  )
}

export default NetWorthCard
