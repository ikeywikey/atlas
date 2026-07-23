import { cn } from "@/lib/utils"

// Today, formatted like "Jul 22". Computed once at module load — it's chrome,
// not reactive state.
const today = new Date().toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
})

/**
 * The quiet "● synced · Jul 22" line that sits in the PageHeader's right slot
 * on every screen in docs/design/*.png.
 *
 * Currently cosmetic — there's no sync to report until Plaid lands in Phase 2,
 * at which point the timestamp and the dot's colour come from the last
 * successful item refresh.
 */
function SyncStatus({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="sync-status"
      className={cn(
        "flex items-center gap-2 font-mono text-xs text-muted-foreground",
        className
      )}
      {...props}
    >
      {/* aria-hidden: the dot is decorative, and "synced" already says it. */}
      <span aria-hidden className="size-1.5 rounded-full bg-positive" />
      synced · {today}
    </span>
  )
}

export default SyncStatus
