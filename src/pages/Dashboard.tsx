import Globe from "../components/ui/Globe.tsx";
import NetWorthCard from "../components/ui/NetWorthCard.tsx";

function Dashboard() {
  return (
    <div>
      <Globe />
      <NetWorthCard title="NET WORTH" amount={150000} />
    </div>
  );
}

export default Dashboard;
