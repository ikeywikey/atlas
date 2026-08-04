// Shared presentation helpers for the investments screen.
//
// These live in one module because four separate places render the same
// position — the donut segment, the table's ticker dot, the legend swatch, and
// the dashboard allocation bar. If each derived its own colour they'd drift the
// moment the ramp changed, and a legend that disagrees with its chart is worse
// than no legend.

// The chart ramp from index.css, walked largest-position-first. `chart-1..5`
// step down the brand blue; `chart-6` is the neutral "everything else" token.
const POSITION_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
]

/**
 * Colour for the position at `index`, assuming positions arrive largest-first
 * (which `summarizeHoldings` guarantees).
 *
 * Past the end of the ramp it repeats the last entry rather than cycling back
 * to `chart-1` — the same `Math.min(i, length - 1)` convention CompositionCard
 * uses. Cycling would put a bright blue slice next to the largest holding's
 * bright blue slice and read as a second big position; repeating the neutral
 * token instead makes the long tail look like a tail. This is what lets the
 * screen handle 3 positions or 30 without the palette being edited.
 */
export function positionColor(index: number): string {
  return POSITION_COLORS[Math.min(index, POSITION_COLORS.length - 1)]
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
