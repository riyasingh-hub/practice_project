export default function ProjectsTable({
  data,
}) {
  return (
    <div className="bg-gradient-to-br from-[#081120] via-[#0d1728] to-[#111c31] rounded-2xl border border-[#1b2d4a] p-6 shadow-xl shadow-blue-950/20">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white">
      Projects
    </h2>

    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
      {data.length} Projects
    </span>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full min-w-[700px]">
      <thead>
        <tr className="[700border-b border-3654]">
          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Name
          </th>
          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Lead
          </th>
          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Tickets
          </th>
          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Done
          </th>
          <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((project) => (
          <tr
            key={project.name}
            className="
              border-b border-[#1a2c47]
              hover:bg-[#13213a]/70
              transition-all duration-200
            "
          >
            <td className="py-4 px-4">
              <div className="font-medium text-white">
                {project.name}
              </div>
            </td>

            <td className="py-4 px-4 text-gray-300">
              {project.lead}
            </td>

            <td className="py-4 px-4">
              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 font-medium">
                {project.tickets}
              </span>
            </td>

            <td className="py-4 px-4">
              <span className="px-3 py-1 rounded-lg bg-green-500/10 text-green-400 font-medium">
                {project.done}
              </span>
            </td>

            <td className="py-4 px-4">
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-semibold
                  ${
                    project.status === "Completed"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : project.status === "In Progress"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }
                `}
              >
                {project.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
}