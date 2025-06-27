// Check if the server is properly initializing the tool handlers
import { server } from './src/server.js';

console.log('Checking server initialization...');

// Check if tool handlers are initialized
console.log('Tool handlers initialized:', server._toolHandlersInitialized);

// Try to initialize tool handlers
console.log('Initializing tool handlers...');
server.setToolRequestHandlers();

// Check again
console.log('Tool handlers initialized after explicit call:', server._toolHandlersInitialized);

// Check if methods are registered
if (server.server && server.server._methods) {
  console.log('Methods registered:', Object.keys(server.server._methods));
} else {
  console.log('No methods registered or server.server._methods is not accessible');
}

// Check if tools are registered
const toolCount = Object.keys(server._registeredTools).length;
console.log(`Registered tools: ${toolCount}`);

// List the first few tools
const toolNames = Object.keys(server._registeredTools).slice(0, 5);
console.log('Sample tools:', toolNames);

// Check if server has a transport
console.log('Server has transport:', !!server.server?._transport);

// Try to connect to a transport
console.log('Trying to connect to a transport...');
try {
  const StdioServerTransport = (await import('@modelcontextprotocol/sdk/server/stdio.js')).StdioServerTransport;
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Connected to transport successfully');
  
  // Check if methods are registered after connecting
  if (server.server && server.server._methods) {
    console.log('Methods registered after connecting:', Object.keys(server.server._methods));
  } else {
    console.log('No methods registered after connecting');
  }
} catch (error) {
  console.error('Error connecting to transport:', error.message);
}