import { Card } from "@/components/ui/card"
import { getAccounts } from "@/data"
import AccountsCardItem from "./AccountsCardItem"

function AccountsCard() {
  const accounts = getAccounts()

  return (
    <Card className="min-h-65 min-w-100">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold font-sans">
          Accounts
        </h2>
        <button className="cursor-pointer text-muted-foreground text-xs hover:text-foreground transition-colors">
          + link
        </button>
      </div>

      {/* This list always scrolls (6 accounts vs. max-h-60), so the balances on
          the right edge would otherwise sit flush against the scrollbar. The
          inset goes here rather than on the row: padding-right on a scroll
          container sits *inside* the scrollbar, so the content moves left while
          the bar stays at the card's edge — and it applies once, to every row
          type this list ever holds. */}
      <ul className="mt-3 flex max-h-60 flex-col gap-3 divide-y divide-border overflow-y-auto pr-3">
        {accounts.map((account) => (
          <AccountsCardItem key={account.account_id} account={account} />
        ))}
      </ul>
    </Card>
  )
}

export default AccountsCard
