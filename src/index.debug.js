#!/usr/bin/env node
    import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
    import { server } from './server.js';
    import dotenv from 'dotenv';

    // Load environment variables
    dotenv.config();

    console.log('Starting Zendesk API MCP server...');

    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    console.log('Connecting server to transport...');
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
}
