const express = require("express");

const {
  login,
  callback
} = require("../controllers/jiraAuthController");

const router = express.Router();

router.get("/jira", login);
router.get("/callback", callback);

module.exports = router;