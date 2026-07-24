import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { NetWorthBucket } from "@/data"

interface CompositionRowProps {
  bucket: NetWorthBucket
  /** The group's total, used to size the bar. */
  total: number
  /** Tailwind class colouring the bar, passed down from CompositionCard. */
  barClassName: string
}

/**
 * One line of a breakdown: label, amount, and a bar showing the share this
 * bucket takes of its group.
 *
 * The bar is decoration on top of information that's already fully readable —
 * both the label and the exact dollar amount are always visible — so nothing
 * is conveyed by colour or length alone.
 */
function CompositionRow({ bucket, total, barClassName }: CompositionRowProps) {
  // Guard the divide: an all-zero group would otherwise produce NaN and Radix
  // would drop the aria-valuenow.
  const share = total > 0 ? (bucket.amount / total) * 100 : 0

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-foreground">{bucket.label}</span>
        {/* tabular-nums keeps the digits on a fixed grid so amounts stack in a
            straight right-aligned column instead of jittering per row. */}
        <span className="text-sm tabular-nums text-foreground">
          $
          {bucket.amount.toLocaleString("en-US", {
            maximumFractionDigits: 0,
          })}
        </span>
      </div>
      <Progress
        value={share}
        aria-label={`${bucket.label}: ${share.toFixed(1)}% of the total`}
        className={cn("mt-2", barClassName)}
      />
    </li>
  )
}

export default CompositionRow
