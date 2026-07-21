import Globe from "@/components/visuals/Globe.tsx"
import NetWorthCard from "@/components/dashboard/NetWorthCard.tsx"
import DashboardSpendingCard from "@/components/dashboard/DashboardSpendingCard.tsx"
import AccountsCard from "@/components/dashboard/AccountsCard.tsx"

function Dashboard() {
  return (
    <div className="flex flex-col ml-[25%] w-[50%] items-center justify-center gap-5 p-5">
      <Globe />
      <NetWorthCard />
      <DashboardSpendingCard />
      <AccountsCard />
    </div>
  )
}

export default Dashboard
