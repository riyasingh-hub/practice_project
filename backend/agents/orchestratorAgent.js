const dataAgent =
  require("./dataAgent");

const analyticsAgent =
  require("./analyticsAgent");

const reportAgent =
  require("./reportAgent");

const riskAgent =
  require("./riskAgent");

const recommendationAgent =
  require("./recommendationAgent");

async function execute(accountId) {

  console.log("ORCHESTRATOR STARTED");

  const data =
    await dataAgent.getPortfolioData(
      accountId
    );

  const analytics =
    analyticsAgent.analyze(data);

  const recommendationAnalysis =    recommendationAgent.generateRecommendations(analytics,      riskAnalysis );

  const report =
    await reportAgent.generateReport(
      analytics,
      riskAnalysis,     recommendationAnalysis
    );

  const riskAnalysis =
    riskAgent.analyzeRisk(
      analytics
    );

    console.log( "ORCHESTRATOR COMPLETED" );

  return {
    analytics,
    riskAnalysis,
    report,
    recommendationAnalysis
  };
}

module.exports = {
  execute
};