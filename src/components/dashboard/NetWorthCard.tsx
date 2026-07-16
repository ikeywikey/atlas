import { Card } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip } from "recharts";

const history = [
  { day: "Mon", net: 162400 },
  { day: "Tue", net: 163800 },
  { day: "Wed", net: 161950 },
  { day: "Thu", net: 164700 },
  { day: "Fri", net: 166200 },
  { day: "Sat", net: 165400 },
  { day: "Sun", net: 167800 },
  { day: "Mon", net: 168200 },
  { day: "Tue", net: 169450 },
  { day: "Wed", net: 171100 },
  { day: "Thu", net: 170300 },
  { day: "Fri", net: 173800 },
  { day: "Sat", net: 172950 },
  { day: "Sun", net: 175870 },
];

interface NetWorthCardProps {
  title?: string;
  amount?: number;
}

function NetWorthCard({ title = "NET WORTH", amount = 0 }: NetWorthCardProps) {
  return (
    <Card className="@container min-h-65 min-w-100">
      <div className="flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs">{title}</h2>

        <ToggleGroup
          type="single"
          defaultValue="wk"
          className="rounded-md bg-muted p-1"
        >
          {[
            { value: "wk", label: "W" },
            { value: "month", label: "M" },
            { value: "6month", label: "6M" },
            { value: "1yr", label: "Y" },
          ].map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              size="sm"
              className="rounded-sm cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="text-foreground text-[clamp(1.75rem,8cqw,3rem)] mt-0.5">
        $
        {amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      <div className="flex gap-5 mt-2.5 ml-1">
        <h3 className="text-positive font-semibold text-xs ">
          ▲ +$1,820 this month
        </h3>
        <h3 className="text-muted-foreground text-xs">
          Past week ·{" "}
          <span className="text-positive">+$14,362 (+9.1%)</span>
        </h3>
        <h3 className="text-muted-foreground text-xs"></h3>
      </div>

      <div className="-mx-6">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.23} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <YAxis domain={["dataMin", "dataMax"]} hide />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              itemStyle={{ color: "var(--brand)" }}
              formatter={(value) => `$${Number(value).toLocaleString("en-US")}`}
            />
            <Area
              type="monotone"
              dataKey="net"
              strokeWidth={2.5}
              stroke="var(--brand)"
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default NetWorthCard;
