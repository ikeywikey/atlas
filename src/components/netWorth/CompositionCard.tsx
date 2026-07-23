import { Card } from "@/components/ui/card"
import CompositionRow from "./CompositionRow"
import { cn } from "@/lib/utils"
import type { NetWorthBucket } from "@/data"

// Bar colours per side of the balance sheet, applied to the Progress
// indicator via Tailwind v4's child variant so the primitive itself stays
// theme-neutral (see ui/progress.tsx). Assets walk down the brand ramp;
// liabilities use the two "attention" tokens. Index-matched to the bucket
// order the data layer emits, and the last entry repeats if a group ever
// grows past the list.
const BAR_COLORS = {
  asset: [
    "*:data-[slot=progress-indicator]:bg-positive",
    "*:data-[slot=progress-indicator]:bg-brand",
    "*:data-[slot=progress-indicator]:bg-chart-3",
  ],
  liability: [
    "*:data-[slot=progress-indicator]:bg-warning",
    "*:data-[slot=progress-indicator]:bg-destructive",
  ],
} as const

interface CompositionCardProps {
  title: string
  total: number
  buckets: NetWorthBucket[]
  /** Which side of the balance sheet — drives the total's colour, the leading
   *  sign, and the bar palette. */
  tone: keyof typeof BAR_COLORS
  /** Optional stat pinned to the card's bottom edge (the debt-to-asset ratio). */
  footer?: React.ReactNode
}

/**
 * One side of the net-worth breakdown — "Assets" or "Liabilities" — as a
 * heading with its total plus a bar per bucket.
 *
 * Generic over both sides rather than two near-identical components: the only
 * differences are the sign, the colour, and the rows, all passed in.
 */
function CompositionCard({
  title,
  total,
  buckets,
  tone,
  footer,
}: CompositionCardProps) {
  const isLiability = tone === "liability"
  const colors = BAR_COLORS[tone]

  return (
    // flex-col + the footer's mt-auto keeps the ratio pinned to the bottom, so
    // the two cards line up even when one has fewer rows than the other.
    <Card className="flex flex-col">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-sans text-sm font-semibold text-foreground">
          {title}
        </h2>
        {/* `warning`, not `destructive`: this is money owed, not an error
            state. Same line AccountsCardItem draws — a credit balance reads
            amber "owed", and red is reserved for genuinely overdrawn. */}
        <p
          className={cn(
            "text-base tabular-nums",
            isLiability ? "text-warning" : "text-positive"
          )}
        >
          {isLiability && "−"}$
          {total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </p>
      </div>

      <ul className="mt-5 flex flex-col gap-4">
        {buckets.map((bucket, i) => (
          <CompositionRow
            key={bucket.label}
            bucket={bucket}
            total={total}
            barClassName={colors[Math.min(i, colors.length - 1)]}
          />
        ))}
      </ul>

      {/* mt-auto pushes the footer to the bottom edge; pt-6 (rather than a
          second margin) supplies the gap, so the two don't fight. */}
      {footer && (
        <div className="mt-auto flex items-baseline justify-between gap-4 border-t border-border pt-6">
          {footer}
        </div>
      )}
    </Card>
  )
}

export default CompositionCard
