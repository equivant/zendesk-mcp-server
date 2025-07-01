#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to convert
const filesToConvert = [
  'src/index.js',
  'src/server.js',
  'src/zendesk-client.js',
  'src/tools/tickets.js',
  'src/tools/users.js',
  'src/tools/organizations.js',
  'src/tools/groups.js',
  'src/tools/macros.js',
  'src/tools/views.js',
  'src/tools/triggers.js',
  'src/tools/automations.js',
  'src/tools/search.js',
  'src/tools/help-center.js',
  'src/tools/support.js',
  'src/tools/talk.js',
  'src/tools/chat.js'
];

console.log('Converting Windows line endings (CRLF) to Unix line endings (LF)...');

let convertedCount = 0;

filesToConvert.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const convertedContent = content.replace(/\r\n/g, '\n');
      
      if (content !== convertedContent) {
        fs.writeFileSync(fullPath, convertedContent, 'utf8');
        console.log(`✓ Converted: ${filePath}`);
        convertedCount++;
      } else {
        console.log(`- Already Unix format: ${filePath}`);
      }
    } else {
      console.log(`! File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`✗ Error converting ${filePath}:`, error.message);
  }
});

console.log(`\nConversion complete! ${convertedCount} files converted.`);
console.log('\nNext steps for Linux deployment:');
console.log('1. Run this script: node fix-line-endings.js');
console.log('2. Make the main script executable: chmod +x src/index.js');
console.log('3. Test the server: node src/index.js');