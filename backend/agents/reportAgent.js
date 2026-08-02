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

Generate a project portfolio summary for a Project Manager using the analytics object.

Requirements:
- Use only the metrics available in the analytics object. Do not invent, estimate, or generalize values.
- Include both portfolio-level insights and project-level analysis.
- Always reference projects using their exact projectKey values.
- Compare project-level metrics to identify relative performance and risk across projects.
- Highlight:
  - Best Performing Project (strongest delivery, schedule adherence, quality, backlog health, and risk profile)
  - Highest Risk Project (largest schedule risk, delivery risk, critical issues, backlog pressure, or quality concerns)
- Focus analysis on:
  - Schedule performance and slippage trends
  - Backlog size, growth, and aging work items
  - Critical and high-priority work items
  - Assignment and workload distribution
  - Delivery risk indicators
  - Quality metrics, defects, and unresolved issues
  - Team execution health and delivery readiness

Reporter Context:
- Identify projects where the logged-in user is the reporter.
- Provide a dedicated section summarizing only those projects.
- Highlight ownership, key risks, delivery status, and immediate actions required for the reporter's projects.

Output Style:
- Write for a Project Manager and delivery leadership audience.
- Use simple, clear, professional language.
- Keep the response attractive and easy to read.
- Present the report in plain bullet points, not markdown tables or heavy formatting.
- Do not use hashtags, symbols, or decorative markers like #, -, or bullet icons.
- Use short paragraphs and clean section labels.
- Prioritize insights over metric repetition.
- Explain the business impact of risks and performance trends.
- Surface projects that require immediate attention first.
- Include clear recommendations and next actions based on the metrics.
- Avoid generic statements, motivational language, and raw API/data structure references.

Output Structure:
Executive Summary
- Overall portfolio health
- Key achievements
- Top risks requiring attention

Portfolio Highlights
- Best Performing Project
- Highest Risk Project
- Cross-project observations and trends

Project-by-Project Summary
For each project using projectKey:
- Current status
- Schedule health
- Backlog health
- Critical priority items
- Assignment and workload observations
- Delivery risk assessment
- Quality assessment
- Recommended actions

Immediate Management Actions
- Ranked list of the highest-priority interventions across the portfolio

Generate insights directly from the provided metrics and comparisons, emphasizing exceptions, emerging risks, and execution gaps rather than restating all available numbers.
`;

  const report = await generateProjectSummary(prompt);

  console.log("REPORT AGENT COMPLETED");

  return report;
}

module.exports = {
  generateReport
};
``