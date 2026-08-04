import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { changeTone, currency, signedCurrency } from "@/lib/palette"
import type { CashFlow } from "@/data"

/**
 * Income vs spending for the month, and what survived.
 *
 * The two bars share one scale — both are measured against income, so
 * "spending" is literally the fraction of the income bar it consumed and the
 * empty remainder *is* the money saved. That's why they aren't two independent
 * full-width bars: the comparison is the whole point of the card.
 *
 * Every figure below the bars is derived (see `getCashFlow`), so the spending
 * line here can never disagree with the category card beside it.
 */
function CashFlowCard({ cashFlow }: { cashFlow: CashFlow }) {
  const { period, income, spending, netSaved, savingsRate } = cashFlow

  // Guard the divide, and clamp: a month that outspent its income would
  // otherwise push the bar past 100% and Radix would report an out-of-range
  // value. The figures above still tell the true story.
  const spendingShare =
    income > 0 ? Math.min((spending / income) * 100, 100) : 0

  return (
    <Card className="flex flex-col">
      <h2 className="font-sans font-semibold text-foreground">Cash flow</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        {period} · income vs spending
      </p>

      <div className="mt-7 flex flex-col gap-6">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-sans text-sm text-foreground">Income</span>
            <span className="tabular-nums text-positive">
              {currency(income)}
            </span>
          </div>
          {/* Income is the reference, so its bar is always full — it's the
              measuring stick the spending bar is read against. */}
          <Progress
            value={100}
            aria-label={`Income: ${currency(income)}`}
            className="mt-2.5 *:data-[slot=progress-indicator]:bg-positive"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-sans text-sm text-foreground">Spending</span>
            <span className="tabular-nums text-foreground">
              {currency(spending)}
            </span>
          </div>
          <Progress
            value={spendingShare}
            aria-label={`Spending: ${currency(spending)}, ${spendingShare.toFixed(0)}% of income`}
            className="mt-2.5 *:data-[slot=progress-indicator]:bg-brand"
          />
        </div>
      </div>

      {/* mt-auto pushes the summary to the bottom of the card. The card is
          stretched to the category card's height beside it, so without this
          the slack would collect *below* "Net saved" and leave it floating
          mid-card; this puts the slack above the rule instead, and the two
          cards end on the same line. */}
      <div className="mt-auto border-t border-border pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-sans font-semibold text-foreground">
            Net saved
          </span>
          {/* Signed and coloured: an overspent month reads −$… in red without
              any change here, because both come from the value's sign. */}
          <span className={`text-2xl tabular-nums ${changeTone(netSaved)}`}>
            {signedCurrency(netSaved)}
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-muted-foreground">
          {savingsRate.toFixed(0)}% savings rate
        </p>
      </div>
    </Card>
  )
}

export default CashFlowCard
