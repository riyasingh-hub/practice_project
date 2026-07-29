import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#6366f1",
  "#06b6d4",
  "#ef4444",
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function TicketStatusChart({
  data,
}) {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="bg-white text-black p-2 rounded shadow">
          <div className="font-semibold">{entry.name}</div>
          <div className="text-sm">{entry.value} tickets</div>
        </div>
      );
    }
    return null;
  };
  // compute deterministic, well-spaced colors across the dataset
  const colorsMap = (() => {
    if (!data || data.length === 0) return {};
    const n = data.length;
    const items = data.map((d, i) => ({
      name: d?.name ?? String(i),
      hash: hashString(d?.name ?? String(i)),
      idx: i,
    }));

    const sorted = [...items].sort((a, b) => a.hash - b.hash);
    const map = {};
    sorted.forEach((item, pos) => {
      // evenly space hues by position to avoid similar shades
      const baseHue = Math.round((pos * 360) / n);
      const jitter = (item.hash % 21) - 10; // -10..10 small jitter
      const hue = (baseHue + jitter + 360) % 360;
      const saturation = 68; // vibrant
      const lightness = 50; // balanced
      map[item.name] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });
    return map;
  })();
  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
      <h2 className="text-xl mb-6">
        Ticket Status
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={data}
            dataKey="value"
            innerRadius={80}
            outerRadius={120}
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={colorsMap[entry?.name] || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}