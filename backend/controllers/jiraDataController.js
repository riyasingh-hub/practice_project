// const axios = require("axios");
// const {
//   generateProjectSummary
// } = require("../services/aiService");
// const User = require("../models/User");
// const Project = require("../models/Project");
// const Issue = require("../models/Issue");
// const Metrics = require("../models/Metrics");


// const {
//   getAccessToken,
//   getCloudId
// } = require("../config/jiraStore");
 
// exports.getJiraData = async (req, res) => {
//   try {
//     const accessToken = getAccessToken();
//     const cloudId = getCloudId();
 
//     if (!accessToken || !cloudId) {
//       return res.status(401).json({
//         message: "Not authenticated"
//       });
//     }
 
//     // Get logged-in user
//     const myselfResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json"
//         }
//       }
//     );
 
//     const accountId = myselfResponse.data.accountId;
 
//     // Get all projects
//     const projectsResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json"
//         }
//       }
//     );
 
//     const projects = projectsResponse.data || [];
 
//     // Save all projects in MongoDB (scoped to accountId)
//     for (const p of projects) {
//       await Project.findOneAndUpdate(
//         { jiraId: p.id, accountId },
//         {
//           accountId,
//           jiraId: p.id,
//           key: p.key,
//           name: p.name,
//           description: p.description,
//           projectType: p.projectTypeKey,
//           projectLead: p.lead?.displayName || null,
//           isPrivate: p.isPrivate,
//           simplified: p.simplified
//         },
//         {
//           upsert: true,
//           new: true
//         }
//       );
//     }
 
//     const projectKey = projects[0]?.key;
 
//     if (!projectKey) {
//       return res.status(404).json({
//         message: "No Jira project found"
//       });
//     }
 
//     // Save user
//     await User.findOneAndUpdate(
//       {
//         accountId: accountId
//       },
//       {
//         accountId: accountId,
//         displayName: myselfResponse.data.displayName,
//         email: myselfResponse.data.emailAddress
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );
 
//     // Get selected project details
//     const projectResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json"
//         }
//       }
//     );
 
//     const project = projectResponse.data;
 
//     // Save project (scoped to accountId)
//     await Project.findOneAndUpdate(
//       {
//         jiraId: project.id,
//         accountId
//       },
//       {
//         accountId,
//         jiraId: project.id,
//         key: project.key,
//         name: project.name,
//         description: project.description,
//         projectType: project.projectTypeKey,
//         projectLead: project.lead?.displayName || null,
//         isPrivate: project.isPrivate,
//         simplified: project.simplified
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );
 
//     const projectDetails = {
//       id: project.id,
//       key: project.key,
//       name: project.name,
//       description: project.description,
//       projectType: project.projectTypeKey,
//       projectLead: project.lead?.displayName || null,
//       isPrivate: project.isPrivate,
//       simplified: project.simplified
//     };
 
//     // Return projects saved for this accountId (avoid showing other users' projects)
//     const storedProjects = await Project.find({ accountId });
 
//     res.json({
//       user: {
//         accountId: accountId,
//         displayName: myselfResponse.data.displayName,
//         email: myselfResponse.data.emailAddress
//       },
 
//       project: projectDetails,
 
//       projects: storedProjects.map((p) => ({
//         id: p.jiraId,
//         key: p.key,
//         name: p.name
//       }))
//     });
 
//   } catch (error) {
//     console.error(
//       "Jira API Error:",
//       error.response?.data || error.message
//     );
 
//     res.status(500).json({
//       message: "Failed to fetch Jira data"
//     });
//   }
// };
 
// exports.getProjectDetails = async (req, res) => {
//   try {
//     const accessToken = getAccessToken();
//     const cloudId = getCloudId();
 
//     const { projectKey } = req.params;
 
//     if (!accessToken || !cloudId) {
//       return res.status(401).json({
//         message: "Not authenticated"
//       });
//     }
 
//     const response = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json"
//         }
//       }
//     );
 
//     const project = response.data;
 
//     // Save project
//     await Project.findOneAndUpdate(
//       {
//         jiraId: project.id
//       },
//       {
//         jiraId: project.id,
//         key: project.key,
//         name: project.name,
//         description: project.description,
//         projectType: project.projectTypeKey,
//         projectLead: project.lead?.displayName || null,
//         isPrivate: project.isPrivate,
//         simplified: project.simplified
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );
 
