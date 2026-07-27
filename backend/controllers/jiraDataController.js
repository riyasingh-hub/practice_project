const axios = require("axios");

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

        // ----------------------------------
        // 1. Get accessible Jira projects
        // ----------------------------------

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

        // ----------------------------------
        // 2. Get project key dynamically
        // ----------------------------------

        const projectKey = projects[0]?.key;

        if (!projectKey) {
            return res.status(404).json({
                message: "No Jira project found"
            });
        }

        // ----------------------------------
        // 3. Get logged-in user
        // ----------------------------------

        const myselfResponse = await axios.get(
            `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json"
                }
            }
        );

        // ----------------------------------
        // 4. Get project details dynamically
        // ----------------------------------

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

        // ----------------------------------
        // 5. Prepare only required data
        // ----------------------------------

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

        // ----------------------------------
        // 6. Return your own API response
        // ----------------------------------

        res.json({
            user: {
                accountId: myselfResponse.data.accountId,
                displayName: myselfResponse.data.displayName,
                email: myselfResponse.data.emailAddress
            },

            project: projectDetails,

            projects: projects.map(p => ({
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

        if (!projectKey) {
            return res.status(400).json({
                message: "Project key is required"
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

        res.status(
            error.response?.status || 500
        ).json({
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

    const openTickets = issues.filter(
      issue =>
        issue.fields.status.name === "To Do"
    );

    const completedTickets = issues.filter(
      issue =>
        issue.fields.status.name === "Done"
    );

    const inProgressTickets = issues.filter(
      issue =>
        issue.fields.status.name === "In Progress"
    );

    res.json({

      metrics: {
        totalTickets: issues.length,
        openTickets: openTickets.length,
        completedTickets: completedTickets.length,
        inProgressTickets: inProgressTickets.length
      },

      issues: issues.map(issue => ({
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

    res.status(500).json({
      error:
        error.response?.data ||
        error.message
    });

  }

};