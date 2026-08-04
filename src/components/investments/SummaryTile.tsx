import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SummaryTileProps {
  /** Tracked-out eyebrow above the figure ("MARKET VALUE"). */
  label: string
  /** The headline figure, pre-formatted by the caller — the tile doesn't know
   *  whether it's showing money, a count, or a percentage. */
  value: string
  /** Muted supporting line under the figure ("+$546 (+0.5%) today"). */
  sub?: React.ReactNode
  /** Optional tone class for the headline (gain/loss colouring). Defaults to
   *  neutral, which is right for a plain magnitude like market value. */
  valueClassName?: string
}

/**
 * One KPI tile from the top of the investments screen.
 *
 * Deliberately one component rendered three times rather than three near-
 * identical ones — the same call made for NetWorthCard's `variant`. All that
 * differs between Market value / Total gain / Cost basis is the three strings
 * and the headline colour, so those are the props and nothing else.
 */
function SummaryTile({ label, value, sub, valueClassName }: SummaryTileProps) {
  return (
    <Card>
      <p className="text-xs tracking-wider text-muted-foreground">{label}</p>
      {/* tabular-nums so the three tiles' digits sit on a common grid; the
          clamp lets the figure shrink on narrow columns instead of wrapping
          mid-number, which reads as two separate values. */}
      <p
        className={cn(
          "mt-3 text-[clamp(1.5rem,3.2vw,2rem)] leading-none tabular-nums text-foreground",
          valueClassName
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-3 text-xs text-muted-foreground">{sub}</p>}
    </Card>
  )
}

export default SummaryTile
