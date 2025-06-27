// Test harness for Zendesk MCP server
import { searchTools } from './src/tools/search.js';
import { ticketsTools } from './src/tools/tickets.js';

// Simple function to simulate MCP tool invocation
async function invokeTool(toolName, params) {
  console.log(`\n=== Testing tool: ${toolName} ===`);
  console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);
  
  // Find the tool by name
  const allTools = [...searchTools, ...ticketsTools];
  const tool = allTools.find(t => t.name === toolName);
  
  if (!tool) {
    console.error(`Tool not found: ${toolName}`);
    return;
  }
  
  try {
    console.log(`Invoking ${toolName}...`);
    const result = await tool.handler(params);
    console.log(`Result: ${JSON.stringify(result, null, 2)}`);
    return result;
  } catch (error) {
    console.error(`Error invoking ${toolName}: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  try {
    console.log('Starting MCP tool tests...');
    
    // Test 1: Get a specific ticket
    await invokeTool('get_ticket', { id: 405421 });
    
    // Test 2: Basic ticket search
    await invokeTool('search_tickets', { query: 'status:pending' });
    
    // Test 3: Search with specific terms
    await invokeTool('search_tickets', { query: 'error' });
    
    // Test 4: Search with date filter
    await invokeTool('search_tickets', { query: 'created>2025-01-01' });
    
    // Test 5: Search with structured filters
    await invokeTool('search_tickets_by_filter', { 
      status: 'pending',
      created_after: '2025-01-01'
    });
    
    // Test 6: General search
    await invokeTool('search', { query: 'type:user' });
    
    console.log('\nAll tests completed');
  } catch (error) {
    console.error(`Test suite error: ${error.message}`);
  }
}

// Run the tests
runTests();