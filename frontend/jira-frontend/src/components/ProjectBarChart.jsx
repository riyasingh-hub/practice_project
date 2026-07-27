import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function ProjectBarChart({
  data,
}) {
  return (
    <div className="bg-[#081120] p-6 rounded-xl border border-[#16243d]">
      <h2 className="text-xl mb-6">
        Tickets by Project
      </h2>

      <ResponsiveContainer
        width="100%"
        height={300}
      >
        <BarChart data={data}>
          <XAxis dataKey="project" />
          <YAxis />

          <Tooltip />

          <Bar
            dataKey="tickets"
            fill="#6366f1"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
