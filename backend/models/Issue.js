const mongoose = require("mongoose");
const Project = require("./Project");

const issueSchema = new mongoose.Schema({
    accountId: String,
    jiraId: String,
    key: String,
    summary: String,
    status: String,
    priority: String,
    assignee: String,
    reporter: String,
    created: Date,
    dueDate: Date,
    projectKey: String,
});

module.exports = mongoose.model("Issue", issueSchema);