//     res.json({
//       id: project.id,
//       key: project.key,
//       name: project.name,
//       description: project.description,
//       projectType: project.projectTypeKey,
//       projectLead: project.lead?.displayName || null,
//       isPrivate: project.isPrivate,
//       simplified: project.simplified
//     });
 
//   } catch (error) {
//     console.error(
//       "Project API Error:",
//       error.response?.data || error.message
//     );
 
//     res.status(error.response?.status || 500).json({
//       message: "Failed to fetch project details"
//     });
//   }
// };
 
// exports.getProjectIntelligence = async (req, res) => {
//   try {
//     const accessToken = getAccessToken();
//     const cloudId = getCloudId();
 
//     const { projectKey } = req.params;
 
//     // Get logged-in user to scope saved issues/metrics
//     const myselfResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           Accept: "application/json"
//         }
//       }
//     );
 
//     const accountId = myselfResponse.data.accountId;
 
//     const allIssues = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`
//         },
//         params: {
//           jql: `project=${projectKey}`,
//           fields:
//             "summary,status,priority,assignee,created,duedate,reporter,sprint,customfield_10020"
//         }
//       }
//     );
 
//     const issues = allIssues.data.issues || [];
 
 
//     // Save Issues (scoped to accountId)
//     for (const issue of issues) {
//       await Issue.findOneAndUpdate(
//         {
//           jiraId: issue.id,
//           accountId
//         },
//         {
//           accountId,
//           jiraId: issue.id,
//           projectKey,
//           key: issue.key,
//           summary: issue.fields.summary,
//           status: issue.fields.status.name,
//           priority: issue.fields.priority?.name,
//           assignee:
//             issue.fields.assignee?.displayName ||
//             "Unassigned",
//           reporter:
//             issue.fields.reporter?.displayName,
//           created: issue.fields.created,
//           dueDate: issue.fields.duedate
//         },
//         {
//           upsert: true,
//           new: true
//         }
//       );
//     }
 
//     const openTickets = issues.filter(
//       (issue) => issue.fields.status.name === "To Do"
//     );
 
//     const completedTickets = issues.filter(
//       (issue) => issue.fields.status.name === "Done"
//     );
 
//     const inProgressTickets = issues.filter(
//       (issue) => issue.fields.status.name === "In Progress"
//     );
 
//     const inReviewTickets = issues.filter(
//       (issue) => issue.fields.status.name === "In Review"
//     );
 
//     const metricsData = {
//   totalTickets: issues.length,
//   openTickets: openTickets.length,
//   completedTickets: completedTickets.length,
//   inProgressTickets: inProgressTickets.length,
//   inReviewTickets: inReviewTickets.length
// };
 
// const prompt = `
// Analyze this Jira project.
 
// Metrics:
// ${JSON.stringify(metricsData, null, 2)}
 
// Issues:
// ${JSON.stringify(
//   issues.slice(0, 20).map(issue => ({
//     key: issue.key,
//     summary: issue.fields.summary,
//     status: issue.fields.status.name,
//     priority: issue.fields.priority?.name
//   })),
//   null,
//   2
// )}
 
// Provide:
// 1. Executive Summary
// 2. Project Health Score out of 100
// 3. Risks
// 4. Recommendations
// `;
 
// const aiResponse = await generateProjectSummary(prompt);
 
// console.log("AI RESPONSE:", aiResponse);//For display
 
//     // Save Metrics (scoped to accountId)
//     await Metrics.findOneAndUpdate(
//       { accountId },
//       {
//         accountId,
//         totalTickets: issues.length,
//         openTickets: openTickets.length,
//         completedTickets: completedTickets.length,
//         inProgressTickets: inProgressTickets.length,
//         inReviewTickets: inReviewTickets.length,
//         updatedAt: new Date()
//       },
//       {
//         upsert: true,
//         new: true
//       }
//     );
 
//     res.json({
//       metrics: {
//         totalTickets: issues.length,
//         openTickets: openTickets.length,
//         completedTickets: completedTickets.length,
//         inProgressTickets: inProgressTickets.length,
//         inReviewTickets: inReviewTickets.length,
 
