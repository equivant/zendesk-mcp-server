// Test the fixed server
import { spawn } from 'child_process';
import os from 'os';

const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Path to the fixed server script
const serverPath = './src/index.fixed.js';

// Start the MCP server
console.log(`Starting fixed MCP server from: ${serverPath}`);
const server = spawn('node', [serverPath]);

// Methods to try
const methods = [
  "mcp.list_tools",
  "list_tickets"
];

let currentMethodIndex = 0;

// Wait for server to initialize
setTimeout(tryNextMethod, 2000);

function tryNextMethod() {
  if (currentMethodIndex >= methods.length) {
    console.log("All methods tried");
    server.kill();
    process.exit(0);
    return;
  }

  const method = methods[currentMethodIndex];
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: String(currentMethodIndex + 1),
    method: method,
    params: {}
  }) + '\n';

  console.log(`Trying method: ${method}`);
  server.stdin.write(request);
  currentMethodIndex++;
}

// Process server output
server.stdout.on('data', (data) => {
  const chunk = data.toString();
  console.log("Raw output:", chunk);
  
  // Try to parse JSON responses
  if (chunk.includes('{') && chunk.includes('}')) {
    try {
      const jsonStart = chunk.indexOf('{');
      const jsonEnd = chunk.lastIndexOf('}') + 1;
      const jsonStr = chunk.substring(jsonStart, jsonEnd);
      const response = JSON.parse(jsonStr);
      
      console.log("Parsed response:", JSON.stringify(response, null, 2));
      
      // Try next method after a short delay
      setTimeout(tryNextMethod, 1000);
    } catch (e) {
      // Not a complete JSON response, continue collecting
    }
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