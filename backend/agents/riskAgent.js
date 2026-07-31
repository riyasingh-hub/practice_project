function analyzeRisk(analytics) {

     console.log("RISK AGENT STARTED");

  const risks = [];

  // Health Risk
  if (analytics.healthScore < 60) {
    risks.push({
      type: "Project Health",
      severity: "High",
      message:
        "Project health score is below acceptable threshold."
    });
  }

  // Backlog Risk
  if (analytics.backlogRate > 40) {
    risks.push({
      type: "Backlog",
      severity: "High",
      message:
        "Backlog is growing rapidly."
    });
  }

  // Priority Risk
  if (analytics.highPriorityOpenIssues > 5) {
    risks.push({
      type: "Critical Issues",
      severity: "High",
      message:
        "Large number of unresolved high priority issues."
    });
  }

  // Assignment Risk
  if (analytics.unassignedIssues > 0) {
    risks.push({
      type: "Resource Assignment",
      severity: "Medium",
      message:
        "There are unassigned tickets."
    });
  }

  // Delivery Risk
  if (analytics.overdueTickets > 0) {
    risks.push({
      type: "Delivery Delay",
      severity: "Medium",
      message:
        "Project contains overdue work items."
    });
  }

  let overallRisk = "LOW";

  if (risks.length >= 4) {
    overallRisk = "HIGH";
  } else if (risks.length >= 2) {
    overallRisk = "MEDIUM";
  }

  console.log("RISK AGENT COMPLETED");

  return {
    overallRisk,
    risks
  };
}

module.exports = {
  analyzeRisk
};