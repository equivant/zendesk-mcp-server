// Test MCP server using stdin/stdout communication
import { spawn } from 'child_process';
import os from 'os';

// Path to the server script
const serverPath = './src/index.js';
const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Start the MCP server
console.log(`Starting MCP server from: ${serverPath}`);
const server = spawn('node', [serverPath]);

// Wait for server to initialize
setTimeout(() => {
  // Send manifest request
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "mcp.manifest"
  }) + '\n';

  console.log("Sending request:", request);
  server.stdin.write(request);
}, 1000);

// Process server output
let output = '';
server.stdout.on('data', (data) => {
  const chunk = data.toString();
  console.log("Raw output:", chunk);
  output += chunk;
  
  if (output.includes('\n')) {
    try {
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = output.substring(jsonStart, jsonEnd);
        const response = JSON.parse(jsonStr);
        
        console.log("Tools count:", response.result?.tools?.length || 0);
        
        // Exit after getting response
        setTimeout(() => {
          server.kill();
          process.exit(0);
        }, 500);
      }
    } catch (e) {
      console.log("Error parsing JSON:", e.message);
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
}, 5000);