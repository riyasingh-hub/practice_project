const express = require("express");
const { askChat } = require("../controllers/chatController");

const router = express.Router();

router.post("/", askChat);

module.exports = router;
