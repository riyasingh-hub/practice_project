function analyze(data) {

  console.log("ANALYTICS AGENT STARTED");
  const {
    issues,
    metrics
  } = data;

  const overdueTickets = issues.filter(issue => {
    if (!issue.dueDate) return false;

    return (
      new Date(issue.dueDate) < new Date() &&
      issue.status?.toLowerCase() !== "done"
    );
  }).length;

  const bugCount = issues.filter(
    issue =>
      issue.issueType?.toLowerCase() === "bug"
  ).length;

  console.log("ANALYTICS AGENT COMPLETED");

  return {
    healthScore: metrics?.healthScore || 0,

    completionRate:
      metrics?.completionRate || 0,

    backlogRate:
      metrics?.backlogRate || 0,

    highPriorityOpenIssues:
      metrics?.highPriorityOpenIssues || 0,

    unassignedIssues:
      metrics?.unassignedIssues || 0,

    workloadDistribution:
      metrics?.workloadDistribution || {},

    priorityBreakdown:
      metrics?.priorityBreakdown || {},

    bugCount,

    overdueTickets
  };

  
}

module.exports = {
  analyze
};