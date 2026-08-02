function calculateHealthScore(data) {
  let score = 100;

  score -= data.backlogRate * 0.3;
  score -= data.highPriorityOpenIssues * 2;
  score -= data.unassignedIssues * 1.5;
  score += data.completionRate * 0.2;

  score = Math.max(0, Math.min(100, score));
  return Number(score.toFixed(2));
}

function buildProjectSummaries(issues) {
  const buckets = {};

  issues.forEach(issue => {
    const projectKey = issue.projectKey || "Unknown";
    const status = (issue.status || "").toLowerCase();
    const priority = (issue.priority || "").toLowerCase();

    if (!buckets[projectKey]) {
      buckets[projectKey] = {
        projectKey,
        totalIssues: 0,
        openIssues: 0,
        inProgressIssues: 0,
        completedIssues: 0,
        overdueTickets: 0,
        highPriorityOpenIssues: 0,
        unassignedIssues: 0
      };
    }

    const summary = buckets[projectKey];
    summary.totalIssues += 1;

    if (status === "to do" || status === "open") {
      summary.openIssues += 1;
    }

    if (status === "in progress") {
      summary.inProgressIssues += 1;
    }

    if (status === "done") {
      summary.completedIssues += 1;
    }

    if (issue.dueDate && new Date(issue.dueDate) < new Date() && status !== "done") {
      summary.overdueTickets += 1;
    }

    if (["highest", "high", "critical"].includes(priority) && status !== "done") {
      summary.highPriorityOpenIssues += 1;
    }

    if (!issue.assignee || issue.assignee === "Unassigned") {
      summary.unassignedIssues += 1;
    }
  });

  return Object.values(buckets).map(summary => {
    const completionRate =
      summary.totalIssues > 0
        ? Number(((summary.completedIssues / summary.totalIssues) * 100).toFixed(2))
        : 0;
    const backlogRate =
      summary.totalIssues > 0
        ? Number(((summary.openIssues / summary.totalIssues) * 100).toFixed(2))
        : 0;
    const overdueRate =
      summary.totalIssues > 0
        ? Number(((summary.overdueTickets / summary.totalIssues) * 100).toFixed(2))
        : 0;

    return {
      ...summary,
      completionRate,
      backlogRate,
      overdueRate,
      healthScore: calculateHealthScore({
        completionRate,
        backlogRate,
        highPriorityOpenIssues: summary.highPriorityOpenIssues,
        unassignedIssues: summary.unassignedIssues
      })
    };
  });
}

function selectProjectByMetric(projectSummaries, compareFn) {
  if (!projectSummaries || projectSummaries.length === 0) {
    return null;
  }

  return projectSummaries.reduce((best, current) => {
    if (!best) return current;
    return compareFn(best, current) ? best : current;
  }, null);
}

function analyze(data) {
  console.log("ANALYTICS AGENT STARTED");
  const { issues = [], metrics = {}, projects = [] } = data;

  const totalIssues = issues.length;

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

  const projectSummaries =
    projects.length > 0 ? projects : buildProjectSummaries(issues);

  const bestProject = selectProjectByMetric(
    projectSummaries,
    (a, b) => a.healthScore > b.healthScore
  );

  const highestRiskProject = selectProjectByMetric(
    projectSummaries,
    (a, b) => {
      const aRisk =
        a.overdueTickets * 3 +
        a.highPriorityOpenIssues * 2 +
        a.unassignedIssues * 1.5 +
        a.backlogRate;
      const bRisk =
        b.overdueTickets * 3 +
        b.highPriorityOpenIssues * 2 +
        b.unassignedIssues * 1.5 +
        b.backlogRate;
      return aRisk > bRisk;
    }
  );

  const aggregatedStatus = projectSummaries.reduce(
    (acc, project) => {
      acc.open += project.openTickets || 0;
      acc.inProgress += project.inProgressTickets || 0;
      acc.inReview += project.inReviewTickets || 0;
      acc.done += project.completedTickets || 0;
      acc.overdue += project.overdueTickets || 0;
      acc.highPriorityOpen += project.highPriorityOpenIssues || 0;
      acc.unassigned += project.unassignedIssues || 0;
      acc.bugs += project.bugCount || 0;
      return acc;
    },
    {
      open: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      overdue: 0,
      highPriorityOpen: 0,
      unassigned: 0,
      bugs: 0
    }
  );

  console.log("ANALYTICS AGENT COMPLETED");

  return {
    totalProjects: projectSummaries.length,
    totalIssues,
    overdueTickets,
    overdueRate:
      totalIssues > 0
        ? Number(((overdueTickets / totalIssues) * 100).toFixed(2))
        : 0,
    bugCount,
    healthScore: metrics?.healthScore || 0,
    completionRate: metrics?.completionRate || 0,
    backlogRate: metrics?.backlogRate || 0,
    highPriorityOpenIssues:
      metrics?.highPriorityOpenIssues || aggregatedStatus.highPriorityOpen,
    unassignedIssues:
      metrics?.unassignedIssues || aggregatedStatus.unassigned,
    workloadDistribution:
      metrics?.workloadDistribution || {},
    priorityBreakdown:
      metrics?.priorityBreakdown || {},
    projectSummaries,
    bestProject,
    highestRiskProject,
    aggregatedStatus
  };
}

module.exports = {
  analyze
};
