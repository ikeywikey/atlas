import type { CSSProperties } from "react"

import { Progress } from "@/components/ui/progress"
import { currency } from "@/lib/palette"
import type { SpendingCategory } from "@/data"

interface CategoryRowProps {
  category: SpendingCategory
  /** The largest category's amount — what the bar is measured against. */
  max: number
  /** Colour for the swatch and the bar, handed down from CategoryCard so the
   *  row can't disagree with the donut segment it corresponds to. */
  color: string
}

/**
 * One line of the by-category breakdown: swatch, label, amount, and a bar.
 *
 * The bar is sized against the **largest category, not the total**. Against the
 * total, Housing (48% of the spend) would fill half the row and "Other" ($92)
 * would be two pixels wide — a bar you can't see conveys nothing. Scaling to
 * the max spends the full width on the comparison people actually make here,
 * which is category-vs-category. The exact dollar amount is printed either way,
 * so nothing depends on reading the bar.
 *
 * The swatch is what ties the row to its donut segment. Both are decoration on
 * top of a visible label + amount, so neither colour nor length is the only way
 * to read the number.
 */
function CategoryRow({ category, max, color }: CategoryRowProps) {
  // Guard the divide: an all-zero period would otherwise produce NaN and Radix
  // would drop the aria-valuenow off the progress bar.
  const share = max > 0 ? (category.amount / max) * 100 : 0

  return (
    <li>
      <div className="flex items-baseline justify-between gap-4">
        <span className="flex items-center gap-2.5 font-sans text-sm text-foreground">
          <span
            className="size-2 shrink-0 rounded-xs"
            style={{ backgroundColor: color }}
          />
          {category.category}
        </span>
        {/* tabular-nums keeps digits on a fixed grid so the amounts stack in a
            straight right-aligned column instead of jittering per row. */}
        <span className="text-sm tabular-nums text-foreground">
          {currency(category.amount)}
        </span>
      </div>

      {/* The Progress primitive is deliberately theme-neutral (see its
          docblock), so the call site brings the colour. Every other call site
          passes a static Tailwind class, but here the colour comes from the
          ramp at runtime — so it's handed in as a CSS custom property and read
          back with Tailwind v4's `bg-(--var)` shorthand. That keeps the
          recolouring inside the class system rather than reaching past it with
          an inline style on the indicator. */}
      <Progress
        value={share}
        aria-label={`${category.category}: ${currency(category.amount)}`}
        className="mt-1 h-1 *:data-[slot=progress-indicator]:bg-(--bar-color)"
        style={{ "--bar-color": color } as CSSProperties}
      />
    </li>
  )
}

export default CategoryRow
