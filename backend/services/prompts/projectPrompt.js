function buildProjectPrompt(metricsData, issues) {
  return `
Analyze this Jira project.

Metrics:
${JSON.stringify(metricsData, null, 2)}

Issues:
${JSON.stringify(
  issues.slice(0, 20).map(issue => {
    const fields = issue.fields || {};

    return {
      project: issue.projectKey,
      key: issue.key,
      summary: fields.summary || "",
      status: fields.status?.name || "Unknown",
      priority: fields.priority?.name || "",
      assignee:
        fields.assignee?.displayName ||
        "Unassigned"
    };
  }),
  null,
  2
)}

Provide:

1. Executive Summary
2. Project Health Score out of 100
3. Risks
4. Recommendations
`;
}

module.exports = {
  buildProjectPrompt
};