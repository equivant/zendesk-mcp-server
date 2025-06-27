// Simple test to check MCP server resources response
import http from 'http';

// Configuration
const MCP_SERVER_HOST = 'localhost';
const MCP_SERVER_PORT = 3000; // Change if your server uses a different port

console.log(`Testing MCP server at ${MCP_SERVER_HOST}:${MCP_SERVER_PORT}`);

// Make a GET request to the /resources endpoint
const req = http.request({
  hostname: MCP_SERVER_HOST,
  port: MCP_SERVER_PORT,
  path: '/resources',
  method: 'GET'
}, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Response status: ${res.statusCode}`);
    
    try {
      const parsedData = JSON.parse(data);
      console.log(`Total tools: ${parsedData.tools ? parsedData.tools.length : 0}`);
      console.log('Raw response:');
      console.log(data);
    } catch (e) {
      console.log('Raw response (not valid JSON):');
      console.log(data);
      console.error(`Error parsing JSON: ${e.message}`);
    }
  });
});

req.on('error', (error) => {
  console.error(`Error making request: ${error.message}`);
});

req.end();