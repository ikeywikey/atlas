// ── Imports ──────────────────────────────────────────────────────────────────
// `NavLink` is a <a> tag that knows whether it points at the current URL.
// `Outlet` is the placeholder where the router renders whichever child route
// matched. Both come from `react-router` directly — since v7 there is no
// separate `react-router-dom` package.
import { NavLink, Outlet } from "react-router"
import {
  AlignLeft,
  CreditCard,
  Layers,
  LayoutGrid,
  Scale,
  TrendingUp,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import Globe from "@/components/visuals/Globe.tsx"

// ── Nav model ────────────────────────────────────────────────────────────────
// The rail's destinations, in the order and with the glyphs shown in
// docs/design/*.png — the order is read straight off which icon is active on
// each design screenshot (trending-up lights on Investments, the pulse line on
// Net worth, etc.), not invented here. Data-driven rather than six hand-written
// blocks, so adding a screen is a one-line change.
//
// `to` is null for screens that don't exist yet. Those render as dimmed,
// non-interactive icons instead of disappearing — the app's full shape stays
// legible, and a nav destination that's unavailable should say so rather than
// silently vanish.
const NAV_ITEMS: {
  label: string
  icon: LucideIcon
  to: string | null
}[] = [
  { label: "Dashboard", icon: LayoutGrid, to: "/" },
  { label: "Transactions", icon: AlignLeft, to: "/transactions" },
  { label: "Investments", icon: TrendingUp, to: "/investments" },
  { label: "Spending", icon: CreditCard, to: null },
  { label: "Net worth", icon: Scale, to: "/net-worth" },
  { label: "Accounts", icon: Layers, to: null },
]

// Shared sizing for every rail item, live or disabled, so the column stays on
// a single rhythm. `size-11` is 44px — the minimum comfortable target size.
const railItem =
  "relative flex size-11 items-center justify-center rounded-md transition-colors"

// ── The rail ─────────────────────────────────────────────────────────────────
function NavRail() {
  return (
    // <nav> + aria-label: this is a landmark, so screen readers can jump to it
    // and announce which navigation it is.
    //
    // `sticky top-0 h-dvh` pins the rail to the viewport height while the page
    // content beside it scrolls independently.
    <nav
      data-slot="nav-rail"
      aria-label="Main"
      className="sticky top-0 flex h-dvh w-20 shrink-0 flex-col items-center gap-2 border-r border-border py-5"
    >
      {/* Brand mark. Globe paints to a transparent <canvas>, so it needs an
          explicit role/label to be announced as an image rather than skipped.
          `glow` adds the soft blue halo behind the sphere — the component's
          docstring calls this slot out as its intended home. */}
      <div role="img" aria-label="Atlas" className="mb-6">
        <Globe size={44} glow />
      </div>

      {NAV_ITEMS.map(({ label, icon: Icon, to }) =>
        // Destructuring `icon: Icon` renames it to uppercase — JSX treats
        // lowercase tags as HTML elements, so it must be capitalised to render
        // as a component.
        to ? (
          <NavLink
            key={label}
            to={to}
            // Without `end`, "/" would count as active on *every* route, since
            // NavLink treats a path as active when the URL starts with it.
            // `end` demands an exact match. Only the root path needs this.
            end={to === "/"}
            // The icon carries no text, so the accessible name has to be
            // supplied explicitly. `title` gives sighted users a hover tooltip,
            // which is the tradeoff an icon-only rail makes for discoverability.
            aria-label={label}
            title={label}
            // NavLink's `className` can be a function instead of a string. The
            // router calls it with the link's current state and re-runs it on
            // every navigation — this is what makes the active styling
            // automatic rather than something we track by hand.
            className={({ isActive }) =>
              cn(
                railItem,
                "text-muted-foreground hover:bg-accent hover:text-foreground",
                // Active = filled background, brightened icon, and a brand-blue
                // bar bled off the left edge via a ::before pseudo-element
                // (matches the design reference).
                isActive &&
                  "bg-accent text-foreground before:absolute before:-left-2 before:h-6 before:w-0.5 before:rounded-full before:bg-brand"
              )
            }
          >
            <Icon className="size-5" strokeWidth={1.5} />
          </NavLink>
        ) : (
          // Not-yet-built screens: a <span>, not a link, so it's unreachable by
          // keyboard and click alike. The tooltip explains the absence.
          <span
            key={label}
            aria-disabled="true"
            title={`${label} — coming soon`}
            className={cn(railItem, "text-muted-foreground/40")}
          >
            <Icon className="size-5" strokeWidth={1.5} />
          </span>
        )
      )}
    </nav>
  )
}

// ── The shell ────────────────────────────────────────────────────────────────
/**
 * App-wide chrome: the persistent nav rail plus the routed page content.
 *
 * This is mounted as a *pathless layout route* (see App.tsx) — a <Route> with
 * an element but no path. It matches on every URL underneath it, so navigating
 * between pages re-renders only what's inside <Outlet />. The rail keeps its
 * DOM node and any state it holds; it never remounts or flickers.
 */
function AppShell() {
  return (
    // The page background gradient, moved here verbatim from App.tsx so every
    // route inherits it rather than each page redeclaring it.
    <div className="flex min-h-dvh bg-linear-to-b from-[rgb(12,15,21)] to-[rgb(7,9,12)]">
      <NavRail />
      {/* <main> is the content landmark. Centering and max-width live here now,
          which is what lets Dashboard drop its hardcoded ml-[25%] w-[50%].

          `min-w-0` because a flex item defaults to min-width:auto and so won't
          shrink below its content — a wide child (the transactions table) would
          push the layout out rather than scroll inside it. */}
      <main className="mx-auto w-full min-w-0 max-w-7xl flex-1 px-8 py-10">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
