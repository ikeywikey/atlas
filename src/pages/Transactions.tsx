import { useMemo, useState } from "react"

import PageHeader from "@/components/layout/PageHeader.tsx"
import TransactionsFilterBar, {
  type SortKey,
} from "@/components/transactions/TransactionsFilterBar.tsx"
import TransactionsSummary from "@/components/transactions/TransactionsSummary.tsx"
import TransactionsFeed from "@/components/transactions/TransactionsFeed.tsx"
import { getTransactions } from "@/data"

function Transactions() {
  // --- Filter state -------------------------------------------------------
  // Each control's value lives here in the page, not inside the control. This
  // is React's "controlled component" pattern: the filter bar renders whatever
  // we pass down and calls these setters on change, so the page stays the one
  // source of truth for what's filtered. useState returns [currentValue,
  // setter]; calling a setter re-renders the component with the new value.
  const [search, setSearch] = useState("")
  const [accountId, setAccountId] = useState("all")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<SortKey>("newest")

  // getTransactions() builds + joins its list on every call, so we memoize the
  // base list once — useMemo caches a value and only recomputes when its
  // dependencies change ([] here means "never after first render").
  const allTransactions = useMemo(() => getTransactions(), [])

  // Category dropdown options: every distinct category present in the feed,
  // alphabetized. Derived from the data so a new category in the mock (or the
  // real API later) shows up in the filter automatically.
  const categories = useMemo(
    () => [...new Set(allTransactions.map((t) => t.category))].sort(),
    [allTransactions]
  )

  // The list actually shown: filter, then sort. Recomputes only when the base
  // list or one of the filter values changes — not on every unrelated render.
  const visibleTransactions = useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = allTransactions.filter((t) => {
      if (accountId !== "all" && t.account_id !== accountId) return false
      if (category !== "all" && t.category !== category) return false
      if (query) {
        const haystack =
          `${t.name} ${t.category} ${t.accountName ?? ""}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })

    // Sort a copy so we never mutate the memoized base list. "amount" ranks by
    // magnitude (biggest transactions first) regardless of in/out direction.
    return [...filtered].sort((a, b) => {
      if (sort === "oldest") return a.date.localeCompare(b.date)
      if (sort === "amount") return Math.abs(b.amount) - Math.abs(a.amount)
      return b.date.localeCompare(a.date) // "newest"
    })
  }, [allTransactions, search, accountId, category, sort])

  return (
    <div>
      {/* The sync status now lives in PageHeader itself — it's on every screen. */}
      <PageHeader title="Transactions" />

      <div className="flex flex-col gap-4">
        <TransactionsFilterBar
          search={search}
          onSearchChange={setSearch}
          accountId={accountId}
          onAccountChange={setAccountId}
          category={category}
          onCategoryChange={setCategory}
          sort={sort}
          onSortChange={setSort}
          categories={categories}
        />
        <TransactionsSummary transactions={visibleTransactions} />
        <TransactionsFeed transactions={visibleTransactions} />
      </div>
    </div>
  )
}

export default Transactions
