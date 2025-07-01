# Debug Logging for Zendesk MCP Server

This document describes the comprehensive debug logging system added to help diagnose MCP protocol communication issues between Windows and Linux platforms.

## Overview

The debug logging system captures detailed information about:
- MCP protocol communication (JSON-RPC requests/responses)
- Server startup and initialization
- Tool registration and execution
- Stdio communication (raw input/output)
- Platform-specific information
- Zendesk API calls and responses

## Enabling Debug Logging

Debug logging is **disabled by default** for production use. Enable it using either:

### Method 1: Command Line Flag
```bash
node src/index.js --debug
```

### Method 2: Environment Variable
```bash
export DEBUG_MCP=true
node src/index.js
```

### Method 3: Use Provided Scripts
```bash
# Windows
run-with-debug.bat

# Linux/macOS
chmod +x run-with-debug.sh
./run-with-debug.sh
```

## Log Output

When enabled, debug logs are written to:
1. **Console (stderr)** - Real-time debugging
2. **File: `zendesk-mcp-debug.log`** - Persistent log for analysis

## Log Format

```
[TIMESTAMP] [LEVEL] [PID:process_id] MESSAGE
[TIMESTAMP] [LEVEL] [PID:process_id] Data: {JSON_DATA}
```

Example:
```
[2025-07-01 14:45:00.123] [DEBUG] [PID:1234] MCP Server starting on platform: win32
[2025-07-01 14:45:01.200] [DEBUG] [PID:1234] MCP Request: initialize (ID: 1)
[2025-07-01 14:45:01.200] [DEBUG] [PID:1234] Data: {"protocolVersion":"2024-11-05",...}
```

## Log Levels

- **ERROR**: Critical errors and failures
- **WARN**: Warning conditions
- **INFO**: General information about server state
- **DEBUG**: Detailed debugging information

## What Gets Logged

### 1. Server Startup
- Platform detection (Windows/Linux)
- Node.js version
- Command line arguments
- Environment variable status (without exposing secrets)
- Tool registration process (51 tools)

### 2. MCP Protocol Communication
- **Incoming requests**: Full JSON-RPC payload with method, ID, and parameters
- **Outgoing responses**: Response data or error information
- **Initialize handshake**: MCP protocol initialization
- **Tools/list requests**: When client requests available tools
- **Request timing**: Duration of request processing

### 3. Stdio Communication
- Raw stdin data received (before JSON parsing)
- Raw stdout data sent (after JSON serialization)
- JSON parsing success/failure

### 4. Tool Execution
- Tool invocation with parameters
- Execution duration
- Success/failure status

### 5. Zendesk API Calls
- HTTP method and endpoint
- Request parameters (sanitized)
- Response status and timing
- API errors with details

## Example Debug Session

```
[2025-07-01 19:56:04.261] [INFO ] [PID:31000] Debug logging enabled - Platform: win32, PID: 31000, Session: mcky76zo
[2025-07-01 19:56:04.266] [DEBUG] [PID:31000] Creating MCP server instance
[2025-07-01 19:56:04.267] [DEBUG] [PID:31000] Registering 51 tools
[2025-07-01 19:56:04.306] [INFO ] [PID:31000] Successfully registered 51 tools
[2025-07-01 19:56:04.312] [INFO ] [PID:31000] MCP Server initialized, waiting for requests
[2025-07-01 19:56:04.314] [INFO ] [PID:31000] MCP Server connected successfully
[2025-07-01 19:56:05.060] [DEBUG] [PID:31000] MCP Request: initialize (ID: 1)
[2025-07-01 19:56:05.062] [DEBUG] [PID:31000] MCP initialization handshake started
[2025-07-01 19:56:05.069] [DEBUG] [PID:31000] Sending response (ID: 1)
[2025-07-01 19:56:06.076] [DEBUG] [PID:31000] MCP Request: tools/list (ID: 2)
[2025-07-01 19:56:06.077] [DEBUG] [PID:31000] tools/list request received
[2025-07-01 19:56:06.082] [DEBUG] [PID:31000] Sending response (ID: 2)
[2025-07-01 19:56:06.085] [DEBUG] [PID:31000] Returning 51 tools in response
```

## Comparing Windows vs Linux

To diagnose the platform-specific issue:

1. **Run on Windows with debug logging**:
   ```bash
   DEBUG_MCP=true node src/index.js --debug > windows-debug.log 2>&1
   ```

2. **Run on Linux with debug logging**:
   ```bash
   DEBUG_MCP=true node src/index.js --debug > linux-debug.log 2>&1
   ```

3. **Compare the logs** to identify where communication diverges:
   - Look for differences in MCP protocol handshake
   - Check if tools/list requests are received and responded to
   - Verify JSON-RPC message formatting
   - Compare timing and error patterns

## Key Debugging Points

### Successful Communication Should Show:
1. Server startup with platform detection
2. Tool registration (51 tools)
3. MCP server connection
4. Initialize request/response
5. Tools/list request/response with 51 tools

### Common Issues to Look For:
- **Missing initialize request**: Client not connecting
- **Malformed JSON**: Parsing errors in stdio communication
- **Tools/list not received**: MCP protocol communication failure
- **Empty tools response**: Tool registration issues
- **Timing differences**: Performance-related communication problems

## Security Notes

- Credentials are logged as `[SET]` or `[NOT SET]` without exposing actual values
- API request/response data may contain sensitive information - review logs before sharing
- Log files should be treated as confidential and deleted after debugging

## Performance Impact

Debug logging adds minimal overhead:
- File I/O is asynchronous and non-blocking
- JSON serialization only occurs when logging is enabled
- No impact when debug logging is disabled (default)

## Troubleshooting

### Log File Not Created
- Check write permissions in the current directory
- Verify debug logging is enabled (`--debug` flag or `DEBUG_MCP=true`)

### Missing Log Entries
- Ensure you're looking at stderr output (not stdout)
- Check if the process is terminating early due to errors

### Too Much Log Data
- Focus on the first few seconds of startup for initialization issues
- Look for ERROR and WARN level messages first
- Use grep/findstr to filter specific patterns:
  ```bash
  # Linux/macOS
  grep "tools/list" zendesk-mcp-debug.log
  
  # Windows
  findstr "tools/list" zendesk-mcp-debug.log
  ```

## Files Modified

The debug logging system was implemented by modifying:
- `src/debug-logger.js` - Core logging utility (new)
- `src/stdio-debug-wrapper.js` - JSON-RPC message interceptor (new)
- `src/index.js` - Main entry point with debug setup
- `src/server.js` - Server initialization logging
- `src/zendesk-client.js` - API call logging

## Testing

Use `test-debug-logging.js` to verify the debug logging system:
```bash
node test-debug-logging.js
```

This will start the server, send test MCP requests, and display the captured debug output.