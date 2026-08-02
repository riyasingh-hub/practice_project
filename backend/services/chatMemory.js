const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessionId) {
    return null;
  }

  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      lastProjectKey: null,
      lastContext: null
    });
  }

  return sessions.get(sessionId);
}

function appendMessage(sessionId, role, text) {
  const session = getOrCreateSession(sessionId);

  if (!session) {
    return;
  }

  session.history.push({ role, text });
}

function updateContext(sessionId, context) {
  const session = getOrCreateSession(sessionId);

  if (!session) {
    return;
  }

  session.lastContext = context;

  if (context?.projectKey) {
    session.lastProjectKey = context.projectKey;
  }
}

function getHistory(sessionId) {
  const session = getOrCreateSession(sessionId);
  return session?.history || [];
}

function getLatestContext(sessionId) {
  const session = getOrCreateSession(sessionId);
  return session?.lastContext || null;
}

function getLastProjectKey(sessionId) {
  const session = getOrCreateSession(sessionId);
  return session?.lastProjectKey || null;
}

module.exports = {
  getOrCreateSession,
  appendMessage,
  updateContext,
  getHistory,
  getLatestContext,
  getLastProjectKey
};
