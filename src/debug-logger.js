import fs from 'fs';
import path from 'path';
import os from 'os';

class DebugLogger {
  constructor() {
    this.enabled = process.argv.includes('--debug') || process.env.DEBUG_MCP === 'true';
    this.logFile = 'zendesk-mcp-debug.log';
    this.pid = process.pid;
    this.sessionId = Date.now().toString(36);
    
    if (this.enabled) {
      // Clear log file on startup
      try {
        fs.writeFileSync(this.logFile, '');
      } catch (err) {
        // Ignore file write errors
      }
      this.info(`Debug logging enabled - Platform: ${os.platform()}, PID: ${this.pid}, Session: ${this.sessionId}`);
    }
  }

  _formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString().replace('T', ' ').replace('Z', '');
    const prefix = `[${timestamp}] [${level.padEnd(5)}] [PID:${this.pid}]`;
    let logMessage = `${prefix} ${message}`;
    
    if (data) {
      logMessage += `\n${prefix} Data: ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}`;
    }
    
    return logMessage;
  }

  _writeLog(level, message, data = null) {
    if (!this.enabled) return;
    
    const logMessage = this._formatMessage(level, message, data);
    
    // Write to console
    console.error(logMessage);
    
    // Write to file
    try {
      fs.appendFileSync(this.logFile, logMessage + '\n');
    } catch (err) {
      // Ignore file write errors
    }
  }

  error(message, data = null) {
    this._writeLog('ERROR', message, data);
  }

  warn(message, data = null) {
    this._writeLog('WARN', message, data);
  }

  info(message, data = null) {
    this._writeLog('INFO', message, data);
  }

  debug(message, data = null) {
    this._writeLog('DEBUG', message, data);
  }

  // Special methods for MCP protocol logging
  mcpRequest(method, id, params = null) {
    this.debug(`MCP Request: ${method} (ID: ${id})`, params);
  }

  mcpResponse(id, result = null, error = null) {
    if (error) {
      this.error(`MCP Response Error (ID: ${id})`, error);
    } else {
      this.debug(`MCP Response (ID: ${id})`, result);
    }
  }

  stdinReceived(data) {
    this.debug('STDIN received', data);
  }

  stdoutSending(data) {
    this.debug('STDOUT sending', data);
  }

  toolsListRequest() {
    this.debug('tools/list request received');
  }

  toolsListResponse(toolCount) {
    this.debug(`Returning ${toolCount} tools in response`);
  }
}

export const logger = new DebugLogger();