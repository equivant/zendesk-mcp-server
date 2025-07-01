#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { server } from './server.js';
import { logger } from './debug-logger.js';
import { stdioDebugWrapper } from './stdio-debug-wrapper.js';
import dotenv from 'dotenv';
import os from 'os';

// Load environment variables
dotenv.config();

logger.info('MCP Server starting', {
  platform: os.platform(),
  nodeVersion: process.version,
  args: process.argv,
  env: {
    ZENDESK_BASE_URL: process.env.ZENDESK_BASE_URL ? '[SET]' : '[NOT SET]',
    ZENDESK_EMAIL: process.env.ZENDESK_EMAIL ? '[SET]' : '[NOT SET]',
    ZENDESK_API_TOKEN: process.env.ZENDESK_API_TOKEN ? '[SET]' : '[NOT SET]',
    DEBUG_MCP: process.env.DEBUG_MCP
  }
});

console.log('Starting Zendesk API MCP server...');

// Setup debug logging for stdio communication
stdioDebugWrapper.setupDebugLogging();

// Create transport
const transport = new StdioServerTransport();

logger.info('MCP Server initialized, waiting for requests');

try {
  await server.connect(transport);
  logger.info('MCP Server connected successfully');
} catch (error) {
  logger.error('Failed to connect MCP server', error);
  process.exit(1);
}

// Handle process termination
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('exit', (code) => {
  logger.info(`Process exiting with code: ${code}`);
});
