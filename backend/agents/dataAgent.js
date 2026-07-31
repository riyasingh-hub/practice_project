const Project = require("../models/Project");
const Issue = require("../models/Issue");
const Metrics = require("../models/Metrics");
const User = require("../models/User");

function normalizeStatus(status) {
  return (status || "").toLowerCase();
}

function isDone(status) {
  return status === "done";
}

function isOpen(status) {
  return status === "to do" || status === "open";
}

function isInProgress(status) {
  return status === "in progress";
}

function isInReview(status) {
  return status === "in review";
}

function summaryStatusCounts(issues) {
  return issues.reduce(
    (counts, issue) => {
      const status = normalizeStatus(issue.status);

      if (isOpen(status)) {
        counts.open += 1;
      } else if (isInProgress(status)) {
        counts.inProgress += 1;
      } else if (isInReview(status)) {
        counts.inReview += 1;
      } else if (isDone(status)) {
        counts.done += 1;
      } else {
        counts.other += 1;
      }

      return counts;
    },
    {
      open: 0,
      inProgress: 0,
      inReview: 0,
      done: 0,
      other: 0
    }
  );
}

function priorityCounts(issues) {
  return issues.reduce(
    (counts, issue) => {
      const priority = (issue.priority || "").toLowerCase();

      if (priority === "highest") {
        counts.highest += 1;
      } else if (priority === "high") {
        counts.high += 1;
      } else if (priority === "medium") {
        counts.medium += 1;
      } else if (priority === "low") {
        counts.low += 1;
      } else {
        counts.other += 1;
      }

      return counts;
    },
    {
      highest: 0,
      high: 0,
      medium: 0,
      low: 0,
      other: 0
    }
  );
}

function dateSummary(issues) {
  const dueDates = issues
    .filter(issue => issue.dueDate)
    .map(issue => new Date(issue.dueDate));

  if (dueDates.length === 0) {
    return {
      earliestDueDate: null,
      latestDueDate: null,
      nextDueDate: null
    };
  }

  const sorted = dueDates.sort((a, b) => a - b);
  const now = new Date();
  const futureDue = sorted.find(date => date >= now) || sorted[0];

  return {
    earliestDueDate: sorted[0],
    latestDueDate: sorted[sorted.length - 1],
    nextDueDate: futureDue
  };
}

function buildProjectDetails(project, issues) {
  const projectIssues = issues.filter(
    issue => issue.projectKey === project.key
  );

  const statusCounts = summaryStatusCounts(projectIssues);
  const priorityBreakdown = priorityCounts(projectIssues);

  const overdueTickets = projectIssues.filter(issue => {
    if (!issue.dueDate) return false;
    return (
      new Date(issue.dueDate) < new Date() &&
      !isDone(normalizeStatus(issue.status))
    );
  }).length;

  const highPriorityOpenIssues = projectIssues.filter(issue => {
    const status = normalizeStatus(issue.status);
    const priority = (issue.priority || "").toLowerCase();
    return (
      ["highest", "high", "critical"].includes(priority) &&
      !isDone(status)
    );
  }).length;

  const unassignedIssues = projectIssues.filter(
    issue => !issue.assignee || issue.assignee === "Unassigned"
  ).length;

  const bugCount = projectIssues.filter(
    issue => (issue.issueType || "").toLowerCase() === "bug"
  ).length;

  const { earliestDueDate, latestDueDate, nextDueDate } =
    dateSummary(projectIssues);

  return {
    projectKey: project.key,
    projectId: project._id,
    name: project.name,
    description: project.description,
    projectLead: project.projectLead,
    jiraId: project.jiraId,
    totalIssues: projectIssues.length,
    openTickets: statusCounts.open,
    inProgressTickets: statusCounts.inProgress,
    inReviewTickets: statusCounts.inReview,
    completedTickets: statusCounts.done,
    overdueTickets,
    highPriorityOpenIssues,
    unassignedIssues,
    bugCount,
    statusCounts,
    priorityBreakdown,
    dueDateSummary: {
      earliestDueDate,
      latestDueDate,
      nextDueDate
    },
    issues: projectIssues.map(issue => ({
      id: issue._id || issue.id,
      key: issue.key,
      summary: issue.summary,
      status: issue.status,
      priority: issue.priority,
      assignee: issue.assignee || "Unassigned",
      reporter: issue.reporter,
      created: issue.created,
      dueDate: issue.dueDate,
      issueType: issue.issueType,
      projectKey: issue.projectKey
    }))
  };
}

async function getPortfolioData(accountId) {

  console.log("DATA AGENT STARTED");
  const rawProjects = await Project.find({
    accountId
  });

  const issues = await Issue.find({
    accountId
  });

  const users = await User.find({
    accountId
  });

  const metrics = await Metrics.findOne({
    accountId
  }).sort({
    updatedAt: -1
  });

  const projects = rawProjects.map(project =>
    buildProjectDetails(project, issues)
  );

  console.log("DATA AGENT COMPLETED");

  return {
    rawProjects,
    projects,
    issues,
    users,
    metrics
  };
}

async function getProjectData(
  accountId,
  projectKey
) {
  const project = await Project.findOne({
    accountId,
    key: projectKey
  });

  const issues = await Issue.find({
    accountId,
    projectKey
  });

  return {
    project,
    issues
  };
}


module.exports = {
  getPortfolioData,
  getProjectData
};

