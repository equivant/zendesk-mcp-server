// Check if the server is properly connecting to the transport
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Create a modified version of the index.js file with debug logging
const indexJsPath = path.resolve('./src/index.js');
const debugIndexJsPath = path.resolve('./src/index.debug.js');

// Read the original file
const originalContent = fs.readFileSync(indexJsPath, 'utf8');

// Create a debug version with extra logging
const debugContent = originalContent.replace(
  'await server.connect(transport);',
  `console.log('Connecting server to transport...');
try {
  await server.connect(transport);
  console.log('Server connected to transport successfully');
  
  // Debug info
  console.log('Server info:', {
    name: server.server?.info?.name,
    version: server.server?.info?.version
  });
  
  // Log registered methods
  if (server.server && server.server._methods) {
    console.log('Registered methods:', Object.keys(server.server._methods));
  } else {
    console.log('No methods registered');
  }
} catch (error) {
  console.error('Error connecting to transport:', error);
}`
);

// Write the debug version
fs.writeFileSync(debugIndexJsPath, debugContent);
console.log(`Created debug version at ${debugIndexJsPath}`);

// Run the debug version
console.log('Running debug version...');
const serverProcess = spawn('node', [debugIndexJsPath]);

// Process output
serverProcess.stdout.on('data', (data) => {
  console.log(`[stdout] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[stderr] ${data.toString().trim()}`);
});

// Send a test request after server starts
setTimeout(() => {
  console.log('Sending test request...');
  const request = JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "mcp.list_tools"
  }) + '\n';
  
  serverProcess.stdin.write(request);
  
  // Exit after a delay
  setTimeout(() => {
    console.log('Exiting...');
    serverProcess.kill();
    process.exit(0);
  }, 2000);
}, 2000);