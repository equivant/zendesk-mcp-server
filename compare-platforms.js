// Script to compare MCP server responses between platforms
import http from 'http';
import os from 'os';

// Configuration
const MCP_SERVER_HOST = 'localhost';
const MCP_SERVER_PORT = 3000; // Change if needed

// Get platform info
const platform = os.platform();
const isWSL = platform === 'linux' && os.release().toLowerCase().includes('microsoft');
console.log(`Running on: ${isWSL ? 'WSL' : platform}`);

// Make request to resources endpoint
http.get(`http://${MCP_SERVER_HOST}:${MCP_SERVER_PORT}/resources`, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const toolCount = response.tools?.length || 0;
      
      console.log(`Platform: ${isWSL ? 'WSL' : platform}`);
      console.log(`Status code: ${res.statusCode}`);
      console.log(`Tools count: ${toolCount}`);
      
      if (toolCount === 0) {
        console.log('No tools found! Full response:');
        console.log(data);
      } else {
        console.log('Tool names:');
        response.tools.forEach(tool => console.log(`- ${tool.name}`));
      }
    } catch (e) {
      console.log('Invalid JSON response:');
      console.log(data);
      console.error(`Error: ${e.message}`);
    }
  });
}).on('error', (err) => {
  console.error(`Request error: ${err.message}`);
});