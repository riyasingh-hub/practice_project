const express = require("express");
 
const {
  getJiraData,
  getProjectDetails,
  getProjectIntelligence,
  getStoredIssues,
  getAISummary,
  getStoredProjects,
  getStoredMetrics,
  getStoredUsers
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
 
module.exports = router;