// Script to start the MCP server
import { server } from './src/server.js';

// Start the MCP server
const PORT = process.env.PORT || 3000;

console.log(`Starting Zendesk MCP server on port ${PORT}...`);
server.listen(PORT);
console.log(`MCP server is running at http://localhost:${PORT}`);
console.log('Press Ctrl+C to stop the server');