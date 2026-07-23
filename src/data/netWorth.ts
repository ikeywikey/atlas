import type {
  Account,
  ManualItem,
  NetWorthBucket,
  NetWorthComposition,
  NetWorthSnapshot,
} from "./types"
import { getAccounts } from "./accounts"
import { getManualItems } from "./manualItems"

// ── Composition: what net worth is made of ───────────────────────────────────

/**
 * Rolls linked accounts + manual items into the assets/liabilities breakdown
 * the net-worth screen renders.
 *
 * Pure (takes its inputs, reads no module state) so it's trivially testable and
 * so a caller can run it over a subset — same split as `summarizeTransactions`
 * in transactions.ts, where `getTransactions()` is the seam and the summarizer
 * is pure.
 *
 * Sign handling: Plaid signs a credit-card balance NEGATIVE (money owed), while
 * `ManualItem.value` is always a positive magnitude with `kind` carrying the
 * direction. Both are normalised here to positive amounts — the group a bucket
 * sits in is what says whether it counts for or against you.
 *
 * Empty buckets are dropped rather than rendered as a $0 row.
 */
export function summarizeNetWorthComposition(
  accounts: Account[],
  manualItems: ManualItem[]
): NetWorthComposition {
  // Sum the accounts of one Plaid `type`, as a positive magnitude.
  const sumAccounts = (type: string) =>
    accounts
      .filter((a) => a.type === type)
      .reduce((total, a) => total + Math.abs(a.balances?.current ?? 0), 0)

  const sumManual = (kind: ManualItem["kind"]) =>
    manualItems
      .filter((i) => i.kind === kind)
      .reduce((total, i) => total + i.value, 0)

  // Drop $0 buckets so a user with no investments doesn't see an empty row.
  const nonEmpty = (buckets: NetWorthBucket[]) =>
    buckets.filter((b) => b.amount > 0)

  const assetBuckets = nonEmpty([
    { label: "Cash & deposits", amount: sumAccounts("depository") },
    { label: "Investments", amount: sumAccounts("investment") },
    { label: "Manual assets", amount: sumManual("asset") },
  ])

  const liabilityBuckets = nonEmpty([
    { label: "Credit cards", amount: sumAccounts("credit") },
    { label: "Loans", amount: sumManual("liability") },
  ])

  const total = (buckets: NetWorthBucket[]) =>
    buckets.reduce((sum, b) => sum + b.amount, 0)

  const assetsTotal = total(assetBuckets)
  const liabilitiesTotal = total(liabilityBuckets)

  return {
    assets: { total: assetsTotal, buckets: assetBuckets },
    liabilities: { total: liabilitiesTotal, buckets: liabilityBuckets },
    netWorth: assetsTotal - liabilitiesTotal,
    // Guard the divide: a brand-new user with no linked accounts has no assets.
    debtToAssetRatio:
      assetsTotal === 0 ? 0 : (liabilitiesTotal / assetsTotal) * 100,
  }
}

/**
 * Data-access seam for the breakdown — components call this, never the
 * summarizer directly. Phase 2 swaps the two `get*` calls for real queries.
 */
export function getNetWorthComposition(): NetWorthComposition {
  return summarizeNetWorthComposition(getAccounts(), getManualItems())
}

// ── History: the snapshot series behind the graph ────────────────────────────

// Mock daily net-worth snapshots, shaped like the row Atlas's own snapshot
// job will write in Phase 2 (Plaid has no balance history — see the "Key
// constraint" in root CLAUDE.md). Anchored to the design reference (net
// worth page.png): $171,334 today, +$1,820 this month, +$14,362 (+9.1%)
// over the past 6 months.
const DAY_MS = 24 * 60 * 60 * 1000
const HISTORY_DAYS = 400

// Today's value is *derived* from the breakdown above rather than hardcoded, so
// the headline on the graph can never drift from the assets/liabilities cards
// sitting underneath it. (It lands on the design's $171,334 because the mock
// balances were tuned to — see the comment in accounts.ts.)
const CURRENT = getNetWorthComposition().netWorth
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
