const { handleChatQuestion } = require("../agents/chatAgent");
const {
  getOrCreateSession,
  appendMessage,
  updateContext
} = require("../services/chatMemory");

exports.askChat = async (req, res) => {
  try {
    const { message, projectKey, sessionId, accountId } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Please provide a valid message."
      });
    }

    getOrCreateSession(sessionId);

    appendMessage(sessionId, "user", message.trim());

    const answer = await handleChatQuestion({
      message,
      projectKey,
      sessionId,
      accountId
    });

    appendMessage(sessionId, "assistant", answer);
    updateContext(sessionId, {
      projectKey,
      lastQuestion: message.trim()
    });

    return res.json({
      answer,
      sessionId
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    return res.status(500).json({
      message: error.message || "Failed to answer chat request."
    });
  }
};
