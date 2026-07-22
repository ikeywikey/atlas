import NetWorthCard from "@/components/dashboard/NetWorthCard.tsx"
import DashboardSpendingCard from "@/components/dashboard/DashboardSpendingCard.tsx"
import AccountsCard from "@/components/dashboard/AccountsCard.tsx"
import PageHeader from "@/components/layout/PageHeader.tsx"

function Dashboard() {
  return (
    // AppShell's <main> now allows a wide ceiling (for the transactions table),
    // so the dashboard keeps its own narrower, centered column here rather than
    // stretching. (The two-column card grid in docs/design/dashboard.png is
    // Week 3+.)
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader title="Dashboard" />
      <div className="flex flex-col items-center gap-5">
        <NetWorthCard />
        <DashboardSpendingCard />
        <AccountsCard />
      </div>
    </div>
  )
}

export default Dashboard
