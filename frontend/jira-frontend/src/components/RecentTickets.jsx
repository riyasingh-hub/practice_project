export default function RecentTickets({
  tickets,
}) {
  return (
    <div className="bg-[#081120] rounded-xl border border-[#16243d] p-6">
      <h2 className="text-xl mb-6">
        Recent Tickets
      </h2>

      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="border-b border-slate-800 py-4"
        >
          <h3>{ticket.title}</h3>

          <div className="text-sm text-gray-400">
            {ticket.id} • {ticket.priority} •{" "}
            {ticket.status}
          </div>
        </div>
      ))}
    </div>
  );
}