//       },
 
//       aiSummary: aiResponse,
 
//       issues: issues.map((issue) => ({
//         id: issue.id,
//         key: issue.key,
//         summary: issue.fields.summary,
//         status: issue.fields.status.name,
//         priority: issue.fields.priority?.name,
//         assignee:
//           issue.fields.assignee?.displayName ||
//           "Unassigned",
//         reporter:
//           issue.fields.reporter?.displayName,
//         created: issue.fields.created,
//         dueDate: issue.fields.duedate,
//         fields: issue.fields
//       }))
//     });
 
//   } catch (error) {
//     console.error(
//       "Project Intelligence Error:",
//       error.response?.data || error.message
//     );
 
//     res.status(500).json({
//       error:
//         error.response?.data ||
//         error.message
//     });
//   }
// };
 
// /*
// |--------------------------------------------------------------------------
// | MongoDB Data APIs
// |--------------------------------------------------------------------------
// */
 
// // Get all issues
// exports.getStoredIssues = async (req, res) => {
//   try {
//     const accountId = req.query.accountId;
 
//     const filter = accountId ? { accountId } : {};
 
//     const issues = await Issue.find(filter);
 
//     res.json(issues);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
 
// // Get all projects
// exports.getStoredProjects = async (req, res) => {
//   try {
//     const accountId = req.query.accountId;
 
//     const filter = accountId ? { accountId } : {};
 
//     const projects = await Project.find(filter);
 
//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
 
// // Get latest metrics
// exports.getStoredMetrics = async (req, res) => {
//   try {
//     const accountId = req.query.accountId;
 
//     const filter = accountId ? { accountId } : {};
 
//     const metrics = await Metrics.findOne(filter).sort({
//       updatedAt: -1
//     });
 
//     res.json(metrics);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
 
// // Get users
// exports.getStoredUsers = async (req, res) => {
//   try {
//     const users = await User.find();
 
//     res.json(users);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
 
// exports.getAISummary = async (req, res) => {
//   try {
//     const projects = await Project.find();
 
//     const issues = await Issue.find();
 
//     const metrics = await Metrics.findOne().sort({
//       updatedAt: -1
//     });
 
//     const prompt = `
// You are a Senior PMO and Portfolio Management Analyst.
 
// Analyze the Jira portfolio data and provide an executive-level assessment.
 
// Projects:
// ${JSON.stringify(projects, null, 2)}
 
// Metrics:
// ${JSON.stringify(metrics, null, 2)}
 
// Issues:
// ${JSON.stringify(
//   issues.map(issue => ({
//     project: issue.projectKey,
//     key: issue.key,
//     summary: issue.summary,
//     status: issue.status,
//     priority: issue.priority,
//     assignee: issue.assignee
//   })),
//   null,
//   2
// )}
 
// Instructions:
 
// 1. Evaluate overall portfolio performance.
 
// 2. Determine the most delayed project based on:
//    - Open tickets
//    - Pending work
//    - In Progress items
//    - Unresolved issues
 
// 3. Determine the highest risk project based on:
//    - High priority issues
//    - Open defects
//    - Unassigned work
//    - Large backlog
 
// 4. Determine the best performing project based on:
//    - Highest completion rate
//    - Lowest risk
//    - Lowest backlog
 
// 5. Provide key insights and recommendations.
 
// Return ONLY valid JSON.
 
// {
//   "overallHealth": {
//     "score": 0,
//     "status": "",
//     "summary": ""
//   },
//   "mostDelayedProject": {
//     "name": "",
//     "reason": "",
//     "impact": ""
//   },
//   "highestRiskProject": {
//     "name": "",
//     "riskLevel": "",
//     "reason": ""
//   },
//   "bestPerformingProject": {
//     "name": "",
//     "reason": ""
//   },
//   "keyInsights": [
//     ""
//   ],
//   "recommendations": [
//     ""
//   ]
// }
// `;
 
//     const aiSummary = await generateProjectSummary(prompt);
 
//     let parsedResponse;
 
//     try {
//       parsedResponse = JSON.parse(aiSummary);
//     } catch (e) {
//       parsedResponse = {
//         rawResponse: aiSummary
//       };
//     }
 
//     res.json(parsedResponse);
 
