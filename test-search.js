// Test script for Zendesk search functionality
import { zendeskClient } from './src/zendesk-client.js';

// Helper function to format results
function formatResults(results) {
  if (!results || !results.results || results.results.length === 0) {
    return 'No results found';
  }
  
  return `Found ${results.count} results. First few results:\n` + 
    results.results.slice(0, 3).map(r => 
      `- ${r.id}: ${r.subject || r.name || r.title || JSON.stringify(r).substring(0, 50)}`
    ).join('\n');
}

async function testSearch() {
  try {
    console.log('=== ZENDESK SEARCH API TEST ===');
    console.log('Testing direct API calls to verify connectivity and search functionality\n');
    
    // Test 1: Basic ticket search
    console.log('\n--- Test 1: Basic ticket search ---');
    const basicQuery = 'type:ticket';
    console.log(`Query: "${basicQuery}"`);
    const basicResult = await zendeskClient.search(basicQuery);
    console.log(formatResults(basicResult));
    
    // Test 2: Search with specific terms
    console.log('\n--- Test 2: Search with specific terms ---');
    const specificQuery = 'type:ticket error';
    console.log(`Query: "${specificQuery}"`);
    const specificResult = await zendeskClient.search(specificQuery);
    console.log(formatResults(specificResult));
    
    // Test 3: Search with status filter
    console.log('\n--- Test 3: Search with status filter ---');
    const statusQuery = 'type:ticket status:pending';
    console.log(`Query: "${statusQuery}"`);
    const statusResult = await zendeskClient.search(statusQuery);
    console.log(formatResults(statusResult));
    
    // Test 4: Search with date filter
    console.log('\n--- Test 4: Search with date filter ---');
    const dateQuery = 'type:ticket created>2025-01-01';
    console.log(`Query: "${dateQuery}"`);
    const dateResult = await zendeskClient.search(dateQuery);
    console.log(formatResults(dateResult));
    
    // Test 5: Search for users
    console.log('\n--- Test 5: Search for users ---');
    const userQuery = 'type:user';
    console.log(`Query: "${userQuery}"`);
    const userResult = await zendeskClient.search(userQuery);
    console.log(formatResults(userResult));
    
    // Test 6: Search for organizations
    console.log('\n--- Test 6: Search for organizations ---');
    const orgQuery = 'type:organization';
    console.log(`Query: "${orgQuery}"`);
    const orgResult = await zendeskClient.search(orgQuery);
    console.log(formatResults(orgResult));
    
    console.log('\n=== Search tests completed ===');
  } catch (error) {
    console.error(`\nTest failed: ${error.message}`);
    console.error(error.stack);
  }
}

// Run the tests
testSearch();