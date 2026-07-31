function calculateMetrics(issues) {

  const totalTickets = issues.length;

  const openTickets = issues.filter(
    issue =>
      issue.status?.toLowerCase() === "to do"
  ).length;

  const completedTickets = issues.filter(
    issue =>
      issue.status?.toLowerCase() === "done"
  ).length;

  const inProgressTickets = issues.filter(
    issue =>
      issue.status?.toLowerCase() ===
      "in progress"
  ).length;

  const inReviewTickets = issues.filter(
    issue =>
      issue.status?.toLowerCase() ===
      "in review"
  ).length;

  const completionRate =
    totalTickets > 0
      ? Number(
          (
            (completedTickets /
              totalTickets) *
            100
          ).toFixed(2)
        )
      : 0;

  const backlogRate =
    totalTickets > 0
      ? Number(
          (
            (openTickets /
              totalTickets) *
            100
          ).toFixed(2)
        )
      : 0;

  const highPriorityOpenIssues =
    issues.filter(
      issue =>
        ["highest", "high", "critical"]
          .includes(
            issue.priority?.toLowerCase()
          ) &&
        issue.status?.toLowerCase() !==
          "done"
    ).length;

  const unassignedIssues =
    issues.filter(
      issue =>
        !issue.assignee ||
        issue.assignee ===
          "Unassigned"
    ).length;

  const workloadDistribution = {};

  issues.forEach(issue => {

    const assignee =
      issue.assignee ||
      "Unassigned";

    workloadDistribution[
      assignee
    ] =
      (workloadDistribution[
        assignee
      ] || 0) + 1;
  });

  const priorityBreakdown = {

    highest: issues.filter(
      i =>
        i.priority?.toLowerCase() ===
        "highest"
    ).length,

    high: issues.filter(
      i =>
        i.priority?.toLowerCase() ===
        "high"
    ).length,

    medium: issues.filter(
      i =>
        i.priority?.toLowerCase() ===
        "medium"
    ).length,

    low: issues.filter(
      i =>
        i.priority?.toLowerCase() ===
        "low"
    ).length
  };

  const healthScore = calculateHealthScore({
    completionRate,
    backlogRate,
    highPriorityOpenIssues,
    unassignedIssues
  });

  return {
    totalTickets,
    openTickets,
    completedTickets,
    inProgressTickets,
    inReviewTickets,

    completionRate,
    backlogRate,

    highPriorityOpenIssues,
    unassignedIssues,

    workloadDistribution,
    priorityBreakdown,

    healthScore
  };
}

function calculateHealthScore(data) {

  let score = 100;

  score -= data.backlogRate * 0.3;

  score -=
    data.highPriorityOpenIssues * 2;

  score -=
    data.unassignedIssues * 1.5;

  score +=
    data.completionRate * 0.2;

  score = Math.max(
    0,
    Math.min(100, score)
  );

  return Number(score.toFixed(2));
}

module.exports = {
  calculateMetrics
};