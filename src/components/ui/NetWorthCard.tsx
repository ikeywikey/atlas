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

function NetWorthCard({ title = "NET WORTH", amount = 0 }) {
  return (
    <div className="@container min-h-65 w-[50%] rounded-lg border border-white/10 bg-white/4 p-4 font-mono">
      <div className="flex items-center justify-between">
        <h2 className="text-gray-600 text-xs">{title}</h2>

        <ToggleGroup
          type="single"
          defaultValue="wk"
          className="rounded-md bg-white/5 p-1"
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
              className="rounded-sm text-gray-400 hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-black"
            >
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <p className="text-white text-[clamp(1.75rem,8cqw,3rem)] mt-0.5">
        $
        {amount.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>

      <div className="flex gap-5 mt-2.5 ml-1">
        <h3 className="text-[rgb(65,193,208)] font-semibold text-xs ">
          ▲ +$1,820 this month
        </h3>
        <h3 className="text-gray-600 text-xs">
          Past week ·{" "}
          <span className="text-[rgb(65,193,208)]">+$14,362 (+9.1%)</span>
        </h3>
        <h3 className="text-gray-600 text-xs"></h3>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={history}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a7cf0" stopOpacity={0.23} />
              <stop offset="100%" stopColor="#3a7cf0" stopOpacity={0} />
            </linearGradient>
          </defs>

          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.15)" }}
            contentStyle={{
              background: "#0b0d12",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#9ca3af" }}
            itemStyle={{ color: "#4f97f5" }}
            formatter={(value) => `$${Number(value).toLocaleString("en-US")}`}
          />
          <Area
            type="monotone"
            dataKey="net"
            strokeWidth={2.5}
            stroke="#4f97f5"
            fill="url(#chartGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default NetWorthCard;
