import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const tooltipFormatter = (value, name) => {
  const labelMap = {
    completedCount: "Completed",
    inProgressCount: "In-Progress",
    openCount: "Open",
    overdueCount: "Overdue",
  };

  return [value, labelMap[name] ?? name];
};

export default function ProjectBarChart({ data }) {
  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
      <h2 className="text-xl mb-6">Tickets by Project</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="project" tick={{ fill: "#cbd5e1" }} />
          <YAxis tick={{ fill: "#cbd5e1" }} />
          <Tooltip formatter={tooltipFormatter} />
          <Legend wrapperStyle={{ color: "#cbd5e1" }} />

          <Bar dataKey="completedCount" name="Completed" stackId="a" fill="#16a34a" />
          <Bar dataKey="inProgressCount" name="In-Progress" stackId="a" fill="#38bdf8" />
          <Bar dataKey="openCount" name="Open" stackId="a" fill="#facc15" />
          <Bar dataKey="overdueCount" name="Overdue" stackId="a" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
