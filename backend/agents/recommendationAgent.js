function generateRecommendations(
  analytics,
  riskAnalysis
) {

  const recommendations = [];

  if (analytics.backlogRate > 30) {
    recommendations.push(
      "Reduce sprint backlog and prioritize high-value work."
    );
  }

  if (analytics.unassignedIssues > 0) {
    recommendations.push(
      "Assign ownership for all unassigned issues."
    );
  }

  if (analytics.overdueTickets > 0) {
    recommendations.push(
      "Review overdue tickets and create recovery plan."
    );
  }

  if (
    analytics.highPriorityOpenIssues > 5
  ) {
    recommendations.push(
      "Prioritize critical issues in the next sprint."
    );
  }

  if (
    riskAnalysis.overallRisk === "HIGH"
  ) {
    recommendations.push(
      "Conduct immediate project health review."
    );
  }

  if (
    Object.keys(
      analytics.workloadDistribution || {}
    ).length > 0
  ) {
    recommendations.push(
      "Review workload distribution across team members."
    );
  }

  return {
    recommendations
  };
}

module.exports = {
  generateRecommendations
};