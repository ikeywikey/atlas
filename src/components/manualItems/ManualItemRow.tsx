import { Landmark, Layers, Pencil, Trash2 } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar.tsx"
import { Button } from "@/components/ui/button.tsx"
import { currency } from "@/lib/palette"
import { cn } from "@/lib/utils"
import type { ManualItem } from "@/data"

// Glyph + tint per side of the balance sheet. Keyed on `kind`, not `category`,
// because that's what the design reference does: both asset rows there carry
// the same layers glyph even though one is a Vehicle and the other is Cash.
// The layers glyph is also the nav rail's icon for this screen, so the row
// avatar and the rail item read as the same thing.
const TONE = {
  asset: { icon: Layers, className: "bg-brand/15 text-brand" },
  liability: { icon: Landmark, className: "bg-warning/15 text-warning" },
} as const

/**
 * One manually-entered asset or liability.
 *
 * Mirrors `AccountsCardItem` — avatar, a name over a muted meta line, a value
 * on the right — with two differences: the avatar holds an *icon* rather than
 * an institution initial (there's no brand behind a car or a private loan), and
 * the row carries edit/delete actions.
 *
 * Those actions are deliberately inert. Manual CRUD needs real persistence and
 * lands in Phase 2 (docs/spec.md, Week 10); until then they're rendered
 * `disabled` for parity with the design, the same call the CSV export button in
 * TransactionsFilterBar makes. Wiring them to local state would also silently
 * desync net worth from the $171,334 its test pins.
 */
function ManualItemRow({ item }: { item: ManualItem }) {
  const { name, kind, category, value, note } = item
  const { icon: Icon, className: toneClassName } = TONE[kind]

  // "Vehicle · KBB private-party value", or just "Cash" when there's no note.
  const meta = note ? `${category} · ${note}` : category

  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        {/* Square-ish rather than round, matching AccountsCardItem — the round
            default reads as a person, and none of these are. */}
        <Avatar className="rounded-lg after:rounded-lg">
          <AvatarFallback className={cn("rounded-lg", toneClassName)}>
            <Icon className="size-4" strokeWidth={1.5} />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-semibold text-foreground">
            {name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {/* tabular-nums so the values in a column line up on the decimal
            regardless of digit widths. `value` is always a positive magnitude —
            `kind` carries the direction (see types.ts), and the card's total is
            what shows the leading minus, matching the reference. */}
        <span className="font-mono tabular-nums text-foreground">
          {currency(value)}
        </span>

        {/* Icon-only, so each needs an explicit accessible name — the glyph is
            the whole label. `title` doubles as the hover tooltip explaining why
            they don't do anything yet, and `pointer-events-auto` is what lets
            that tooltip actually appear: the primitive's disabled state drops
            pointer events, which silently swallows both the cursor and the
            title. Unlike the banner's "Add item" these keep the dimmed 50% —
            they're secondary to the screen's one primary action. */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled
            aria-label={`Edit ${name}`}
            title="Editing coming soon"
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            <Pencil />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled
            aria-label={`Delete ${name}`}
            title="Deleting coming soon"
            className="disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
    </li>
  )
}

export default ManualItemRow
