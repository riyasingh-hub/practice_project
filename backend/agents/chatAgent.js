const dataAgent = require("./dataAgent");
const analyticsAgent = require("./analyticsAgent");
const riskAgent = require("./riskAgent");
const recommendationAgent = require("./recommendationAgent");
const jiraService = require("../services/jiraService");
const { generateProjectSummary } = require("../services/aiService");
const {
  getHistory,
  getLatestContext,
  getLastProjectKey
} = require("../services/chatMemory");

function getProjectKeyFromIssue(issue) {
  return String(issue.projectKey || issue.key || "")
    .split("-")[0]
    .toUpperCase();
}

function isPortfolioComparisonQuestion(message) {
  const lower = String(message || "").toLowerCase();

  return /(compare|comparison|across all projects|all projects|which project|lowest completion rate|highest completion rate|rank|ranking|best project|worst project)/.test(lower);
}

function isProjectSpecificQuestion(message) {
  const lower = String(message || "").toLowerCase();

  return /(this project|that project|for tc|project details|project health|status of|risk of|completion rate of|backlog of|assignee|unassigned)/.test(lower)
    && !isPortfolioComparisonQuestion(message);
}

function buildProjectComparison(projects, issues) {
  return (projects || []).map((project) => {
    const projectKey = String(project.key || "").toUpperCase();
    const projectIssues = (issues || []).filter(
      (issue) => getProjectKeyFromIssue(issue) === projectKey
    );

    const projectAnalytics = analyticsAgent.analyze({
      issues: projectIssues,
      metrics: {}
    });

    return {
      projectKey,
      projectName: project.name || project.key,
      issueCount: projectIssues.length,
      analytics: projectAnalytics,
      riskAnalysis: riskAgent.analyzeRisk(projectAnalytics)
    };
  });
}

async function handleChatQuestion({ message, projectKey, sessionId }) {
  console.log("CHAT AGENT STARTED");

  const currentUser = await jiraService.getCurrentUser();
  const accountId = currentUser.accountId;

  const data = await dataAgent.getPortfolioData(accountId);
  const normalizedProjectKey = String(projectKey || "").trim().toUpperCase();
  const previousProjectKey = getLastProjectKey(sessionId);
  const isPortfolioComparison = isPortfolioComparisonQuestion(message);
  const isProjectSpecific = isProjectSpecificQuestion(message);
  const activeProjectKey = isProjectSpecific
    ? normalizedProjectKey || previousProjectKey
    : previousProjectKey;
  const isProjectScoped = Boolean(activeProjectKey) && !isPortfolioComparison;

  let scopedData = {
    ...data,
    metrics: isProjectScoped ? {} : data.metrics
  };

  if (isProjectScoped && activeProjectKey) {
    scopedData = {
      ...scopedData,
      projects: (data.projects || []).filter(
        (project) =>
          String(project.key || "").toUpperCase() === activeProjectKey
      ),
      issues: (data.issues || []).filter((issue) => {
        return getProjectKeyFromIssue(issue) === activeProjectKey;
      }),
      metrics: {}
    };
  }

  const analytics = analyticsAgent.analyze(scopedData);
  const riskAnalysis = riskAgent.analyzeRisk(analytics);
  const recommendationAnalysis = recommendationAgent.generateRecommendations(
    analytics,
    riskAnalysis
  );

  const projectComparison = buildProjectComparison(data.projects, data.issues);
  const history = getHistory(sessionId);
  const latestContext = getLatestContext(sessionId);

  const prompt = `
You are a project management assistant.

Conversation memory:
${JSON.stringify(history.slice(-4), null, 2)}

Previous context:
${JSON.stringify(latestContext || {}, null, 2)}

User question:
${message}

Scope:
${isProjectScoped ? `Project level analysis for ${activeProjectKey}` : "Portfolio-wide analysis across all projects"}

Instructions:
- If the user asks for comparison, ranking, or "which project has ..." across multiple projects, use the projectComparison context below and do not treat the current project route as the only source of truth.
- If the user asks about one specific project, use the scoped project context only.
- Do not reuse the account-level metrics for one-project questions. Recalculate that project's metrics from its issues when the scope is project-specific.
- Answer clearly, professionally, and concisely.
- If data is missing, say that explicitly.

Current project context:
${JSON.stringify(
  {
    projectKey: activeProjectKey || normalizedProjectKey || "all",
    analytics,
    riskAnalysis,
    recommendationAnalysis,
    projectCount: scopedData.projects?.length || 0,
    issueCount: scopedData.issues?.length || 0,
    userCount: scopedData.users?.length || 0
  },
  null,
  2
)}

Portfolio comparison context for all projects:
${JSON.stringify(projectComparison, null, 2)}

Return a concise answer only.
`;

  const answer = await generateProjectSummary(prompt);

  console.log("CHAT AGENT COMPLETED");

  return answer;
}

module.exports = {
  handleChatQuestion
};
