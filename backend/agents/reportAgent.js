const {
  generateProjectSummary
} = require("../services/aiService");

async function generateReport(analytics) {

   console.log("REPORT AGENT STARTED");

  const prompt = `
You are a Senior PMO, Delivery Manager and Engineering Leader.

Analyze the project analytics below and create an executive report.

Analytics:
${JSON.stringify(
  data.analytics,
  null,
  2
)}

Risk Analysis:
${JSON.stringify(
  data.riskAnalysis,
  null,
  2
)}

Recommendations:
${JSON.stringify(
  data.recommendationAnalysis,
  null,
  2
)}

Provide:

1. Executive Summary

2. Project Health Assessment

3. Key Risks

4. Positive Highlights

5. Recommendations

6. Management Actions

Keep the report professional and concise.
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