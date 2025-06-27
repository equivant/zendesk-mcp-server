// Test all possible JSON-RPC methods
import { spawn } from 'child_process';
import os from 'os';

// Path to the server script
const serverPath = './src/index.js';
const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Start the MCP server
console.log(`Starting MCP server from: ${serverPath}`);
const server = spawn('node', [serverPath]);

// Methods to try (comprehensive list of possible MCP methods)
const methods = [
  // Standard JSON-RPC methods
  "rpc.discover",
  "system.listMethods",
  
  // MCP methods with different naming conventions
  "mcp.manifest",
  "mcp.list_tools",
  "mcp.listTools",
  "mcp.get_tools",
  "mcp.getTools",
  "mcp.tools",
  
  // Direct tool invocation
  "search_tickets",
  "list_tickets",
  "get_ticket"
];

let currentMethodIndex = 0;

// Wait for server to initialize
setTimeout(tryNextMethod, 1000);

function tryNextMethod() {
  if (currentMethodIndex >= methods.length) {
    console.log("All methods tried, no success");
    server.kill();
    process.exit(1);
    return;
  }

  const method = methods[currentMethodIndex];
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: String(currentMethodIndex + 1),
    method: method
  }) + '\n';

  console.log(`Trying method: ${method}`);
  server.stdin.write(request);
  currentMethodIndex++;
}

// Process server output
server.stdout.on('data', (data) => {
  const chunk = data.toString();
  
  // Skip startup message
  if (chunk.includes("Starting Zendesk API MCP server")) {
    return;
  }
  
  console.log(`Response: ${chunk.trim()}`);
  
  try {
    const response = JSON.parse(chunk);
    
    if (!response.error || response.error.code !== -32601) { // Not "Method not found"
      console.log("Potential success with method:", methods[parseInt(response.id) - 1]);
      console.log("Full response:", JSON.stringify(response, null, 2));
    }
    
    // Try next method after a short delay
    setTimeout(tryNextMethod, 300);
  } catch (e) {
    console.log("Error parsing JSON:", e.message);
    setTimeout(tryNextMethod, 300);
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
}, 15000);