//   } catch (error) {
//     console.error("AI Summary Error:", error);
 
//     res.status(500).json({
//       message: error.message
//     });
//   }
// };
 

const axios = require("axios");
const {
  generateProjectSummary
} = require("../services/aiService");
const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const Metrics = require("../models/Metrics");

const {
  calculateMetrics
} = require("../services/metricsService");

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
 
    const accountId = myselfResponse.data.accountId;
 
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
 
    const projects = projectsResponse.data || [];
 
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
      user: {
        accountId: accountId,
        displayName: myselfResponse.data.displayName,
        email: myselfResponse.data.emailAddress
      },
 
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
 
    // Get logged-in user to scope saved issues/metrics
    const myselfResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );
 
    const accountId = myselfResponse.data.accountId;
 
    const allIssues = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        params: {
          jql: `project = "${projectKey}"`,
          fields:
            "summary,status,priority,assignee,created,duedate,reporter,sprint,customfield_10020"
        }
      }
    );
 
    const issues = allIssues.data.issues || [];
 
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
          dueDate: fields.duedate
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
 
const prompt = `
Analyze this Jira project.
 
Metrics:
${JSON.stringify(metricsData, null, 2)}
 
Issues:
${JSON.stringify(
  issues.slice(0, 20).map(issue => {
    const fields = issue.fields || {};
    return {
      project: issue.projectKey,
      key: issue.key,
      summary: fields.summary || "",
      status: fields.status?.name || "Unknown",
      priority: fields.priority?.name || fields.priority || "",
      assignee: fields.assignee?.displayName || "Unassigned"
    };
  }),
  null,
  2
)}
 
Provide:
1. Executive Summary
2. Project Health Score out of 100
3. Risks
4. Recommendations
`;
 
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
    const accessToken = getAccessToken();
    const cloudId = getCloudId();
 
    if (!accessToken || !cloudId) {
      return res.status(401).json({
        message: "Not authenticated with Jira. Please login through /auth/jira first."
      });
    }
 
    const myselfResponse = await axios.get(
      `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );
 
const accountId = myselfResponse.data.accountId;
 
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
 
    const prompt = `
You are a Senior PMO and Portfolio Management Analyst.
 
Analyze the Jira portfolio data and provide an executive-level assessment.
 
Projects:
${JSON.stringify(projects, null, 2)}
 
Metrics:
${JSON.stringify(metrics, null, 2)}
 
Issues:
${JSON.stringify(
  issues.map(issue => ({
    project: issue.projectKey,
    key: issue.key,
    summary: issue.summary,
    status: issue.status,
    priority: issue.priority,
    assignee: issue.assignee
  })),
  null,
  2
)}
 
Instructions:
 
1. Evaluate overall portfolio performance.
 
2. Determine the most delayed project based on:
   - Open tickets
   - Pending work
   - In Progress items
   - Unresolved issues
 
3. Determine the highest risk project based on:
   - High priority issues
   - Open defects
   - Unassigned work
   - Large backlog
 
4. Determine the best performing project based on:
   - Highest completion rate
   - Lowest risk
   - Lowest backlog
 
5. Provide key insights and recommendations.
 
Return ONLY valid JSON.
 
{
  "overallHealth": {
    "score": 0,
    "status": "",
    "summary": ""
  },
  "mostDelayedProject": {
    "name": "",
    "reason": "",
    "impact": ""
  },
  "highestRiskProject": {
    "name": "",
    "riskLevel": "",
    "reason": ""
  },
  "bestPerformingProject": {
    "name": "",
    "reason": ""
  },
  "keyInsights": [
    ""
  ],
  "recommendations": [
    ""
  ]
}
`;
 
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
    const accessToken = getAccessToken();
    const cloudId = getCloudId();
 
    const { projectKey } = req.params;
 
    const myselfResponse =
      await axios.get(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
 
    const accountId =
      myselfResponse.data.accountId;
 
    const jiraResponse =
      await axios.get(
        `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          },
          params: {
            jql: `project = "${projectKey}"`,
            fields:
              "summary,status,priority,assignee,created,duedate,reporter"
          }
        }
      );
 
    const issues =
      jiraResponse.data.issues || [];
 
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
          dueDate:
            fields.duedate
        },
        {
          upsert: true
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
 
 