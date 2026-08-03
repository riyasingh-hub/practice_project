const express = require("express");
 
const {
  getJiraData,
  getProjectDetails,
  getProjectIntelligence,
  getStoredIssues,
  getAISummary,
  getStoredProjects,
  getStoredMetrics,
  getStoredUsers,
  syncProjectData,
  syncAllProjectData,
  testDataAgent,
  testAnalyticsAgent,
  testReportAgent,
  getAgentReport,
  testRiskAgent,
  testRecommendationAgent
} = require("../controllers/jiraDataController");
 
const router = express.Router();
 
/*
|--------------------------------------------------------------------------
| Jira APIs
|--------------------------------------------------------------------------
*/
 
router.get("/", getJiraData);
 
router.get(
  "/project/:projectKey",
  getProjectDetails
);
 
router.get(
  "/project/:projectKey/intelligence",
  getProjectIntelligence
);
 
router.get(
  "/project-intelligence/:projectKey",
  getProjectIntelligence
);
 
/*
|--------------------------------------------------------------------------
| MongoDB APIs
|--------------------------------------------------------------------------
*/
 
router.get(
  "/db/issues",
  getStoredIssues
);
 
router.get(
  "/db/projects",
  getStoredProjects
);
 
router.get(
  "/db/metrics",
  getStoredMetrics
);
 
router.get(
  "/db/users",
  getStoredUsers
);
 
router.get(
  "/ai-summary",
  getAISummary
);
 
router.post(
  "/ai-summary",
  getAISummary
);
 
router.post(
  "/sync/:projectKey",
  syncProjectData
);

router.get(
  "/sync/:projectKey",
  syncProjectData
);
 
router.get(
  "/sync-all",
  syncAllProjectData
);
 
router.get(
  "/test-data-agent",
  testDataAgent
);

router.get(
  "/test-analytics-agent",
  testAnalyticsAgent
);

router.get(
  "/test-report-agent",
  testReportAgent
);

router.get(
  "/agent-report",
  getAgentReport
);

router.get(
  "/orchestrator/:accountId",
  getAgentReport
);

router.get(
  "/test-risk-agent",
  testRiskAgent
);

router.get(
  "/test-recommendation-agent",
  testRecommendationAgent
);

module.exports = router;