const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    accountId: String,
    jiraId: String,

    key: String,
    summary: String,

    status: String,
    priority: String,
    issueType: String,

    assignee: String,
    reporter: String,

    created: Date,
    updated: Date,
    resolvedAt: Date,

    dueDate: Date,

    sprint: String,
    storyPoints: Number,

    labels: [String],

    projectKey: String
});

module.exports = mongoose.model("Issue", issueSchema);