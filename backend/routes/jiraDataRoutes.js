const express = require("express");

const {
  getJiraData,
  getProjectDetails
} = require("../controllers/jiraDataController");

const router = express.Router();

router.get("/", getJiraData);
router.get("/project/:projectKey", getProjectDetails);

module.exports = router;