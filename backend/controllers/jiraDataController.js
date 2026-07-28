const axios = require("axios");

const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const Metrics = require("../models/Metrics");

const {
  getAccessToken,
  getCloudId
} = require("../config/jiraStore");

exports.getJiraData = async (req, res) => {
  try {
    const accessToken = getAccessToken();
    const cloudId = getCloudId();

    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    // Get all projects
    const projectsResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );

    const projects = projectsResponse.data;

    // Save all projects in MongoDB
    for (const p of projects) {
      await Project.findOneAndUpdate(
        { jiraId: p.id },
        {
          jiraId: p.id,
          key: p.key,
          name: p.name,
          description: p.description,
          projectType: p.projectTypeKey,
          projectLead: p.lead?.displayName || null,
          isPrivate: p.isPrivate,
          simplified: p.simplified
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    const projectKey = projects[0]?.key;

    if (!projectKey) {
      return res.status(404).json({
        message: "No Jira project found"
      });
    }

    // Get logged-in user
    const myselfResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );

    // Save user
    await User.findOneAndUpdate(
      {
        accountId: myselfResponse.data.accountId
      },
      {
        accountId: myselfResponse.data.accountId,
        displayName: myselfResponse.data.displayName,
        email: myselfResponse.data.emailAddress
      },
      {
        upsert: true,
        new: true
      }
    );

    // Get selected project details
    const projectResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );

    const project = projectResponse.data;

    // Save project
    await Project.findOneAndUpdate(
      {
        jiraId: project.id
      },
      {
        jiraId: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        projectType: project.projectTypeKey,
        projectLead: project.lead?.displayName || null,
        isPrivate: project.isPrivate,
        simplified: project.simplified
      },
      {
        upsert: true,
        new: true
      }
    );

    const projectDetails = {
      id: project.id,
      key: project.key,
      name: project.name,
      description: project.description,
      projectType: project.projectTypeKey,
      projectLead: project.lead?.displayName || null,
      isPrivate: project.isPrivate,
      simplified: project.simplified
    };

    res.json({
      user: {
        accountId: myselfResponse.data.accountId,
        displayName: myselfResponse.data.displayName,
        email: myselfResponse.data.emailAddress
      },

      project: projectDetails,

      projects: projects.map((p) => ({
        id: p.id,
        key: p.key,
        name: p.name
      }))
    });

  } catch (error) {
    console.error(
      "Jira API Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to fetch Jira data"
    });
  }
};

exports.getProjectDetails = async (req, res) => {
  try {
    const accessToken = getAccessToken();
    const cloudId = getCloudId();

    const { projectKey } = req.params;

    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }

    const response = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );

    const project = response.data;

    // Save project
    await Project.findOneAndUpdate(
      {
        jiraId: project.id
      },
      {
        jiraId: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        projectType: project.projectTypeKey,
        projectLead: project.lead?.displayName || null,
        isPrivate: project.isPrivate,
        simplified: project.simplified
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      id: project.id,
      key: project.key,
      name: project.name,
      description: project.description,
      projectType: project.projectTypeKey,
      projectLead: project.lead?.displayName || null,
      isPrivate: project.isPrivate,
      simplified: project.simplified
    });

  } catch (error) {
    console.error(
      "Project API Error:",
      error.response?.data || error.message
    );

    res.status(error.response?.status || 500).json({
      message: "Failed to fetch project details"
    });
  }
};

exports.getProjectIntelligence = async (req, res) => {
  try {
    const accessToken = getAccessToken();
    const cloudId = getCloudId();

    const { projectKey } = req.params;

    const allIssues = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          jql: `project=${projectKey}`,
          fields:
            "summary,status,priority,assignee,created,duedate,reporter"
        }
      }
    );

    const issues = allIssues.data.issues || [];

    // Save Issues
    for (const issue of issues) {
      await Issue.findOneAndUpdate(
        {
          jiraId: issue.id
        },
        {
          jiraId: issue.id,
          key: issue.key,
          summary: issue.fields.summary,
          status: issue.fields.status.name,
          priority: issue.fields.priority?.name,
          assignee:
            issue.fields.assignee?.displayName ||
            "Unassigned",
          reporter:
            issue.fields.reporter?.displayName,
          created: issue.fields.created,
          dueDate: issue.fields.duedate
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    const openTickets = issues.filter(
      (issue) => issue.fields.status.name === "To Do"
    );

    const completedTickets = issues.filter(
      (issue) => issue.fields.status.name === "Done"
    );

    const inProgressTickets = issues.filter(
      (issue) => issue.fields.status.name === "In Progress"
    );

    // Save Metrics
    await Metrics.findOneAndUpdate(
      {},
      {
        totalTickets: issues.length,
        openTickets: openTickets.length,
        completedTickets: completedTickets.length,
        inProgressTickets: inProgressTickets.length,
        updatedAt: new Date()
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json({
      metrics: {
        totalTickets: issues.length,
        openTickets: openTickets.length,
        completedTickets: completedTickets.length,
        inProgressTickets: inProgressTickets.length
      },

      issues: issues.map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority?.name,
        assignee:
          issue.fields.assignee?.displayName ||
          "Unassigned",
        reporter:
          issue.fields.reporter?.displayName,
        created: issue.fields.created,
        dueDate: issue.fields.duedate
      }))
    });

  } catch (error) {
    console.error(
      "Project Intelligence Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error:
        error.response?.data ||
        error.message
    });
  }
};

/*
|--------------------------------------------------------------------------
| MongoDB Data APIs
|--------------------------------------------------------------------------
*/

// Get all issues
exports.getStoredIssues = async (req, res) => {
  try {
    const issues = await Issue.find();

    res.json(issues);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get all projects
exports.getStoredProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get latest metrics
exports.getStoredMetrics = async (req, res) => {
  try {
    const metrics = await Metrics.findOne().sort({
      updatedAt: -1
    });

    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Get users
exports.getStoredUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};