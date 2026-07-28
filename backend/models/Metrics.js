const mongoose = require("mongoose");

const metricsSchema = new mongoose.Schema({

    totalTickets: Number,

    openTickets: Number,

    completedTickets: Number,

    inProgressTickets: Number,

    updatedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Metrics", metricsSchema);