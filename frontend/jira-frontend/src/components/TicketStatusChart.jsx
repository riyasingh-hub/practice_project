// export default function TicketStatusChart({ data }) {
//   const getHeatColor = (value, maxValue) => {
//     const ratio = maxValue > 0 ? Math.min(value / maxValue, 1) : 0;
//     const hue = 120 - Math.round(ratio * 120);
//     return `hsl(${hue}, 75%, 55%)`;
//   };

//   const sortedData = data ? [...data].sort((a, b) => b.riskScore - a.riskScore) : [];
//   const maxCount = Math.max(
//     1,
//     ...sortedData.flatMap((entry) => [
//       entry.overdueCount,
//       entry.highPriorityCount,
//       entry.openCount,
//       entry.inProgressCount,
//       entry.riskScore,
//     ])
//   );

//   return (
//     <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
//       <h2 className="text-xl mb-6">Project Risk Heat Map</h2>

//       {sortedData.length === 0 ? (
//         <p className="text-gray-400">No project issue data available.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <div className="min-w-[720px] space-y-2">
//             <div className="grid grid-cols-6 gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-400 border-b border-slate-700">
//               <div>Project</div>
//               <div className="text-center">Overdue</div>
//               <div className="text-center">High Priority</div>
//               <div className="text-center">Open</div>
//               <div className="text-center">In Progress</div>
//               <div className="text-center">Risk Score</div>
//             </div>

//             {sortedData.map((entry) => (
//               <div
//                 key={entry.project}
//                 className="grid grid-cols-6 gap-2 px-3 py-3 rounded-xl bg-[#0c1726] border border-[#18233d] hover:border-blue-500 transition"
//               >
//                 <div>
//                   <div className="font-semibold text-white">{entry.project}</div>
//                   <div className="text-xs text-slate-400">{entry.projectName}</div>
//                 </div>

//                 <div
//                   className="flex items-center justify-center rounded-lg py-2 text-sm font-medium text-white"
//                   style={{
//                     backgroundColor: getHeatColor(entry.overdueCount, maxCount),
//                   }}
//                 >
//                   {entry.overdueCount}
//                 </div>

//                 <div
//                   className="flex items-center justify-center rounded-lg py-2 text-sm font-medium text-white"
//                   style={{
//                     backgroundColor: getHeatColor(entry.highPriorityCount, maxCount),
//                   }}
//                 >
//                   {entry.highPriorityCount}
//                 </div>

//                 <div
//                   className="flex items-center justify-center rounded-lg py-2 text-sm font-medium text-white"
//                   style={{
//                     backgroundColor: getHeatColor(entry.openCount, maxCount),
//                   }}
//                 >
//                   {entry.openCount}
//                 </div>

//                 <div
//                   className="flex items-center justify-center rounded-lg py-2 text-sm font-medium text-white"
//                   style={{
//                     backgroundColor: getHeatColor(entry.inProgressCount, maxCount),
//                   }}
//                 >
//                   {entry.inProgressCount}
//                 </div>

//                 <div
//                   className="flex items-center justify-center rounded-lg py-2 text-sm font-semibold text-white"
//                   style={{
//                     backgroundColor: getHeatColor(entry.riskScore, maxCount),
//                   }}
//                 >
//                   {entry.riskScore}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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