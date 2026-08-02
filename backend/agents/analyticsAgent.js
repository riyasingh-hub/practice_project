function analyze(data) {

  console.log("ANALYTICS AGENT STARTED");
  const {
    issues = [],
    metrics = {}
  } = data || {};

  const normalizedIssues = issues.map((issue) => ({
    ...issue,
    priority: String(issue.priority || issue.fields?.priority?.name || "").toLowerCase(),
    status: String(issue.status || issue.fields?.status?.name || "").toLowerCase(),
    assignee: issue.assignee || issue.fields?.assignee?.displayName || "Unassigned",
    issueType: String(issue.issueType || issue.fields?.issuetype?.name || "").toLowerCase()
  }));

  const overdueTickets = normalizedIssues.filter(issue => {
    if (!issue.dueDate) return false;

    return (
      new Date(issue.dueDate) < new Date() &&
      issue.status !== "done" &&
      issue.status !== "closed" &&
      issue.status !== "resolved"
    );
  }).length;

  const bugCount = normalizedIssues.filter(
    issue =>
      issue.issueType === "bug"
  ).length;

  const completedIssues = normalizedIssues.filter(issue =>
    ["done", "closed", "resolved"].includes(issue.status)
  ).length;

  const openIssues = normalizedIssues.filter(issue =>
    !["done", "closed", "resolved"].includes(issue.status)
  ).length;

  const highPriorityOpenIssues = normalizedIssues.filter(issue =>
    !["done", "closed", "resolved"].includes(issue.status) &&
    ["highest", "high", "critical"].includes(issue.priority)
  ).length;

  const unassignedIssues = normalizedIssues.filter(issue =>
    !issue.assignee || issue.assignee === "Unassigned"
  ).length;

  const completionRate = Number(
    metrics?.completionRate ??
    (normalizedIssues.length
      ? (completedIssues / normalizedIssues.length) * 100
      : 0)
  );

  const backlogRate = Number(
    metrics?.backlogRate ??
    (normalizedIssues.length
      ? (openIssues / normalizedIssues.length) * 100
      : 0)
  );

  const workloadDistribution = normalizedIssues.reduce((acc, issue) => {
    const assignee = issue.assignee || "Unassigned";
    acc[assignee] = (acc[assignee] || 0) + 1;
    return acc;
  }, {});

  const priorityBreakdown = {
    highest: normalizedIssues.filter(issue => issue.priority === "highest").length,
    high: normalizedIssues.filter(issue => issue.priority === "high" || issue.priority === "critical").length,
    medium: normalizedIssues.filter(issue => issue.priority === "medium").length,
    low: normalizedIssues.filter(issue => issue.priority === "low").length,
  };

  const healthScore = Number(
    metrics?.healthScore ??
    Math.max(0, Math.min(100, Math.round(100 - backlogRate - overdueTickets * 2 - bugCount * 1.5)))
  );

  console.log("ANALYTICS AGENT COMPLETED");

  return {
    healthScore,

    completionRate,

    backlogRate,

    highPriorityOpenIssues,

    unassignedIssues,

    workloadDistribution,

    priorityBreakdown,

    bugCount,

    overdueTickets
  };

  
}

module.exports = {
  analyze
};