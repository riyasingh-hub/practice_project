function buildPortfolioPrompt(
  projects,
  metrics,
  issues
) {
  return `
You are a Senior PMO and Portfolio Management Analyst.

Analyze the Jira portfolio data and provide an executive-level assessment.

Projects:
${JSON.stringify(projects, null, 2)}

Metrics:
${JSON.stringify(metrics, null, 2)}

Issues:
${JSON.stringify(
  issues.map(issue => ({
    project: issue.projectKey,
    key: issue.key,
    summary: issue.summary,
    status: issue.status,
    priority: issue.priority,
    assignee: issue.assignee
  })),
  null,
  2
)}

Instructions:

1. Evaluate overall portfolio performance.

2. Determine the most delayed project.

3. Determine the highest risk project.

4. Determine the best performing project.

5. Provide recommendations.

Return ONLY valid JSON.
`;
}

module.exports = {
  buildPortfolioPrompt
};