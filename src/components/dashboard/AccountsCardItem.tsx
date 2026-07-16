import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx"
import { cn } from "@/lib/utils"
import type { Account } from "@/data"

// Curated subset of the brand ramp that stays readable behind white text
// (the very light ramp steps are intentionally excluded).
const fallbackColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-6)",
  "var(--brand)",
]

// Pick a color deterministically from the name so the fallback looks "random"
// across accounts but stays stable across re-renders (no flicker).
function colorForName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return fallbackColors[Math.abs(hash) % fallbackColors.length]
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

// How an account's balance reads depends on the account:
//  - credit card with a non-zero balance → amber, "$X owed" (magnitude)
//  - any other account that's negative     → red (overdrawn)
//  - zero balance                          → neutral white
//  - positive balance                      → neutral white
function balanceDisplay(balance: number, isCredit: boolean) {
  if (balance === 0) {
    return { text: currency.format(0), className: "text-foreground" }
  }
  if (isCredit) {
    return {
      text: `${currency.format(Math.abs(balance))} owed`,
      className: "text-warning",
    }
  }
  if (balance < 0) {
    return { text: currency.format(balance), className: "text-destructive" }
  }
  return { text: currency.format(balance), className: "text-foreground" }
}

function AccountsCardItem({ account }: { account: Account }) {
  const { name, subtype, type, mask, balances, logoUrl } = account
  const initial = name.trim().charAt(0).toUpperCase()
  const label = capitalize(subtype ?? type)
  const balance = balances?.current
  const display =
    balance != null ? balanceDisplay(balance, type === "credit") : null

  return (
    <li className="flex items-center justify-between p-2 text-foreground">
      <div className="flex items-center gap-3">
        <Avatar className="rounded-lg after:rounded-lg">
          <AvatarImage src={logoUrl} className="rounded-lg" alt={name} />
          <AvatarFallback
            className="rounded-lg text-white"
            style={{ backgroundColor: colorForName(name) }}
          >
            {initial}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-sm font-sans font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">
            {label}
            {mask ? ` ···· ${mask}` : ""}
          </p>
        </div>
      </div>

      {display && (
        <span className={cn("font-mono", display.className)}>
          {display.text}
        </span>
      )}
    </li>
  )
}

export default AccountsCardItem
