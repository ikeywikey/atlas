// Shared presentation helpers for charts and money figures.
//
// These live in one module because several unrelated screens render the same
// two things: a ranked list coloured off the chart ramp (the investments donut,
// its table, the dashboard allocation bar, the spending donut and its category
// rows) and a signed gain/loss figure. If each derived its own colour they'd
// drift the moment the ramp changed, and a legend that disagrees with its chart
// is worse than no legend.
//
// It sits in `lib/` rather than under a feature folder precisely because it's
// cross-feature — `components/<feature>/` is for UI that belongs to one screen.

// The chart ramp from index.css, walked largest-item-first. `chart-1..5` step
// down the brand blue; `chart-6` is the neutral "everything else" token.
const RAMP_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

/**
 * Colour for the item at `index`, assuming items arrive largest-first (which
 * `summarizeHoldings` and `getSpending` both guarantee).
 *
 * Past the end of the ramp it repeats the last entry rather than cycling back
 * to `chart-1` — the same `Math.min(i, length - 1)` convention CompositionCard
 * uses. Cycling would put a bright blue slice next to the largest item's bright
 * blue slice and read as a second big value; repeating the neutral token
 * instead makes the long tail look like a tail. This is what lets a screen
 * handle 3 items or 30 without the palette being edited.
 */
export function rampColor(index: number): string {
  return RAMP_COLORS[Math.min(index, RAMP_COLORS.length - 1)]
}

/**
 * Tailwind text class for a gain/loss figure.
 *
 * `destructive` (red) is correct here, unlike on the net-worth liabilities card
 * where money merely *owed* is `warning` — a position below its cost basis is a
 * real loss. Exactly zero stays neutral rather than claiming a direction.
 */
export function changeTone(value: number): string {
  if (value > 0) return "text-positive"
  if (value < 0) return "text-destructive"
  return "text-muted-foreground"
}

/**
 * A signed money string: "+$3,906", "−$427", "$0".
 *
 * The explicit sign matters for more than tidiness — colour alone can't carry
 * gain-vs-loss for colourblind users, so the glyph is the accessible channel
 * and the colour reinforces it. Uses a real minus (−, U+2212) rather than a
 * hyphen so it optically matches the +.
 */
export function signedCurrency(value: number, fractionDigits = 0): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  const amount = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return `${sign}$${amount}`
}

/** The same, for percentages: "+35.1%", "−4.7%", "0.0%". */
export function signedPercent(value: number, fractionDigits = 1): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : ""
  return `${sign}${Math.abs(value).toFixed(fractionDigits)}%`
}

/** A plain whole-dollar string: "$119,354". No sign, no cents. */
export function currency(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}
