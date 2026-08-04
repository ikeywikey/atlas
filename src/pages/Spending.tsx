import PageHeader from "@/components/layout/PageHeader.tsx"
import CategoryCard from "@/components/spending/CategoryCard.tsx"
import CashFlowCard from "@/components/spending/CashFlowCard.tsx"
import MonthlyChart from "@/components/spending/MonthlyChart.tsx"
import { getCashFlow, getMonthlySpending, getSpending } from "@/data"

function Spending() {
  // Read once per render. Three plain synchronous calls into the mock data
  // layer today; when they become fetches in Phase 2 these are the lines that
  // grow loading/error states, and nothing below them changes shape.
  //
  // They agree by construction rather than by coincidence: `getCashFlow()`
  // sums the same categories the donut renders, and the last bar in
  // `getMonthlySpending()` is that same total. Editing one mock category moves
  // all three cards together.
  const { period, categories } = getSpending()
  const cashFlow = getCashFlow()
  const months = getMonthlySpending()

  return (
    <div>
      <PageHeader title="Spending" />

      {/* The whole screen is meant to be readable without scrolling, so every
          card here is sized to the design reference rather than left to its
          natural height — see the notes in CategoryCard and MonthlyChart. */}
      <div className="flex flex-col gap-5">
        {/* Category breakdown beside cash flow on wide screens, stacked below
            lg — the donut plus eight labelled rows needs the room, and cash
            flow's bars stop being comparable once they're squeezed. */}
        {/* Grid items stretch by default, which is wanted here: the two cards
            are one row and should read as one, so cash flow matches the
            category card's height rather than ending short of it. */}
        <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
          <CategoryCard categories={categories} period={period} />
          <CashFlowCard cashFlow={cashFlow} />
        </div>

        <MonthlyChart months={months} />
      </div>
    </div>
  )
}

export default Spending
