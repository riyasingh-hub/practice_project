
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env") });
dotenv.config({ path: path.resolve(__dirname, "agents", ".env") });
const app = express();

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' http://localhost:3000 http://localhost:5173 ws: wss:"
  );
  next();
});

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
app.use("/api/jira", jiraDataRoutes);

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
  res.status(200).json({});
});

app.get("/", (req, res) => {
  res.send("Jira OAuth Server Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});