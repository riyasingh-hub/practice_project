const axios = require("axios");

const {
  getAccessToken,
  getCloudId
} = require("../config/jiraStore");

function getAuthContext() {
  const accessToken = getAccessToken();
  const cloudId = getCloudId();

  if (!accessToken) {
    throw new Error(
      "Jira auth missing: access token was not found. Complete the OAuth login flow at /auth/jira first."
    );
  }

  if (!cloudId) {
    throw new Error(
      "Jira auth missing: cloud ID was not found. The Jira OAuth callback may not have completed."
    );
  }

  return { accessToken, cloudId };
}

function getHeaders() {
  const { accessToken } = getAuthContext();

  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json"
  };
}

async function getCurrentUser() {
  const { cloudId } = getAuthContext();

  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
}

async function getProjects() {
  const { cloudId } = getAuthContext();

  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project`,
    {
      headers: getHeaders()
    }
  );

  return response.data || [];
}

async function getProject(projectKey) {
  const { cloudId } = getAuthContext();

  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/project/${projectKey}`,
    {
      headers: getHeaders()
    }
  );

  return response.data;
}

async function getProjectIssues(projectKey) {
  const { cloudId } = getAuthContext();

  const response = await axios.get(
    `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search/jql`,
    {
      headers: getHeaders(),
      params: {
        jql: `project = "${projectKey}"`,
        fields:
          "summary,status,priority,assignee,created,updated,resolutiondate,duedate,reporter,issuetype,labels,sprint,customfield_10020"
      }
    }
  );

  return response.data.issues || [];
}

module.exports = {
  getAuthContext,
  getCurrentUser,
  getProjects,
  getProject,
  getProjectIssues
};