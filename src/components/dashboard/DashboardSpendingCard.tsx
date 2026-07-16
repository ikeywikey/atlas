import { Card } from "@/components/ui/card";
import { PieChart, Pie, Sector, ResponsiveContainer } from "recharts";
import type { PieSectorShapeProps } from "recharts";

const spending = [
  { name: "Housing", value: 2150, color: "var(--chart-1)" },
  { name: "Shopping", value: 886, color: "var(--chart-2)" },
  { name: "Groceries", value: 544, color: "var(--chart-3)" },
  { name: "Travel", value: 298, color: "var(--chart-4)" },
  { name: "Bills & Utilities", value: 214, color: "var(--chart-5)" },
  { name: "Other", value: 399, color: "var(--chart-6)" },
];

function DashboardSpendingCard() {
  const total = spending.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="@container min-h-50 min-w-90">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground font-semibold font-sans">Spending</h2>
        <p className="text-muted-foreground text-xs font-semibold font-sans">June</p>
      </div>

      <div className="flex items-stretch justify-between gap-4 pt-1">
        <div className="relative w-44 shrink-0">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={spending}
                dataKey="value"
                nameKey="name"
                innerRadius="80%"
                outerRadius="100%"
                paddingAngle={2}
                shape={(props: PieSectorShapeProps) => (
                  <Sector
                    {...props}
                    fill={props.payload?.color}
                    stroke="none"
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-foreground text-xl font-mono tracking-wide">
              ${total.toLocaleString("en-US")}
            </p>
            <p className="text-muted-foreground text-xs font-sans">SPENT</p>
          </div>
        </div>

        <ul className="flex flex-1 flex-col justify-between py-1">
          {spending.map((item) => (
            <li
              key={item.name}
              className="flex items-center justify-between gap-6"
            >
              <span className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
                <span
                  className="h-2 w-2 rounded-xs"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="text-xs font-mono text-foreground">
                ${item.value.toLocaleString("en-US")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

export default DashboardSpendingCard;
