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
You are a Senior PMO, Delivery Manager and Engineering Leader.

Create a concise executive project report using the analytics below.

Rules:
- Return plain text only.
- Do not use markdown markers such as **, #, or quotes.
- Do not add code fences.
- Use simple numbered sections with short, professional sentences.
- Keep the output concise, business-facing, and easy to read.
- If a value is missing, mention that clearly instead of inventing details.

Analytics:
${JSON.stringify(
  analytics,
  null,
  2
)}

Risk Analysis:
${JSON.stringify(
  riskAnalysis,
  null,
  2
)}

Recommendations:
${JSON.stringify(
  recommendationAnalysis,
  null,
  2
)}

Required structure:
1. Executive Summary
2. Project Health Assessment
3. Key Risks
4. Positive Highlights
5. Recommendations
6. Management Actions
`;

  const report =
    await generateProjectSummary(
      prompt
    );

  console.log("REPORT AGENT COMPLETED");

  return report;
}

module.exports = {
  generateReport
};
``