// Test script for Zendesk ticket functionality
import { zendeskClient } from './src/zendesk-client.js';

async function testTickets() {
  try {
    console.log('=== ZENDESK TICKETS API TEST ===');
    
    // Test 1: Get a specific ticket
    console.log('\n--- Test 1: Get a specific ticket ---');
    const ticketId = 405421; // Use a known ticket ID
    console.log(`Getting ticket ID: ${ticketId}`);
    try {
      const ticket = await zendeskClient.getTicket(ticketId);
      console.log(`Found ticket: ${ticket.ticket.id} - ${ticket.ticket.subject}`);
      console.log(`Status: ${ticket.ticket.status}`);
    } catch (error) {
      console.error(`Error getting ticket: ${error.message}`);
    }
    
    // Test 2: List tickets
    console.log('\n--- Test 2: List tickets ---');
    try {
      const tickets = await zendeskClient.listTickets({ per_page: 5 });
      console.log(`Retrieved ${tickets.tickets.length} tickets`);
    } catch (error) {
      console.error(`Error listing tickets: ${error.message}`);
    }
    
    console.log('\n=== Ticket tests completed ===');
  } catch (error) {
    console.error(`\nTest failed: ${error.message}`);
  }
}

// Run the tests
testTickets();