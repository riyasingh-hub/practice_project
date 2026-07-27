const express = require("express");

const {
  getJiraData,
  getProjectDetails,
  getProjectIntelligence
} = require("../controllers/jiraDataController");

const router = express.Router();

router.get("/", getJiraData);
router.get("/project/:projectKey", getProjectDetails);
router.get(
  "/project/:projectKey/intelligence",
  getProjectIntelligence
);

module.exports = router;