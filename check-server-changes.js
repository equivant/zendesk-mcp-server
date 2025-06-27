// Check for potential issues in server.js that might affect tool registration
import fs from 'fs';
import path from 'path';

// Path to server.js
const serverJsPath = path.resolve('./src/server.js');
const serverContent = fs.readFileSync(serverJsPath, 'utf8');

console.log('Checking server.js for potential issues...');

// Check if setToolRequestHandlers is called
const toolHandlersInitialized = serverContent.includes('server.setToolRequestHandlers()') || 
                               serverContent.includes('this.setToolRequestHandlers()');
console.log('Tool handlers explicitly initialized:', toolHandlersInitialized);

// Check if there's a trailing comma in tool arrays
const hasTrailingComma = /\],\s*\]/g.test(serverContent);
console.log('Has trailing comma in arrays:', hasTrailingComma);

// Check if all tools are properly registered
const toolRegistrationCount = (serverContent.match(/server\.tool\(/g) || []).length;
console.log('Tool registration calls:', toolRegistrationCount);

// Check for syntax errors in the allTools array
const allToolsMatch = serverContent.match(/const allTools = \[([\s\S]*?)\];/);
if (allToolsMatch) {
  const allToolsContent = allToolsMatch[1];
  console.log('allTools array found');
  
  // Check for trailing commas in the array
  const trailingCommaInAllTools = /,\s*\]/g.test(allToolsContent);
  console.log('Trailing comma in allTools:', trailingCommaInAllTools);
  
  // Count array items
  const arrayItems = allToolsContent.split(',').filter(item => item.trim().length > 0);
  console.log('Items in allTools array:', arrayItems.length);
}

// Check for any syntax errors in the file
try {
  // This will throw if there's a syntax error
  new Function(serverContent);
  console.log('No syntax errors found in server.js');
} catch (error) {
  console.error('Syntax error in server.js:', error.message);
}

// Create a minimal fixed version that ensures tool handlers are initialized
const fixedContent = serverContent.replace(
  'export { server };',
  `// Ensure tool handlers are initialized
if (!server._toolHandlersInitialized) {
  server.setToolRequestHandlers();
}

export { server };`
);

// Write the fixed version
const fixedPath = path.resolve('./src/server.fixed.js');
fs.writeFileSync(fixedPath, fixedContent);
console.log(`Created fixed version at ${fixedPath}`);

console.log('\nTo use the fixed version, update index.js to import from "./server.fixed.js" instead of "./server.js"');