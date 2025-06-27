// Create a fixed version of the server that explicitly registers methods
import fs from 'fs';
import path from 'path';

// Paths
const serverJsPath = path.resolve('./src/server.js');
const fixedServerJsPath = path.resolve('./src/server.fixed.js');
const indexJsPath = path.resolve('./src/index.js');
const fixedIndexJsPath = path.resolve('./src/index.fixed.js');

// Create backup of original files
fs.copyFileSync(serverJsPath, `${serverJsPath}.bak`);
fs.copyFileSync(indexJsPath, `${indexJsPath}.bak`);
console.log('Created backups of original files');

// Read the server.js file
const serverContent = fs.readFileSync(serverJsPath, 'utf8');

// Create a fixed version with explicit method registration
const fixedServerContent = serverContent.replace(
  'export { server };',
  `// Explicitly initialize tool handlers
server.setToolRequestHandlers();

// Export the server
export { server };`
);

// Write the fixed server.js
fs.writeFileSync(fixedServerJsPath, fixedServerContent);
console.log(`Created fixed server at ${fixedServerJsPath}`);

// Read the index.js file
const indexContent = fs.readFileSync(indexJsPath, 'utf8');

// Create a fixed version with debug logging
const fixedIndexContent = indexContent.replace(
  'await server.connect(transport);',
  `// Log registered tools before connecting
console.log(\`Registered tools: \${Object.keys(server._registeredTools).length}\`);
console.log(\`Tool handlers initialized: \${server._toolHandlersInitialized}\`);

// Connect to transport
try {
  await server.connect(transport);
  console.log('Server connected to transport successfully');
} catch (error) {
  console.error('Error connecting to transport:', error);
}`
);

// Write the fixed index.js
fs.writeFileSync(fixedIndexJsPath, fixedIndexContent);
console.log(`Created fixed index at ${fixedIndexJsPath}`);

console.log('\nTo test the fixed server, run:');
console.log('node src/index.fixed.js');
console.log('\nIf this works, you can replace the original files with the fixed versions.');