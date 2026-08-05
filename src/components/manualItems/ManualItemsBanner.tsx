import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import { Card } from "@/components/ui/card"

/**
 * The explainer strip above the two cards: what belongs on this screen, and the
 * one action that adds to it.
 *
 * The copy earns its place — "manual assets" is the only screen in Atlas whose
 * contents the user has to supply, so it has to say why it exists separately
 * from the linked accounts everywhere else.
 *
 * "Add item" is the screen's single primary action, so it's the only filled
 * button here (the row-level edit/delete stay outline). It's `disabled` because
 * manual CRUD needs real persistence and lands in Phase 2 — see ManualItemRow
 * for the full note.
 */
function ManualItemsBanner() {
  return (
    <Card className="flex items-center justify-between gap-6">
      <p className="text-sm text-muted-foreground">
        Things Plaid can't see — cars, cash, private loans. Added here, they fold
        straight into your net worth.
      </p>

      {/* Recoloured at the call site rather than by adding a `brand` variant to
          the primitive: ui/progress.tsx set that precedent — primitives stay
          theme-neutral, and the screen that needs a brand colour applies it.

          It keeps its full brand colour while disabled (`disabled:opacity-100`)
          instead of washing out to the primitive's 50%. This is the screen's one
          primary action and the design draws it at full strength; dimming it to
          grey buried the only thing on the banner worth looking at. It stays
          genuinely `disabled` — announced as such, unfocusable, unclickable —
          so nothing here pretends to work. `pointer-events-auto` is what lets
          the cursor and the tooltip still land, since the primitive's disabled
          state otherwise drops all pointer events and swallows both. */}
      <Button
        size="lg"
        disabled
        title="Adding items coming soon"
        className="bg-brand text-white hover:bg-brand disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100"
      >
        <Plus />
        Add item
      </Button>
    </Card>
  )
}

export default ManualItemsBanner
