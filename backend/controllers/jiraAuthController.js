const axios = require("axios");
const crypto = require("crypto");

const {
  setAccessToken,
  setRefreshToken,
  setCloudId
} = require("../config/jiraStore");

exports.login = (req, res) => {
  console.log("[jiraAuth] starting OAuth login", {
    clientIdPresent: Boolean(process.env.JIRA_CLIENT_ID),
    redirectUriPresent: Boolean(process.env.JIRA_REDIRECT_URI)
  });

  const state = crypto.randomBytes(16).toString("hex");

  const scopes = [
    "read:jira-user",
    "read:jira-work",
    "offline_access"
  ].join(" ");

  const authUrl =
    "https://auth.atlassian.com/authorize?" +
    new URLSearchParams({
      audience: "api.atlassian.com",
      client_id: process.env.JIRA_CLIENT_ID,
      scope: scopes,
      redirect_uri: process.env.JIRA_REDIRECT_URI,
      state,
      response_type: "code",
      prompt: "consent"
    }).toString();

  res.redirect(authUrl);
};

exports.callback = async (req, res) => {
  const { code } = req.query;

  console.log("[jiraAuth] callback received", {
    hasCode: Boolean(code)
  });

  try {
    const tokenResponse = await axios.post(
      "https://auth.atlassian.com/oauth/token",
      {
        grant_type: "authorization_code",
        client_id: process.env.JIRA_CLIENT_ID,
        client_secret: process.env.JIRA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.JIRA_REDIRECT_URI
      }
    );

    console.log("[jiraAuth] token exchange succeeded", {
      accessTokenPresent: Boolean(tokenResponse.data.access_token),
      refreshTokenPresent: Boolean(tokenResponse.data.refresh_token),
      expiresIn: tokenResponse.data.expires_in
    });

    setAccessToken(tokenResponse.data.access_token);
    setRefreshToken(tokenResponse.data.refresh_token);

    const resourcesResponse = await axios.get(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.data.access_token}`
        }
      }
    );

    const jiraSite = resourcesResponse.data[0];

    console.log("[jiraAuth] accessible Jira resources", {
      count: resourcesResponse.data?.length || 0,
      resources: resourcesResponse.data?.map((resource) => ({
        id: resource.id,
        name: resource.name,
        url: resource.url
      }))
    });

    setCloudId(jiraSite.id);

    console.log("[jiraAuth] auth state saved", {
      cloudId: jiraSite.id,
      accessTokenPresent: Boolean(tokenResponse.data.access_token)
    });

    res.redirect("http://localhost:5173/dashboard");

  } catch (error) {
    console.error("[jiraAuth] callback failed", {
      message: error.message,
      response: error.response?.data
    });

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }
};