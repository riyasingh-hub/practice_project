const axios = require("axios");
const crypto = require("crypto");

const {
  setAccessToken,
  setRefreshToken,
  setCloudId
} = require("../config/jiraStore");

exports.login = (req, res) => {

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

    setCloudId(jiraSite.id);

    res.redirect("http://localhost:5173/dashboard");

  } catch (error) {

    res.status(500).json({
      error: error.response?.data || error.message
    });

  }
};