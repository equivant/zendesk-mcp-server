// Check for potential issues in search.js
import fs from 'fs';
import path from 'path';

// Path to search.js
const searchJsPath = path.resolve('./src/tools/search.js');
const searchContent = fs.readFileSync(searchJsPath, 'utf8');

console.log('Checking search.js for potential issues...');

// Check for trailing commas in arrays or objects
const trailingCommaInArray = /,\s*\]/g.test(searchContent);
console.log('Trailing comma in arrays:', trailingCommaInArray);

const trailingCommaInObject = /,\s*\}/g.test(searchContent);
console.log('Trailing comma in objects:', trailingCommaInObject);

// Check for syntax errors in the searchTools array
const searchToolsMatch = searchContent.match(/export const searchTools = \[([\s\S]*?)\];/);
if (searchToolsMatch) {
  const searchToolsContent = searchToolsMatch[1];
  console.log('searchTools array found');
  
  // Check for trailing commas in the array
  const trailingCommaInSearchTools = /,\s*\]/g.test(searchToolsContent);
  console.log('Trailing comma in searchTools:', trailingCommaInSearchTools);
  
  // Count array items
  const arrayItems = searchToolsContent.split('},').filter(item => item.trim().length > 0);
  console.log('Items in searchTools array:', arrayItems.length);
}

// Check for any syntax errors in the file
try {
  // This will throw if there's a syntax error
  new Function(searchContent);
  console.log('No syntax errors found in search.js');
} catch (error) {
  console.error('Syntax error in search.js:', error.message);
  
  // Try to identify the location of the error
  const lines = searchContent.split('\n');
  const errorMatch = error.message.match(/at line (\d+)/);
  if (errorMatch) {
    const lineNumber = parseInt(errorMatch[1]);
    console.error(`Error context (line ${lineNumber}):`);
    console.error(lines[lineNumber - 2] || '');
    console.error(lines[lineNumber - 1] || '');
    console.error(lines[lineNumber] || '');
  }
}

// Create a fixed version with any trailing commas removed
const fixedContent = searchContent
  .replace(/,(\s*\])/g, '$1')  // Remove trailing commas in arrays
  .replace(/,(\s*\})/g, '$1'); // Remove trailing commas in objects

// Write the fixed version
const fixedPath = path.resolve('./src/tools/search.fixed.js');
fs.writeFileSync(fixedPath, fixedContent);
console.log(`Created fixed version at ${fixedPath}`);