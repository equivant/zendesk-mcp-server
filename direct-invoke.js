// Directly invoke a tool from the server's internal tools
import { server } from './src/server.js';
import os from 'os';

const platform = os.platform();
console.log(`Running on platform: ${platform}`);

// Get the first tool name
const toolNames = Object.keys(server._registeredTools);
if (toolNames.length === 0) {
  console.error('No tools found!');
  process.exit(1);
}

// Pick a simple tool to test
const testToolName = 'list_tickets';
console.log(`Testing tool: ${testToolName}`);

// Get the tool
const tool = server._registeredTools[testToolName];
if (!tool) {
  console.error(`Tool ${testToolName} not found!`);
  process.exit(1);
}

console.log('Tool found:', {
  name: testToolName,
  description: tool.description?.substring(0, 50) + '...',
  hasInputSchema: !!tool.inputSchema,
  hasCallback: !!tool.callback
});

// Try to invoke the tool directly
console.log('Attempting to invoke tool directly...');
try {
  const result = await tool.callback({});
  console.log('Tool invocation result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error invoking tool:', error.message);
}

// Check if server is properly initialized
console.log('\nChecking server initialization:');
console.log('- Tool handlers initialized:', server._toolHandlersInitialized);
console.log('- Resource handlers initialized:', server._resourceHandlersInitialized);
console.log('- Prompt handlers initialized:', server._promptHandlersInitialized);
console.log('- Completion handler initialized:', server._completionHandlerInitialized);

// Check if server has a transport
console.log('\nChecking server transport:');
if (server.server) {
  console.log('- Server has inner server:', !!server.server);
  console.log('- Server has transport:', !!server.server._transport);
  if (server.server._transport) {
    console.log('- Transport type:', server.server._transport.constructor.name);
  }
} else {
  console.log('- Server has no inner server');
}

// Print SDK version
console.log('\nMCP SDK version info:');
try {
  const sdkPackage = await import('./node_modules/@modelcontextprotocol/sdk/package.json', { assert: { type: 'json' } });
  console.log('- Version:', sdkPackage.default.version);
} catch (error) {
  console.error('- Error getting SDK version:', error.message);
}