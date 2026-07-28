const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
    jiraId: String,
    key: String,
    summary: String,
    status: String,
    priority: String,
    assignee: String,
    reporter: String,
    created: Date,
    dueDate: Date
});

module.exports = mongoose.model("Issue", issueSchema);