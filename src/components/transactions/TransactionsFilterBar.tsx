import { Search, Download } from "lucide-react"

import { Button } from "@/components/ui/button.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx"
import { cn } from "@/lib/utils"
import { getAccounts } from "@/data"

// How the feed can be ordered. Defined here next to the option labels; the page
// owns the actual state and imports this type.
export type SortKey = "newest" | "oldest" | "amount"

// Shared mono styling for the trigger + input so the filter bar reads as one
// mono control strip (the Select primitive itself stays theme-neutral).
const controlFont = "font-mono text-xs"

/**
 * The controlled filter/search bar. It holds no state of its own — every value
 * comes in as a prop and every change is reported up via a callback, so the
 * page is the single source of truth for what's filtered. Account options come
 * from the data layer; category options are passed in (derived from the feed).
 */
function TransactionsFilterBar({
  search,
  onSearchChange,
  accountId,
  onAccountChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  categories,
}: {
  search: string
  onSearchChange: (value: string) => void
  accountId: string
  onAccountChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  sort: SortKey
  onSortChange: (value: SortKey) => void
  categories: string[]
}) {
  const accounts = getAccounts()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search — grows to fill the row; the icon sits inside the padded input. */}
      <div className="relative min-w-48 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search merchants…"
          aria-label="Search merchants"
          className={cn(
            "h-9 w-full rounded-lg border border-input bg-input/30 pr-3 pl-8 text-foreground transition-[color,box-shadow] outline-none placeholder:text-muted-foreground hover:bg-input/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            controlFont
          )}
        />
      </div>

      {/* Account filter — "all" plus one item per linked account. */}
      <Select value={accountId} onValueChange={onAccountChange}>
        <SelectTrigger aria-label="Filter by account" className={controlFont}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={controlFont}>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.account_id} value={account.account_id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category filter — "all" plus one item per category present in the feed. */}
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger aria-label="Filter by category" className={controlFont}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={controlFont}>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort order. */}
      <Select
        value={sort}
        onValueChange={(value) => onSortChange(value as SortKey)}
      >
        <SelectTrigger aria-label="Sort transactions" className={controlFont}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={controlFont}>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
          <SelectItem value="amount">Largest amount</SelectItem>
        </SelectContent>
      </Select>

      {/* Export — present for parity with the design, wired up in a later step. */}
      <Button
        variant="outline"
        size="lg"
        disabled
        title="CSV export coming soon"
        className="font-mono text-xs"
      >
        <Download />
        CSV
      </Button>
    </div>
  )
}

export default TransactionsFilterBar
