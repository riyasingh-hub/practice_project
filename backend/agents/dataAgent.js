const Project = require("../models/Project");
const Issue = require("../models/Issue");
const Metrics = require("../models/Metrics");
const User = require("../models/User");

async function getPortfolioData(accountId) {

  console.log("DATA AGENT STARTED");
  const projects = await Project.find({
    accountId
  });

  const issues = await Issue.find({
    accountId
  });

  const users = await User.find({
    accountId
  });

  const metrics = await Metrics.findOne({
    accountId
  }).sort({
    updatedAt: -1
  });

  console.log("DATA AGENT COMPLETED");

  return {
    projects,
    issues,
    users,
    metrics
  };
}

async function getProjectData(
  accountId,
  projectKey
) {
  const project = await Project.findOne({
    accountId,
    key: projectKey
  });

  const issues = await Issue.find({
    accountId,
    projectKey
  });

  return {
    project,
    issues
  };
}


module.exports = {
  getPortfolioData,
  getProjectData
};

