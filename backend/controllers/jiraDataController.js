
const axios = require("axios");
const {
  generateProjectSummary
} = require("../services/aiService");
const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const Metrics = require("../models/Metrics");
const jiraService = require("../services/jiraService");
const {
  buildProjectPrompt
} = require("../services/prompts/projectPrompt");

const {
  buildPortfolioPrompt
} = require("../services/prompts/portfolioPrompt");
const {
  calculateMetrics
} = require("../services/metricsService");

const dataAgent =
  require("../agents/dataAgent");

const analyticsAgent =
  require("../agents/analyticsAgent");

const reportAgent =
  require("../agents/reportAgent");

  const orchestratorAgent =
  require("../agents/orchestratorAgent");

  const riskAgent =
  require("../agents/riskAgent");

  const recommendationAgent =
  require("../agents/recommendationAgent");

  

const {
  getAccessToken,
  getCloudId
} = require("../config/jiraStore");
 
exports.getJiraData = async (req, res) => {
  try {
    const authContext = jiraService.getAuthContext();
    const { accessToken, cloudId } = authContext;

    console.log("[jiraData] getJiraData auth state", {
      accessTokenPresent: Boolean(accessToken),
      cloudId,
      tokenLength: accessToken?.length || 0
    });
 
    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }
 
    // Get logged-in user
    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
     currentUser.accountId;
 
    // Get all projects
    const projects =
  await jiraService.getProjects();
 
    // Save all projects in MongoDB (scoped to accountId)
    for (const p of projects) {
      await Project.findOneAndUpdate(
        { jiraId: p.id, accountId },
        {
          accountId,
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
 
    // Save user
    await User.findOneAndUpdate(
      {
        accountId: accountId
      },
      {
        accountId: accountId,
        displayName: currentUser.displayName,
        email: currentUser.emailAddress
      },
      {
        upsert: true,
        new: true
      }
    );
 
    // Get selected project details
    const project =
  await jiraService.getProject(projectKey);
 
    // Save project (scoped to accountId)
    await Project.findOneAndUpdate(
      {
        jiraId: project.id,
        accountId
      },
      {
        accountId,
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
 
    // Return projects saved for this accountId (avoid showing other users' projects)
    const storedProjects = await Project.find({ accountId });
 
    res.json({
      user: { accountId,displayName: currentUser.displayName,
      email: currentUser.emailAddress},
 
      project: projectDetails,
 
      projects: storedProjects.map((p) => ({
        id: p.jiraId,
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
    const authContext = jiraService.getAuthContext();
    const { accessToken, cloudId } = authContext;
 
    const { projectKey } = req.params;

    console.log("[jiraData] getProjectDetails auth state", {
      accessTokenPresent: Boolean(accessToken),
      cloudId,
      tokenLength: accessToken?.length || 0,
      projectKey
    });
 
    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated"
      });
    }
 
    const project = await jiraService.getProject(projectKey);
 
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
    const authContext = jiraService.getAuthContext();
    const { accessToken, cloudId } = authContext;
 
    const { projectKey } = req.params;

    console.log("[jiraData] getProjectIntelligence auth state", {
      accessTokenPresent: Boolean(accessToken),
      cloudId,
      tokenLength: accessToken?.length || 0,
      projectKey
    });
 
    // Get logged-in user to scope saved issues/metrics
   const currentUser = await jiraService.getCurrentUser();

const accountId = currentUser.accountId;
 
   const issues =
 await jiraService.getProjectIssues(
   projectKey
 );

console.log(
  JSON.stringify(
    issues[0]?.fields,
    null,
    2
  )
);


 
    const metrics = await Metrics.findOne({
      accountId
    }).sort({
      updatedAt: -1
    });
 
    if (!issues.length) {
      return res.status(400).json({
        message:
          "No Jira data available. Please sync project data first."
      });
    }
 
 
    // Save Issues (scoped to accountId)
    for (const issue of issues) {
      const fields = issue.fields || {};
      await Issue.findOneAndUpdate(
        {
          jiraId: issue.id,
          accountId
        },
        {
          accountId,
          jiraId: issue.id,
          projectKey,
          key: issue.key,
          summary: fields.summary || "",
          status: fields.status?.name || "Unknown",
          priority: fields.priority?.name || fields.priority || "",
          assignee:
            fields.assignee?.displayName ||
            "Unassigned",
          reporter:
            fields.reporter?.displayName || "",
          created: fields.created,
          updated: fields.updated,
          resolvedAt: fields.resolutiondate,
          dueDate: fields.duedate,
          labels: fields.labels || []
        },
        {
          upsert: true,
          new: true
        }
      );
    }
 
    const openTickets = issues.filter(
      (issue) => (issue.fields?.status?.name || "").toLowerCase() === "to do"
    );
 
    const completedTickets = issues.filter(
      (issue) => (issue.fields?.status?.name || "").toLowerCase() === "done"
    );
 
    const inProgressTickets = issues.filter(
      (issue) => (issue.fields?.status?.name || "").toLowerCase() === "in progress"
    );
 
    const inReviewTickets = issues.filter(
      (issue) => (issue.fields?.status?.name || "").toLowerCase() === "in review"
    );
 
    const metricsData = {
  totalTickets: issues.length,
  openTickets: openTickets.length,
  completedTickets: completedTickets.length,
  inProgressTickets: inProgressTickets.length,
  inReviewTickets: inReviewTickets.length
};
 
const prompt =
  buildProjectPrompt(
    metricsData,
    issues
  );
 
const aiResponse = await generateProjectSummary(prompt);
 
console.log("AI RESPONSE:", aiResponse);//For display
 
    // Save Metrics (scoped to accountId)
    await Metrics.findOneAndUpdate(
      { accountId },
      {
        accountId,
        totalTickets: issues.length,
        openTickets: openTickets.length,
        completedTickets: completedTickets.length,
        inProgressTickets: inProgressTickets.length,
        inReviewTickets: inReviewTickets.length,
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
        inProgressTickets: inProgressTickets.length,
        inReviewTickets: inReviewTickets.length,
 
      },
 
      aiSummary: aiResponse,
 
      issues: issues.map((issue) => {
        const fields = issue.fields || {};
        return {
          id: issue.id,
          key: issue.key,
          summary: fields.summary || "",
          status: fields.status?.name || "Unknown",
          priority: fields.priority?.name || fields.priority || "",
          assignee:
            fields.assignee?.displayName ||
            "Unassigned",
          reporter:
            fields.reporter?.displayName || "",
          created: fields.created,
          dueDate: fields.duedate,
          projectKey: issue.projectKey,
          fields
        };
      })
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
    const accountId = req.query.accountId;
 
    const filter = accountId ? { accountId } : {};
 
    const issues = await Issue.find(filter);


 
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
    const accountId = req.query.accountId;
 
    const filter = accountId ? { accountId } : {};
 
    const projects = await Project.find(filter);
 
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
    const accountId = req.query.accountId;
 
    const filter = accountId ? { accountId } : {};
 
    const metrics = await Metrics.findOne(filter).sort({
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

    const accountId = req.query.accountId;
 
    const users = await User.find({
  accountId
});
 
    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
 
exports.getAISummary = async (req, res) => {
  try {
    const authContext = jiraService.getAuthContext();
    const { accessToken, cloudId } = authContext;
 
    console.log("[jiraData] getAISummary auth state", {
      accessTokenPresent: Boolean(accessToken),
      cloudId,
      tokenLength: accessToken?.length || 0
    });
 
    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated with Jira. Please login through /auth/jira first."
      });
    }
 
    const currentUser =
 await jiraService.getCurrentUser();

const accountId =
 currentUser.accountId;
 
const projects = await Project.find({
  accountId
});
 
const issues = await Issue.find({
  accountId
});
 
const metrics = await Metrics.findOne({
  accountId
}).sort({
  updatedAt: -1
});
 
const prompt =
  buildPortfolioPrompt(
    projects,
    metrics,
    issues
  );
 
    const aiSummary = await generateProjectSummary(prompt);
 
    let parsedResponse;
 
    try {
      parsedResponse = JSON.parse(aiSummary);
    } catch (e) {
      parsedResponse = {
        rawResponse: aiSummary
      };
    }
 
    res.json(parsedResponse);
 
  } catch (error) {
    console.error("AI Summary Error:", error);
 
    res.status(500).json({
      message: error.message
    });
  }
};
 
exports.syncProjectData = async (
  req,
  res
) => {
  try {
    const authContext = jiraService.getAuthContext();
    const { accessToken, cloudId } = authContext;
 
    const { projectKey } = req.params;

    console.log("[jiraData] syncProjectData auth state", {
      accessTokenPresent: Boolean(accessToken),
      cloudId,
      tokenLength: accessToken?.length || 0,
      projectKey
    });
 
    const currentUser =
 await jiraService.getCurrentUser();

const accountId =
 currentUser.accountId;  
 
    const issues =
 await jiraService.getProjectIssues(
   projectKey
 );
 
    

    console.log(  
      JSON.stringify
      ( issues[0]?.fields,    null,
      2 
     )
    );
 
    for (const issue of issues) {
      const fields = issue.fields || {};
      await Issue.findOneAndUpdate(
        {
          jiraId: issue.id,
          accountId
        },
        {
          accountId,
          jiraId: issue.id,
          projectKey,
          key: issue.key,
          summary:
            fields.summary || "",
          status:
            fields.status?.name || "Unknown",
          issueType: fields.issuetype?.name || "",
          priority:
            fields.priority?.name || fields.priority || "",
          assignee:
            fields.assignee
              ?.displayName ||
            "Unassigned",
          reporter:
            fields.reporter
              ?.displayName || "",
          created:
            fields.created,
          updated: fields.updated,  
          resolvedAt: fields.resolutiondate,
          dueDate:
            fields.duedate,
          labels: fields.labels || []
        },
        {
          upsert: true,
          new: true
        }
      );
    }
 
    const storedIssues =
      await Issue.find({
        accountId
      });
 
    const metrics =
      calculateMetrics(
        storedIssues
      );
 
    await Metrics.findOneAndUpdate(
      {
        accountId,
      },
      {
        accountId,
        ...metrics,
        updatedAt: new Date()
      },
      {
        upsert: true
      }
    );
 
    res.json({
      message:
        "Project synced successfully",
      metrics
    });
  } catch (error) {
    console.error(error);
 
    res.status(500).json({
      message:
        "Failed to sync project"
    });
  }
};
 
exports.testDataAgent = async (
  req,
  res
) => {
  try {

    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
      currentUser.accountId;

    const data =
      await dataAgent.getPortfolioData(
        accountId
      );

    res.json(data);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
};
 
exports.testAnalyticsAgent =
  async (req, res) => {

  try {

    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
      currentUser.accountId;

    const data =
      await dataAgent.getPortfolioData(
        accountId
      );

    const analytics =
      analyticsAgent.analyze(data);

    res.json(analytics);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }

};

exports.testReportAgent =
  async (req, res) => {

  try {

    const analytics = {
      healthScore: 80,
      completionRate: 75,
      backlogRate: 20,
      bugCount: 8,
      overdueTickets: 3
    };

    const report =
      await reportAgent.generateReport(
        analytics
      );

    res.json({
      report
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getAgentReport =
  async (req, res) => {

  try {

    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
      currentUser.accountId;

    const result =
      await orchestratorAgent.execute(
        accountId
      );

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message:
        "Failed to generate report"
    });

  }

};

exports.testRiskAgent =
  async (req, res) => {

  try {

    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
      currentUser.accountId;

    const data =
      await dataAgent.getPortfolioData(
        accountId
      );

    const analytics =
      analyticsAgent.analyze(data);

    const riskAnalysis =
      riskAgent.analyzeRisk(
        analytics
      );

    res.json(riskAnalysis);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
};

exports.testRecommendationAgent =
  async (req, res) => {

  try {

    const currentUser =
      await jiraService.getCurrentUser();

    const accountId =
      currentUser.accountId;

    const data =
      await dataAgent.getPortfolioData(
        accountId
      );

    const analytics =
      analyticsAgent.analyze(data);

    const riskAnalysis =
      riskAgent.analyzeRisk(
        analytics
      );

    const recommendationAnalysis =
      recommendationAgent.generateRecommendations(
        analytics,
        riskAnalysis
      );

    res.json(
      recommendationAnalysis
    );

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });

  }
};