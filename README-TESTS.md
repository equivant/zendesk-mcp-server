# Zendesk MCP Server Tests

This directory contains test scripts to verify the functionality of the Zendesk MCP server.

## Available Scripts

1. **start-server.js** - Starts the MCP server
2. **test-mcp.js** - Tests the MCP tool handlers directly
3. **test-search.js** - Tests the Zendesk search API functionality
4. **test-tickets.js** - Tests the Zendesk tickets API functionality

## Starting the MCP Server

To start the MCP server:

```bash
node start-server.js
```

This will start the server on port 3000 (or the port specified in the PORT environment variable).

## Running the Tests

Make sure you have the required environment variables set:

```
ZENDESK_SUBDOMAIN=your-subdomain
ZENDESK_EMAIL=your-email
ZENDESK_API_TOKEN=your-api-token
```

Or alternatively:

```
ZENDESK_BASE_URL=https://your-subdomain.zendesk.com
ZENDESK_EMAIL=your-email
ZENDESK_API_TOKEN=your-api-token
```

### To run the MCP tool tests:

```bash
node test-mcp.js
```

This simulates how the AI would call the MCP tools and tests all the search and ticket tools.

### To run the search API tests:

```bash
node test-search.js
```

This tests the Zendesk search API directly with various query formats.

### To run the ticket API tests:

```bash
node test-tickets.js
```

This tests the Zendesk ticket API functionality.

## What to Look For

- Successful API connections
- Proper query formatting
- Expected results being returned
- Proper error handling

If any test fails, check the error messages for details on what went wrong.

## Testing the MCP Server with HTTP Requests

To test the MCP server with actual HTTP requests (simulating how an AI would interact with it):

1. Start the server:
   ```bash
   node start-server.js
   ```

2. Use curl or another HTTP client to send requests to the server:

   ```bash
   # Example: Invoke the search_tickets tool
   curl -X POST http://localhost:3000/v1/tools/search_tickets \
     -H "Content-Type: application/json" \
     -d '{"query": "status:pending"}'
   ```

   ```bash
   # Example: Invoke the get_ticket tool
   curl -X POST http://localhost:3000/v1/tools/get_ticket \
     -H "Content-Type: application/json" \
     -d '{"id": 405421}'
   ```

This allows you to test the full MCP server functionality, including the HTTP interface.

## Troubleshooting

If you encounter issues:

1. Verify your Zendesk credentials are correct
2. Check that your API token has the necessary permissions
3. Look for any rate limiting messages in the errors
4. Ensure your search queries are properly formatted according to Zendesk's API documentation