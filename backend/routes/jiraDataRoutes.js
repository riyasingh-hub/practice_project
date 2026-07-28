const express = require("express");

const {
  getJiraData,
  getProjectDetails,
  getProjectIntelligence,
  getStoredIssues,
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

module.exports = router;