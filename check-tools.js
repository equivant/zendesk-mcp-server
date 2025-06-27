// Check if tools are properly exported
import { server } from './src/server.js';

// Print server info
console.log('Server info:', {
  name: server.server?.info?.name,
  version: server.server?.info?.version,
  description: server.server?.info?.description
});

// Check for registered tools
console.log('Checking for registered tools...');

// Try to access internal properties (may not work depending on implementation)
try {
  // @ts-ignore - Accessing private property for debugging
  const tools = server._registeredTools;
  if (tools) {
    console.log(`Found ${Object.keys(tools).length} registered tools:`);
    Object.keys(tools).forEach(toolName => {
      console.log(`- ${toolName}`);
    });
  } else {
    console.log('No tools found or unable to access _registeredTools property');
  }
} catch (err) {
  console.log('Error accessing tools:', err.message);
}

// Check if server has methods
console.log('\nChecking server methods:');
const serverMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(server));
console.log('Server methods:', serverMethods.join(', '));

// Check if server.server has methods
console.log('\nChecking server.server methods:');
if (server.server) {
  const innerServerMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(server.server));
  console.log('Inner server methods:', innerServerMethods.join(', '));
} else {
  console.log('server.server is not defined');
}

// Print available exports from server module
console.log('\nAvailable exports from server module:');
Object.keys(server).forEach(key => {
  console.log(`- ${key}: ${typeof server[key]}`);
});