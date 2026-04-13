/**
 * ChatLogger — append-only JSONL logs for chat conversations.
 *
 * Stores chat messages in workspace/ADWs/logs/chat/{agentName}_{sessionId}.jsonl
 * Each line is a JSON object: { role, text?, blocks?, files?, ts }
 *
 * This is the durable source of truth for chat history.
 * sessions.json is a fast-access cache; JSONL survives restarts and cleanups.
 */

const fs = require('fs');
const path = require('path');

class ChatLogger {
  constructor(workspaceRoot) {
    this.logsDir = path.join(workspaceRoot || process.cwd(), 'workspace', 'ADWs', 'logs', 'chat');
    this._ensureDir();
  }

  _ensureDir() {
    try {
      fs.mkdirSync(this.logsDir, { recursive: true });
    } catch {}
  }

  _logPath(agentName, sessionId) {
    const safe = (agentName || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
    const shortId = sessionId.slice(0, 8);
    return path.join(this.logsDir, `${safe}_${shortId}.jsonl`);
  }

  /**
   * Append a message to the chat log.
   */
  append(agentName, sessionId, message) {
    try {
      const logPath = this._logPath(agentName, sessionId);
      const line = JSON.stringify(message) + '\n';
      fs.appendFileSync(logPath, line, 'utf8');
    } catch (err) {
      console.error(`[chat-logger] Failed to append: ${err.message}`);
    }
  }

  /**
   * Read full chat history from JSONL log.
   * Returns array of messages, or empty array if not found.
   */
  read(agentName, sessionId) {
    try {
      const logPath = this._logPath(agentName, sessionId);
      if (!fs.existsSync(logPath)) return [];

      const content = fs.readFileSync(logPath, 'utf8').trim();
      if (!content) return [];

      const messages = [];
      for (const line of content.split('\n')) {
        if (!line.trim()) continue;
        try {
          messages.push(JSON.parse(line));
        } catch {
          // Skip malformed lines
        }
      }
      return messages;
    } catch (err) {
      console.error(`[chat-logger] Failed to read: ${err.message}`);
      return [];
    }
  }

  /**
   * Check if a log exists for a session.
   */
  exists(agentName, sessionId) {
    return fs.existsSync(this._logPath(agentName, sessionId));
  }
}

module.exports = ChatLogger;
