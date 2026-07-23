import { useId } from "react"
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

import type { NetWorthSnapshot } from "@/data"

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

interface NetWorthChartProps {
  data: NetWorthSnapshot[]
  /** Chart height in px — the only thing that differs between the dashboard
   *  card (200) and the net-worth page hero (420). */
  height: number
}

/**
 * The net-worth area chart on its own — no card, no headline, no range toggle.
 *
 * Extracted so the dashboard card and the net-worth page hero share one set of
 * Recharts config (axes, tooltip styling, gradient) instead of two copies that
 * drift apart. Everything around it lives in NetWorthCard.
 */
function NetWorthChart({ data, height }: NetWorthChartProps) {
  // SVG <defs> ids are global to the document, so a hardcoded "chartGradient"
  // would collide as soon as two charts mount together — the second <Area>
  // would resolve `url(#chartGradient)` to the first chart's gradient (or to
  // nothing once it unmounts) and render with no fill. useId() gives each
  // instance a stable, unique id that also matches across SSR/hydration.
  const gradientId = useId()

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
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
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default NetWorthChart
