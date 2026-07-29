function calculateMetrics(issues) {
  const totalTickets = issues.length;
 
  const openTickets = issues.filter(
    issue => issue.status === "To Do"
  ).length;
 
  const completedTickets = issues.filter(
    issue => issue.status === "Done"
  ).length;
 
  const inProgressTickets = issues.filter(
    issue => issue.status === "In Progress"
  ).length;
 
  const inReviewTickets = issues.filter(
    issue => issue.status === "In Review"
  ).length;
 
  return {
    totalTickets,
    openTickets,
    completedTickets,
    inProgressTickets,
    inReviewTickets,
 
    completionRate:
      totalTickets > 0
        ? Number(
            (
              (completedTickets / totalTickets) *
              100
            ).toFixed(2)
          )
        : 0,
 
    backlogRate:
      totalTickets > 0
        ? Number(
            (
              (openTickets / totalTickets) *
              100
            ).toFixed(2)
          )
        : 0
  };
}
 
module.exports = {
  calculateMetrics
};
 