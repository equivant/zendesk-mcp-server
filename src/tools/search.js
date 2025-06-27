import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

export const searchTools = [
  {
    name: "search",
    description: "Search across all Zendesk data types (tickets, users, organizations, etc.) using Zendesk Search API syntax. For ticket-specific searches, use search_tickets instead. Use specific operators like 'type:', 'status:', 'priority:', 'created>', etc.",
    schema: {
      query: z.string().describe("Search query string using Zendesk Search API syntax. Examples: 'type:user email:example.com', 'type:organization name:acme', 'type:ticket status:open'"),
      sort_by: z.string().optional().describe("Field to sort by (e.g., 'created_at', 'updated_at')"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
      page: z.number().optional().describe("Page number for pagination"),
      per_page: z.number().optional().describe("Number of results per page (max 100)")
    },
    handler: async ({ query, sort_by, sort_order, page, per_page }) => {
      try {
        const params = { sort_by, sort_order, page, per_page };
        const result = await zendeskClient.search(query, params);
        
        // Check if we have results
        if (result && result.results && result.results.length > 0) {
          return {
            content: [{ 
              type: "text", 
              text: `Found ${result.count} results. First result type: ${result.results[0].type || 'unknown'}\n\n${JSON.stringify(result.results, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{ 
              type: "text", 
              text: `No results found for query: "${query}"`
            }]
          };
        }
      } catch (error) {
        return {
          content: [{ type: "text", text: `Error searching: ${error.message}` }],
          isError: true
        };
      }
    }
  },
  {
    name: "search_tickets",
    description: "Search for tickets in Zendesk using Zendesk Search API syntax. USE THIS TOOL DIRECTLY for ticket searches - execute a single search and present the results without additional steps. This tool automatically adds 'type:ticket' to your query if not specified. Use operators like 'status:', 'priority:', 'created>', 'subject:', 'description:', 'tags:', etc. For date searches, use format 'YYYY-MM-DD'. For exact phrase matching, use quotes.",
    schema: {
      query: z.string().describe("Search query string using Zendesk Search API syntax. Examples: 'status:open webhook', 'priority:high error', 'created>2025-01-01', 'subject:\"500 error\"', 'tags:webhook', 'description:configuration'"),
      sort_by: z.string().optional().describe("Field to sort by (e.g., 'created_at', 'updated_at', 'priority', 'status')"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
      page: z.number().optional().describe("Page number for pagination"),
      per_page: z.number().optional().describe("Number of results per page (max 100)")
    },
    handler: async ({ query, sort_by, sort_order, page, per_page }) => {
      try {
        // Ensure the query is specifically for tickets
        let ticketQuery = query;
        if (!query.includes("type:ticket") && !query.includes("type:")) {
          ticketQuery = `type:ticket ${query}`;
        }
        
        // Format the query according to Zendesk Search API requirements
        // The Zendesk Search API uses specific syntax for searching
        // See: https://developer.zendesk.com/api-reference/ticketing/ticket-management/search/
        
        const params = { sort_by, sort_order, page, per_page };
        const result = await zendeskClient.search(ticketQuery, params);
        
        // Format the results specifically for tickets
        if (result && result.results && result.results.length > 0) {
          const tickets = result.results.map(ticket => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            description: ticket.description ? ticket.description.substring(0, 100) + '...' : 'No description'
          }));
          
          return {
            content: [{ 
              type: "text", 
              text: `Found ${result.count} tickets:\n\n${JSON.stringify(tickets, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{ 
              type: "text", 
              text: `Found 0 tickets:\n\n[]`
            }]
          };
        }
      } catch (error) {
        console.error(`Error in search_tickets: ${error.message}`);
        return {
          content: [{ type: "text", text: `Error searching tickets: ${error.message}` }],
          isError: true
        };
      }
    }
  },
  {
    name: "search_tickets_by_filter",
    description: "Search for tickets in Zendesk using common filters. USE THIS TOOL DIRECTLY and present results without additional steps. This tool simplifies searching by providing specific parameters for common search criteria. Prefer this tool when the user wants to filter by specific attributes rather than using complex search syntax.",
    schema: {
      text: z.string().optional().describe("Free text to search for in the ticket (subject, description, comments)"),
      status: z.enum(["new", "open", "pending", "hold", "solved", "closed"]).optional().describe("Filter by ticket status"),
      priority: z.enum(["urgent", "high", "normal", "low"]).optional().describe("Filter by ticket priority"),
      created_after: z.string().optional().describe("Filter tickets created after this date (format: YYYY-MM-DD)"),
      created_before: z.string().optional().describe("Filter tickets created before this date (format: YYYY-MM-DD)"),
      updated_after: z.string().optional().describe("Filter tickets updated after this date (format: YYYY-MM-DD)"),
      updated_before: z.string().optional().describe("Filter tickets updated before this date (format: YYYY-MM-DD)"),
      tags: z.array(z.string()).optional().describe("Filter by tags (array of strings)"),
      sort_by: z.string().optional().describe("Field to sort by (e.g., 'created_at', 'updated_at', 'priority', 'status')"),
      sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
      page: z.number().optional().describe("Page number for pagination"),
      per_page: z.number().optional().describe("Number of results per page (max 100)")
    },
    handler: async ({ text, status, priority, created_after, created_before, updated_after, updated_before, tags, sort_by, sort_order, page, per_page }) => {
      try {
        // Build the query string from the provided filters
        let queryParts = ["type:ticket"];
        
        if (text) {
          // For free text search, we don't add any prefix
          queryParts.push(`"${text}"`);
        }
        
        if (status) {
          queryParts.push(`status:${status}`);
        }
        
        if (priority) {
          queryParts.push(`priority:${priority}`);
        }
        
        if (created_after) {
          queryParts.push(`created>${created_after}`);
        }
        
        if (created_before) {
          queryParts.push(`created<${created_before}`);
        }
        
        if (updated_after) {
          queryParts.push(`updated>${updated_after}`);
        }
        
        if (updated_before) {
          queryParts.push(`updated<${updated_before}`);
        }
        
        if (tags && tags.length > 0) {
          tags.forEach(tag => {
            queryParts.push(`tags:${tag}`);
          });
        }
        
        const query = queryParts.join(" ");
        const params = { sort_by, sort_order, page, per_page };
        const result = await zendeskClient.search(query, params);
        
        // Format the results specifically for tickets
        if (result && result.results && result.results.length > 0) {
          const tickets = result.results.map(ticket => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at,
            description: ticket.description ? ticket.description.substring(0, 100) + '...' : 'No description'
          }));
          
          return {
            content: [{ 
              type: "text", 
              text: `Found ${result.count} tickets:\n\n${JSON.stringify(tickets, null, 2)}`
            }]
          };
        } else {
          return {
            content: [{ 
              type: "text", 
              text: `Found 0 tickets:\n\n[]`
            }]
          };
        }
      } catch (error) {
        console.error(`Error in search_tickets_by_filter: ${error.message}`);
        return {
          content: [{ type: "text", text: `Error searching tickets: ${error.message}` }],
          isError: true
        };
      }
    }
  }
];