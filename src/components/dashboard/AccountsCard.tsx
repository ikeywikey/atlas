import { Card } from "@/components/ui/card"
import { getAccounts } from "@/data"
import AccountsCardItem from "./AccountsCardItem"

function AccountsCard() {
  const accounts = getAccounts()

  return (
    <Card className="min-h-65 min-w-100">
      <div className="flex w-[full] items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold font-sans">Accounts</h2>
        <button className="cursor-pointer text-muted-foreground text-xs hover:text-foreground transition-colors">
          + link
        </button>
      </div>

      <ul className="mt-3 flex max-h-60 flex-col gap-3 divide-y divide-border overflow-y-auto">
        {accounts.map((account) => (
          <AccountsCardItem key={account.account_id} account={account} />
        ))}
      </ul>
    </Card>
  )
}

export default AccountsCard
