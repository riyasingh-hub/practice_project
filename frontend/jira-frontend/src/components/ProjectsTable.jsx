export default function ProjectsTable({
  data,
}) {
  return (
    <div className="bg-[#081120] rounded-xl border border-[#16243d] p-6">
      <h2 className="text-xl mb-6">
        Projects
      </h2>

      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400">
            <th>Name</th>
            <th>Lead</th>
            <th>Tickets</th>
            <th>Done</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {data.map((project) => (
            <tr
              key={project.name}
              className="border-t border-slate-800"
            >
              <td className="py-4">
                {project.name}
              </td>

              <td>{project.lead}</td>

              <td>{project.tickets}</td>

              <td>{project.done}</td>

              <td>{project.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}