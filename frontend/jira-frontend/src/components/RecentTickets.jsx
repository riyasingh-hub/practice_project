export default function RecentTickets({
  tickets,
}) {
  return (
   <div className="bg-gradient-to-br from-[#081120] via-[#0d1728] to-[#111c31] rounded-2xl border border-[#1b2d4a] p-6 shadow-xl shadow-blue-950/20">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-white">
      Recent Tickets
    </h2>

    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm">
      {tickets.length} Tickets
    </span>
  </div>

  <div className="space-y-4">
    {tickets.map((ticket) => (
      <div
        key={ticket.id}
        className="
          group
          bg-[#101827]
          border border-[#223556]
          rounded-xl
          p-5
          transition-all
          duration-300
          hover:border-blue-500/50
          hover:bg-[#14203a]
          hover:-translate-y-1
          hover:shadow-lg
          hover:shadow-blue-500/10
        "
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Title */}
          <div>
            <h3 className="text-white font-semibold text-lg group-hover:text-blue-300 transition-colors">
              {ticket.title}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Ticket ID: {ticket.id}
            </p>
          </div>

          {/* Status & Priority */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${
                  ticket.priority === "High"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : ticket.priority === "Medium"
                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    : "bg-green-500/10 text-green-400 border border-green-500/20"
                }
              `}
            >
              {ticket.priority}
            </span>

            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${
                  ticket.status === "Done"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : ticket.status === "In Progress"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-gray-500/10 text-gray-300 border border-gray-500/20"
                }
              `}
            >
              {ticket.status}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
  );
}