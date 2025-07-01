import { logger } from './debug-logger.js';

export class StdioDebugWrapper {
  constructor() {
    this.messageBuffer = '';
  }

  setupDebugLogging() {
    if (!logger.enabled) return;

    // Hook into stdin to capture incoming JSON-RPC messages
    const originalStdinOn = process.stdin.on.bind(process.stdin);
    process.stdin.on = (event, listener) => {
      if (event === 'data') {
        const wrappedListener = (chunk) => {
          this.messageBuffer += chunk.toString();
          
          // Try to parse complete JSON messages
          const lines = this.messageBuffer.split('\n');
          this.messageBuffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          lines.forEach(line => {
            if (line.trim()) {
              try {
                const message = JSON.parse(line.trim());
                this.logIncomingMessage(message);
              } catch (e) {
                logger.debug('Raw STDIN data (non-JSON)', line.trim());
              }
            }
          });
          
          return listener(chunk);
        };
        return originalStdinOn(event, wrappedListener);
      }
      return originalStdinOn(event, listener);
    };

    // Hook into stdout to capture outgoing JSON-RPC messages
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk, ...args) => {
      if (typeof chunk === 'string' && chunk.trim()) {
        try {
          const message = JSON.parse(chunk.trim());
          this.logOutgoingMessage(message);
        } catch (e) {
          // Not JSON, might be regular console output
          if (chunk.trim().startsWith('{')) {
            logger.debug('Raw STDOUT data (malformed JSON)', chunk.trim());
          }
        }
      }
      return originalStdoutWrite(chunk, ...args);
    };
  }

  logIncomingMessage(message) {
    const { jsonrpc, id, method, params, result, error } = message;
    
    if (method) {
      // This is a request
      logger.mcpRequest(method, id, params);
      
      if (method === 'tools/list') {
        logger.toolsListRequest();
      } else if (method === 'initialize') {
        logger.debug('MCP initialization handshake started');
      }
    } else if (result !== undefined || error !== undefined) {
      // This is a response
      logger.mcpResponse(id, result, error);
    }
  }

  logOutgoingMessage(message) {
    const { jsonrpc, id, method, params, result, error } = message;
    
    if (method) {
      // Outgoing request (shouldn't happen in server mode)
      logger.debug(`Outgoing request: ${method}`, { id, params });
    } else if (result !== undefined || error !== undefined) {
      // Outgoing response
      if (error) {
        logger.error(`Sending error response (ID: ${id})`, error);
      } else {
        logger.debug(`Sending response (ID: ${id})`);
        
        // Special handling for tools/list response
        if (result && result.tools) {
          logger.toolsListResponse(result.tools.length);
        }
      }
    }
  }
}

export const stdioDebugWrapper = new StdioDebugWrapper();