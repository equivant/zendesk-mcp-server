#!/usr/bin/env node

// Test script to verify debug logging functionality
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing debug logging functionality...\n');

// Test 1: Start server with debug logging enabled
console.log('1. Testing server startup with debug logging...');
const serverProcess = spawn('node', ['src/index.js', '--debug'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, DEBUG_MCP: 'true' }
});

let output = '';
let errorOutput = '';

serverProcess.stdout.on('data', (data) => {
  output += data.toString();
});

serverProcess.stderr.on('data', (data) => {
  errorOutput += data.toString();
});

// Send a simple MCP initialize request
setTimeout(() => {
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  
  console.log('2. Sending initialize request...');
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Send tools/list request
  setTimeout(() => {
    const toolsRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    
    console.log('3. Sending tools/list request...');
    serverProcess.stdin.write(JSON.stringify(toolsRequest) + '\n');
    
    // Terminate after a short delay
    setTimeout(() => {
      serverProcess.kill('SIGTERM');
    }, 2000);
  }, 1000);
}, 1000);

serverProcess.on('close', (code) => {
  console.log('\n4. Server process ended with code:', code);
  console.log('\n--- STDOUT ---');
  console.log(output);
  console.log('\n--- STDERR (Debug Logs) ---');
  console.log(errorOutput);
  
  // Check if debug log file was created
  import('fs').then(fs => {
    try {
      const logContent = fs.readFileSync('zendesk-mcp-debug.log', 'utf8');
      console.log('\n--- DEBUG LOG FILE ---');
      console.log(logContent);
    } catch (err) {
      console.log('\nDebug log file not found or could not be read:', err.message);
    }
  });
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server process:', err);
});