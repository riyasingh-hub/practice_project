function analyzeRisk(analytics) {
  console.log("RISK AGENT STARTED");

  const risks = [];

  if (analytics.healthScore < 60) {
    risks.push({
      type: "Project Health",
      severity: "High",
      metric: "healthScore",
      value: analytics.healthScore,
      reason:
        "Health score below 60 indicates cumulative delivery, backlog, and quality pressure.",
      message:
        "Project health score is below acceptable threshold."
    });
  }

  if (analytics.backlogRate > 40) {
    risks.push({
      type: "Backlog",
      severity: "High",
      metric: "backlogRate",
      value: analytics.backlogRate,
      reason:
        "Backlog rate over 40% indicates the team is carrying too much unfinished work relative to total scope.",
      message:
        "Backlog is growing rapidly."
    });
  }

  if (analytics.highPriorityOpenIssues > 5) {
    risks.push({
      type: "Critical Issues",
      severity: "High",
      metric: "highPriorityOpenIssues",
      value: analytics.highPriorityOpenIssues,
      reason:
        "More than five unresolved high priority issues increases risk to delivery and quality commitments.",
      message:
        "Large number of unresolved high priority issues."
    });
  }

  if (analytics.unassignedIssues > 0) {
    risks.push({
      type: "Resource Assignment",
      severity: "Medium",
      metric: "unassignedIssues",
      value: analytics.unassignedIssues,
      reason:
        "Unassigned work items can delay progress by creating ambiguity around ownership.",
      message:
        "There are unassigned tickets."
    });
  }

  if (analytics.overdueTickets > 0) {
    risks.push({
      type: "Delivery Delay",
      severity: "Medium",
      metric: "overdueTickets",
      value: analytics.overdueTickets,
      reason:
        "Overdue tickets indicate work is not being completed on schedule and may impact downstream milestones.",
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
