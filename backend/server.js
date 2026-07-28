// const express = require("express");
// const axios = require("axios");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const crypto = require("crypto");

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// const PORT = process.env.PORT || 3000;

// // Temporary storage for testing only
// let accessToken = null;
// let refreshToken = null;
// let cloudId = null;

// // --------------------------------------------------
// // 1. HOME
// // --------------------------------------------------

// app.get("/", (req, res) => {
//     res.send(`
//         <h1>Jira OAuth Test</h1>

//         <a href="/auth/jira">
//             <button style="
//                 padding: 12px 20px;
//                 font-size: 16px;
//                 cursor: pointer;
//             ">
//                 Login with Jira
//             </button>
//         </a>
//     `);
// });

// // --------------------------------------------------
// // 2. LOGIN WITH JIRA
// // --------------------------------------------------

// app.get("/auth/jira", (req, res) => {

//     const state = crypto.randomBytes(16).toString("hex");

//     const scopes = [
//         "read:jira-user",
//         "read:jira-work",
//         "offline_access"
//     ].join(" ");

//     const authUrl =
//         "https://auth.atlassian.com/authorize?" +
//         new URLSearchParams({
//             audience: "api.atlassian.com",
//             client_id: process.env.JIRA_CLIENT_ID,
//             scope: scopes,
//             redirect_uri: process.env.JIRA_REDIRECT_URI,
//             state: state,
//             response_type: "code",
//             prompt: "consent"
//         }).toString();

//     console.log('AUTH URL:', authUrl)
//     console.log("Redirecting to Jira...");

//     res.redirect(authUrl);
// });

// app.get("/api/jira-data", async (req, res) => {
//   try {
//     if (!accessToken || !cloudId) {
//       return res.status(401).json({
//         message: "Not authenticated"
//       });
//     }

//     const resourcesResponse = await axios.get(
//       "https://api.atlassian.com/oauth/token/accessible-resources",
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`
//         }
//       }
//     );

//     const jiraSite = resourcesResponse.data[0];

//     const myselfResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`
//         }
//       }
//     );

//     const projectsResponse = await axios.get(
//       `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/2/project`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`
//         }
//       }
//     );

//     res.json({
//       user: myselfResponse.data,
//       projects: projectsResponse.data,
//       jiraSite,
//       cloudId
//     });

//   } catch (error) {
//     res.status(500).json({
//       error: error.response?.data || error.message
//     });
//   }
// });


// // --------------------------------------------------
// // 3. CALLBACK FROM JIRA
// // --------------------------------------------------

// app.get("/callback", async (req, res) => {
//     console.log("callbackhit")
//     console.log(req.query)
//     const { code, error, error_description } = req.query;

//     if (error) {
//         return res.status(400).json({
//             error,
//             error_description
//         });
//     }

//     if (!code) {
//         return res.status(400).json({
//             error: "No authorization code received"
//         });
//     }

//     try {

//         // --------------------------------------------------
//         // 4. EXCHANGE AUTHORIZATION CODE FOR ACCESS TOKEN
//         // --------------------------------------------------

//         const tokenResponse = await axios.post(
//             "https://auth.atlassian.com/oauth/token",
//             {
//                 grant_type: "authorization_code",
//                 client_id: process.env.JIRA_CLIENT_ID,
//                 client_secret: process.env.JIRA_CLIENT_SECRET,
//                 code: code,
//                 redirect_uri: process.env.JIRA_REDIRECT_URI
//             },
//             {
//                 headers: {
//                     "Content-Type": "application/json"
//                 }
//             }
//         );

//         accessToken = tokenResponse.data.access_token;
//         refreshToken = tokenResponse.data.refresh_token;

//         console.log("Access token received!");

//         // --------------------------------------------------
//         // 5. GET ACCESSIBLE JIRA SITES
//         // --------------------------------------------------

//         const resourcesResponse = await axios.get(
//             "https://api.atlassian.com/oauth/token/accessible-resources",
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     Accept: "application/json"
//                 }
//             }
//         );

//         console.log(
//             "Accessible Jira resources:",
//             resourcesResponse.data
//         );

//         if (resourcesResponse.data.length === 0) {
//             return res.status(403).send(`
//                 <h2>No Jira site is accessible.</h2>
//                 <p>Check your Jira OAuth permissions and authorization.</p>
//             `);
//         }

//         // For testing, use first accessible Jira site
//         const jiraSite = resourcesResponse.data[0];

//         cloudId = jiraSite.id;

//         console.log("Cloud ID:", cloudId);
//         console.log("Jira Site:", jiraSite.url);

//         // --------------------------------------------------
//         // 6. GET CURRENT LOGGED-IN USER
//         // --------------------------------------------------

//         const myselfResponse = await axios.get(
//             `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/myself`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     Accept: "application/json"
//                 }
//             }
//         );

//         const user = myselfResponse.data;

//         console.log("Logged in Jira user:");
//         console.log(user);

//         // --------------------------------------------------
//         // 7. GET PROJECTS
//         // --------------------------------------------------

//         const projectsResponse = await axios.get(
//             `https://api.atlassian.com/ex/jira/${cloudId}/rest/api/2/project`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${accessToken}`,
//                     Accept: "application/json"
//                 }
//             }
//         );

//         const projects = projectsResponse.data;

//         console.log("Projects:");
//         console.log(projects);

//         // --------------------------------------------------
//         // 8. SHOW RESULT
//         // --------------------------------------------------

//        res.redirect("http://localhost:5173/dashboard");

//     } catch (error) {

//         console.error(
//             "Jira OAuth error:",
//             error.response?.data || error.message
//         );

//         res.status(500).json({
//             message: "Jira OAuth/API request failed",
//             error: error.response?.data || error.message
//         });
//     }
// });

// // --------------------------------------------------
// // 9. START SERVER
// // --------------------------------------------------

// app.listen(PORT, () => {

//     console.log(`
// =========================================
// Jira OAuth Test Server
// =========================================

// Server running at:
// http://localhost:${PORT}

// Open this in your browser.

// =========================================
// `);
// });




const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const jiraAuthRoutes = require("./routes/jiraAuthRoutes");
const jiraDataRoutes = require("./routes/jiraDataRoutes");
const { callback } = require("./controllers/jiraAuthController");

const connectDB = require("./config/db");

connectDB();

app.get("/callback", callback);
app.use("/auth", jiraAuthRoutes);

app.use("/api/jira-data", jiraDataRoutes);

app.get("/", (req, res) => {
  res.send("Jira OAuth Server Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});