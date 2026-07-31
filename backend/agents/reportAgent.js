const {
  generateProjectSummary
} = require("../services/aiService");

async function generateReport(
  analytics,
  riskAnalysis = {},
  recommendationAnalysis = {}
) {

  console.log("REPORT AGENT STARTED");

  const prompt = `
You are an expert PMO analyst and delivery governance advisor.
Use the analytics, project summaries, risk analysis, and recommendation data below to create a technical executive report for senior project leadership.

Analytics:
${JSON.stringify(analytics, null, 2)}

Risk Analysis:
${JSON.stringify(riskAnalysis, null, 2)}

Recommendations:
${JSON.stringify(recommendationAnalysis, null, 2)}

Report structure:
1. Executive Summary
2. Overall Portfolio Health Assessment
3. Best Performing Project and why it is strong
4. Most At-Risk Project, key risk drivers, and root causes
5. Metrics dashboard with values, thresholds, and implications
6. Key Risks with severity, impact, and mitigation focus
7. Actionable recommendations prioritized by urgency
8. Top priorities for the next planning cycle

Guidelines:
- Use exact metrics from the analytics object.
- When naming projects, use projectKey or the provided project summaries.
- Focus on schedule, backlog, critical priority, assignment, delivery risk, and quality.
- Avoid generic language and raw API implementation details.
- Keep the report technical, practical, and concise.
`;

  const report = await generateProjectSummary(prompt);

  console.log("REPORT AGENT COMPLETED");

  return report;
}

module.exports = {
  generateReport
};
``