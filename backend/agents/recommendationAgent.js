function generateRecommendations(
  analytics,
  riskAnalysis
) {

  const recommendations = [];

  if (analytics.backlogRate > 30) {
    recommendations.push(
      "Reduce active backlog by validating scope, moving low-value work to a later release, and re-planning the next two sprints."
    );
  }

  if (analytics.unassignedIssues > 0) {
    recommendations.push(
      "Assign clear owners to all unassigned issues and align the team on ownership and next steps."
    );
  }

  if (analytics.overdueTickets > 0) {
    recommendations.push(
      "Review overdue tickets immediately, escalate blockers, and establish a time-boxed recovery plan."
    );
  }

  if (analytics.highPriorityOpenIssues > 5) {
    recommendations.push(
      "Reprioritize the next sprint around critical issues and ensure dedicated capacity for high priority fixes."
    );
  }

  if (analytics.bugCount > 0) {
    recommendations.push(
      "Validate bug triage and assign top defects to the team to prevent quality debt from impacting release readiness."
    );
  }

  if (riskAnalysis.overallRisk === "HIGH") {
    recommendations.push(
      "Schedule an immediate project health review with stakeholders to address high risks and confirm escalation actions."
    );
  }

  if (
    Object.keys(
      analytics.workloadDistribution || {}
    ).length > 0
  ) {
    recommendations.push(
      "Review workload distribution and rebalance assignments to avoid bottlenecks on overloaded team members."
    );
  }

  return {
    recommendations
  };
}

module.exports = {
  generateRecommendations
};
