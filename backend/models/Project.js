const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    accountId: String,
    jiraId: String,
    key: String,
    name: String,
    description: String,
    projectType: String,
    projectLead: String,
    isPrivate: Boolean,
    simplified: Boolean
});

module.exports = mongoose.model("Project", projectSchema);