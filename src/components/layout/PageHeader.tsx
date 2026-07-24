import { cn } from "@/lib/utils"
import SyncStatus from "./SyncStatus.tsx"

/**
 * The eyebrow + title block at the top of every screen in docs/design/*.png.
 *
 * Not a router-aware component on purpose: each page passes its own `title`
 * rather than the header deriving it from the URL. Titles are copy, not routing
 * data, and pages will eventually want dynamic ones ("Chase Checking") that no
 * path-to-label map could produce.
 *
 * The sync status is rendered here rather than passed in by each page: it
 * appears on *every* screen in the design references, and it reports app-wide
 * state, so no page should have to remember to include it.
 */
function PageHeader({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<"header"> & { title: string }) {
  return (
    <header
      data-slot="page-header"
      className={cn("mb-8 flex items-start justify-between gap-4", className)}
      {...props}
    >
      <div>
        {/* Wordmark eyebrow — small, tracked-out, muted, so the page title
            below it stays the loudest thing on the screen. */}
        <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground">
          ATLAS
        </p>
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          {title}
        </h1>
      </div>
      {/* Right-hand stack: any per-page controls a page passes as children sit
          above the shared sync status, matching the references where the
          control strip stacks over "● synced · Jun 26". */}
      <div className="flex flex-col items-end gap-2">
        {children}
        <SyncStatus />
      </div>
    </header>
  )
}

export default PageHeader
