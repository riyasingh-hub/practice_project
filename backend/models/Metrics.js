const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema({
    accountId: String,

    totalTickets: Number,

    openTickets: Number,

    completedTickets: Number,

    inProgressTickets: Number,
    inReviewTickets: Number,
 
  completionRate: Number,
  backlogRate: Number,

  highPriorityOpenIssues: Number,

unassignedIssues: Number,

workloadDistribution: {
  type: Object,
  default: {}
},

priorityBreakdown: {
  type: Object,
  default: {}
},

healthScore: Number,

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Metrics", metricsSchema);