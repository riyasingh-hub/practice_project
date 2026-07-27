
export const stats = [
  {
    title: "Total Projects",
    value: 14,
    change: "+2",
    color: "text-purple-400",
  },
  {
    title: "Total Tickets",
    value: 348,
    change: "+27",
    color: "text-cyan-400",
  },
  {
    title: "Completed",
    value: 215,
    change: "+15",
    color: "text-green-400",
  },
  {
    title: "In Progress",
    value: 97,
    change: "-4",
    color: "text-yellow-400",
  },
  {
    title: "Blocked",
    value: 3,
    change: "+3",
    color: "text-red-400",
  },
];

export const pieData = [
  { name: "Completed", value: 215 },
  { name: "In Progress", value: 97 },
  { name: "To Do", value: 33 },
  { name: "Blocked", value: 3 },
];

export const projectData = [
  { project: "Payment API", tickets: 58 },
  { project: "Auth Service", tickets: 44 },
  { project: "Mobile App", tickets: 71 },
  { project: "Dashboard", tickets: 39 },
  { project: "Analytics", tickets: 52 },
  { project: "Data Pipeline", tickets: 84 },
];

export const projects = [
  {
    name: "Payment API",
    lead: "Sarah Chen",
    tickets: 58,
    done: 34,
    progress: 59,
    status: "At Risk",
  },
  {
    name: "Auth Service",
    lead: "Marcus Webb",
    tickets: 44,
    done: 40,
    progress: 91,
    status: "On Track",
  },
];

export const recentTickets = [
  {
    id: "PAY-412",
    title: "Fix stripe webhook timeout",
    priority: "High",
    status: "Blocked",
  },
  {
    id: "AUTH-187",
    title: "Implement OAuth refresh tokens",
    priority: "Medium",
    status: "Done",
  },
];