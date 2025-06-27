// Save MCP server manifest response to a file for comparison
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Get platform info
const platform = os.platform();
const isWSL = platform === 'linux' && os.release().toLowerCase().includes('microsoft');
const platformName = isWSL ? 'wsl' : platform;

// Path to the server script
const serverPath = './src/index.js';
console.log(`Running on: ${platformName}`);

// Output file
const outputFile = `./manifest-${platformName}.json`;
console.log(`Will save response to: ${outputFile}`);

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

  console.log("Sending request...");
  server.stdin.write(request);
}, 1000);

// Process server output
let output = '';
server.stdout.on('data', (data) => {
  output += data.toString();
  
  if (output.includes('\n')) {
    try {
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = output.substring(jsonStart, jsonEnd);
        const response = JSON.parse(jsonStr);
        
        // Save to file
        fs.writeFileSync(outputFile, JSON.stringify(response, null, 2));
        console.log(`Response saved to ${outputFile}`);
        console.log(`Tools count: ${response.result?.tools?.length || 0}`);
        
        // Exit after saving
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