// Test invoking a tool directly
import { spawn } from 'child_process';

// Path to the server script
const serverPath = './src/index.js';

// Start the MCP server
console.log(`Starting MCP server from: ${serverPath}`);
const server = spawn('node', [serverPath]);

// Wait for server to initialize
setTimeout(() => {
  // Try to invoke a tool directly
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "search_tickets",  // Try to invoke a tool directly
    params: {
      query: "status:open"
    }
  }) + '\n';

  console.log("Sending tool invocation request...");
  server.stdin.write(request);
}, 1000);

// Process server output
server.stdout.on('data', (data) => {
  const chunk = data.toString();
  
  // Skip startup message
  if (chunk.includes("Starting Zendesk API MCP server")) {
    return;
  }
  
  console.log("Raw response:", chunk.trim());
  
  try {
    const response = JSON.parse(chunk);
    console.log("Parsed response:", JSON.stringify(response, null, 2));
    
    // Exit after getting response
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 500);
  } catch (e) {
    console.log("Error parsing JSON:", e.message);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Set timeout
setTimeout(() => {
  console.error('Timeout waiting for response');
  server.kill();
  process.exit(1);
}, 5000);