import { positionColor } from "./palette"
import type { Position } from "@/data"

/**
 * A single horizontal bar split into one segment per position, each sized to
 * its share of the portfolio — the compact allocation read used on the
 * dashboard card, where a full donut plus legend would be too much furniture.
 *
 * Same data and same colours as the donut, just a different geometry. It's
 * decorative: every value it encodes is also printed as text in the rows
 * beneath it, so it carries no information on its own. Hence `aria-hidden` —
 * a screen reader announcing eight unlabelled segments would be noise.
 */
function AllocationBar({ positions }: { positions: Position[] }) {
  if (positions.length === 0) return null

  return (
    <div
      aria-hidden="true"
      className="flex h-2 w-full gap-1 overflow-hidden rounded-full"
    >
      {positions.map((position, i) => (
        <span
          key={position.security_id}
          className="h-full rounded-full"
          style={{
            // Percentage widths inside a flex row: the gap-1 between segments
            // eats a few pixels, so `minWidth: 0` lets them shrink to fit
            // rather than overflowing the container.
            width: `${position.allocationPct}%`,
            minWidth: 0,
            backgroundColor: positionColor(i),
          }}
        />
      ))}
    </div>
  )
}

export default AllocationBar
