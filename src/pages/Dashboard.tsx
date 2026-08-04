import NetWorthCard from "@/components/dashboard/NetWorthCard.tsx"
import DashboardSpendingCard from "@/components/dashboard/DashboardSpendingCard.tsx"
import DashboardInvestmentsCard from "@/components/dashboard/DashboardInvestmentsCard.tsx"
import AccountsCard from "@/components/dashboard/AccountsCard.tsx"
import PageHeader from "@/components/layout/PageHeader.tsx"

function Dashboard() {
  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* The two-column grid from docs/design/dashboard.png. The left column
          is wider because it carries the net-worth chart, which needs the
          horizontal room to read as a trend; the right column stacks the two
          summary cards. Below lg it collapses to a single column and the four
          cards fall into source order.

          `items-start` stops the grid's default stretch: without it the
          shorter column's last card would be inflated to match the taller one
          rather than keeping its own height. */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <NetWorthCard />
          <AccountsCard />
        </div>

        <div className="flex flex-col gap-5">
          <DashboardSpendingCard />
          <DashboardInvestmentsCard />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
