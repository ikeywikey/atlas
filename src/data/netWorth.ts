import type { NetWorthSnapshot } from "./types"

// Mock daily net-worth snapshots, shaped like the row Atlas's own snapshot
// job will write in Phase 2 (Plaid has no balance history — see the "Key
// constraint" in root CLAUDE.md). Anchored to the design reference (net
// worth page.png): $171,334 today, +$1,820 this month, +$14,362 (+9.1%)
// over the past 6 months.
const DAY_MS = 24 * 60 * 60 * 1000
const HISTORY_DAYS = 400

const CURRENT = 171334
const MONTH_AGO = CURRENT - 1820
const SIX_MONTHS_AGO = 156972
const YEAR_AGO = 138000

/**
 * The smooth trend value for a given day, before noise. Piecewise-linear
 * through the four anchors above (0/30/182/365 days ago), so the curve
 * passes through the exact design numbers at those points and interpolates
 * between them everywhere else.
 */
function baseValue(daysAgo: number): number {
  if (daysAgo <= 30) {
    const t = daysAgo / 30
    return CURRENT + (MONTH_AGO - CURRENT) * t
  }
  if (daysAgo <= 182) {
    const t = (daysAgo - 30) / (182 - 30)
    return MONTH_AGO + (SIX_MONTHS_AGO - MONTH_AGO) * t
  }
  const t = (daysAgo - 182) / (365 - 182)
  return SIX_MONTHS_AGO + (YEAR_AGO - SIX_MONTHS_AGO) * t
}

/**
 * Deterministic pseudo-random wiggle (+/- 350) added to `baseValue` so the
 * chart doesn't render as a flat set of straight line segments. Deliberately
 * not `Math.random()` — the same daysAgo always produces the same noise, so
 * the curve is stable across reloads instead of reshuffling.
 */
function noise(daysAgo: number): number {
  const x = Math.sin(daysAgo * 12.9898) * 43758.5453
  return (x - Math.floor(x) - 0.5) * 700
}

const ANCHORS: Partial<Record<number, number>> = {
  0: CURRENT,
  30: MONTH_AGO,
  182: SIX_MONTHS_AGO,
  365: YEAR_AGO,
}

// One row per day for the last `HISTORY_DAYS` days, oldest first, ending
// today. Anchor days get their exact target value; every other day gets
// `baseValue + noise`.
const mockNetWorthHistory: NetWorthSnapshot[] = Array.from(
  { length: HISTORY_DAYS },
  (_, i) => {
    const daysAgo = HISTORY_DAYS - 1 - i
    const netWorth =
      ANCHORS[daysAgo] ?? Math.round(baseValue(daysAgo) + noise(daysAgo))
    const date = new Date(Date.now() - daysAgo * DAY_MS)
      .toISOString()
      .slice(0, 10)
    return { date, netWorth }
  }
)

// Matches the values the NetWorthCard ToggleGroup already uses — no remapping layer needed.
export type NetWorthRange = "wk" | "month" | "6month" | "1yr"

const RANGE_DAYS: Record<NetWorthRange, number> = {
  wk: 7,
  month: 30,
  "6month": 182,
  "1yr": 365,
}

const RANGE_LABELS: Record<NetWorthRange, string> = {
  wk: "Past week",
  month: "Past month",
  "6month": "Past 6 months",
  "1yr": "Past year",
}

// Data-access seam (see accounts.ts) — components call these, never the mock
// array directly. Phase 2 swaps the body for a real snapshot-table query.

/**
 * Daily snapshots for the requested range, oldest first, ending today.
 * Feeds the NetWorthCard area chart directly.
 */
export function getNetWorthHistory(range: NetWorthRange): NetWorthSnapshot[] {
  return mockNetWorthHistory.slice(-(RANGE_DAYS[range] + 1))
}

/**
 * Headline stats for the NetWorthCard: current balance, the fixed "this
 * month" change (shown regardless of which range is selected, matching the
 * design), and the change/label for the selected range.
 */
export function getNetWorthSummary(range: NetWorthRange) {
  const current = mockNetWorthHistory[mockNetWorthHistory.length - 1].netWorth
  const monthAgo =
    mockNetWorthHistory[mockNetWorthHistory.length - 1 - RANGE_DAYS.month]
      .netWorth
  const monthChange = current - monthAgo

  const rangeStart =
    mockNetWorthHistory[mockNetWorthHistory.length - 1 - RANGE_DAYS[range]]
      .netWorth
  const rangeChange = current - rangeStart
  const rangeChangePct = (rangeChange / rangeStart) * 100

  return {
    current,
    monthChange,
    rangeChange,
    rangeChangePct,
    rangeLabel: RANGE_LABELS[range],
  }
}
