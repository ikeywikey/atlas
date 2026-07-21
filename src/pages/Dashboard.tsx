import NetWorthCard from "@/components/dashboard/NetWorthCard.tsx"
import DashboardSpendingCard from "@/components/dashboard/DashboardSpendingCard.tsx"
import AccountsCard from "@/components/dashboard/AccountsCard.tsx"
import PageHeader from "@/components/layout/PageHeader.tsx"

function Dashboard() {
  return (
    // Width and centering now come from AppShell's <main>, so this is just a
    // stack. (The two-column card grid in docs/design/dashboard.png is Week 3+.)
    <div>
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
