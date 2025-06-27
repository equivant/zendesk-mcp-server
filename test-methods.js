// Test different MCP methods to find the correct one
import { spawn } from 'child_process';

// Path to the server script
const serverPath = './src/index.js';

// Start the MCP server
console.log(`Starting MCP server from: ${serverPath}`);
const server = spawn('node', [serverPath]);

// Methods to try
const methods = [
  "mcp.manifest",
  "mcp.list_tools",
  "mcp.resources",
  "rpc.discover",
  "system.listMethods"
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
    
    if (response.result) {
      console.log("Success! Method worked:", methods[response.id - 1]);
      console.log("Tools count:", response.result.tools?.length || 0);
      
      // Exit on success
      setTimeout(() => {
        server.kill();
        process.exit(0);
      }, 500);
      return;
    }
    
    // Try next method after a short delay
    setTimeout(tryNextMethod, 500);
  } catch (e) {
    console.log("Error parsing JSON:", e.message);
    setTimeout(tryNextMethod, 500);
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
}, 10000);