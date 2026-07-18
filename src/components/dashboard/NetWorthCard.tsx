import { useState } from "react"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
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

// Parsed as local-time year/month/day (not `new Date(isoString)`, which
// Node/browsers treat as UTC midnight and can render a day early depending
// on the viewer's timezone) so the tooltip date always matches the snapshot.
function formatTooltipDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface NetWorthCardProps {
  title?: string
}

function NetWorthCard({ title = "NET WORTH" }: NetWorthCardProps) {
  const [range, setRange] = useState<NetWorthRange>("6month")
  const history = getNetWorthHistory(range)
  const summary = getNetWorthSummary(range)
  const monthChange = formatChange(summary.monthChange)
  const rangeChange = formatChange(summary.rangeChange)

  return (
    <Card className="@container min-h-65 min-w-100">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs">{title}</h2>

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

      <p className="text-foreground text-[clamp(1.75rem,8cqw,3rem)] mt-0.5">
        $
        {summary.current.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      <div className="flex gap-5 mt-2.5 ml-1">
        <h3
          className={cn(
            "font-semibold text-xs",
            monthChange.isPositive ? "text-positive" : "text-destructive",
          )}
        >
          {monthChange.isPositive ? "▲" : "▼"} {monthChange.amount} this month
        </h3>
        <h3 className="text-muted-foreground text-xs">
          {summary.rangeLabel} ·{" "}
          <span
            className={rangeChange.isPositive ? "text-positive" : "text-destructive"}
          >
            {rangeChange.amount} ({rangeChange.isPositive ? "+" : "-"}
            {Math.abs(summary.rangeChangePct).toFixed(1)}%)
          </span>
        </h3>
      </div>

      <div className="-mx-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.23} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis dataKey="date" hide />
            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              labelFormatter={(label) =>
                typeof label === "string" ? formatTooltipDate(label) : label
              }
              itemStyle={{ color: "var(--brand)" }}
              formatter={(value) => [
                `$${Number(value).toLocaleString("en-US")}`,
                "Net Worth",
              ]}
            />
            <Area
              type="monotone"
              dataKey="netWorth"
              strokeWidth={2.5}
              stroke="var(--brand)"
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default NetWorthCard
