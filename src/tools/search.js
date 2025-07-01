import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

// Define proper Zod schemas
const SearchSchema = z.object({
  query: z.string().describe("Search query string using Zendesk Search API syntax. Examples: 'type:user email:example.com', 'type:organization name:acme', 'type:ticket status:open'"),
  sort_by: z.string().optional().describe("Field to sort by (e.g., 'created_at', 'updated_at')"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of results per page (max 100)")
});

const SearchTicketsSchema = z.object({
  query: z.string().describe("Search query string using Zendesk Search API syntax. Examples: 'status:open webhook', 'priority:high error', 'created>2025-01-01', 'subject:\"500 error\"', 'tags:webhook', 'description:configuration'"),
  sort_by: z.string().optional().describe("Field to sort by (e.g., 'created_at', 'updated_at', 'priority', 'status')"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of results per page (max 100)")
});

const SearchTicketsByFilterSchema = z.object({
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
});

// Tool handlers
async function search(args) {
  try {
    const params = { sort_by: args.sort_by, sort_order: args.sort_order, page: args.page, per_page: args.per_page };
    const result = await zendeskClient.search(args.query, params);
    
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
          text: `No results found for query: "${args.query}"`
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

async function searchTickets(args) {
  try {
    let ticketQuery = args.query;
    if (!args.query.includes("type:ticket") && !args.query.includes("type:")) {
      ticketQuery = `type:ticket ${args.query}`;
    }
    
    const params = { sort_by: args.sort_by, sort_order: args.sort_order, page: args.page, per_page: args.per_page };
    const result = await zendeskClient.search(ticketQuery, params);
    
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

async function searchTicketsByFilter(args) {
  try {
    let queryParts = ["type:ticket"];
    
    if (args.text) {
      queryParts.push(`"${args.text}"`);
    }
    
    if (args.status) {
      queryParts.push(`status:${args.status}`);
    }
    
    if (args.priority) {
      queryParts.push(`priority:${args.priority}`);
    }
    
    if (args.created_after) {
      queryParts.push(`created>${args.created_after}`);
    }
    
    if (args.created_before) {
      queryParts.push(`created<${args.created_before}`);
    }
    
    if (args.updated_after) {
      queryParts.push(`updated>${args.updated_after}`);
    }
    
    if (args.updated_before) {
      queryParts.push(`updated<${args.updated_before}`);
    }
    
    if (args.tags && args.tags.length > 0) {
      args.tags.forEach(tag => {
        queryParts.push(`tags:${tag}`);
      });
    }
    
    const query = queryParts.join(" ");
    const params = { sort_by: args.sort_by, sort_order: args.sort_order, page: args.page, per_page: args.per_page };
    const result = await zendeskClient.search(query, params);
    
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

// Register tools function
function registerTools(server) {
  server.tool(
    'search',
    'Search across all Zendesk data types (tickets, users, organizations, etc.) using Zendesk Search API syntax. For ticket-specific searches, use search_tickets instead. Use specific operators like \'type:\', \'status:\', \'priority:\', \'created>\', etc.',
    SearchSchema.shape,
    search
  );

  server.tool(
    'search_tickets',
    'Search for tickets in Zendesk using Zendesk Search API syntax. USE THIS TOOL DIRECTLY for ticket searches - execute a single search and present the results without additional steps. This tool automatically adds \'type:ticket\' to your query if not specified. Use operators like \'status:\', \'priority:\', \'created>\', \'subject:\', \'description:\', \'tags:\', etc. For date searches, use format \'YYYY-MM-DD\'. For exact phrase matching, use quotes.',
    SearchTicketsSchema.shape,
    searchTickets
  );

  server.tool(
    'search_tickets_by_filter',
    'Search for tickets in Zendesk using common filters. USE THIS TOOL DIRECTLY and present results without additional steps. This tool simplifies searching by providing specific parameters for common search criteria. Prefer this tool when the user wants to filter by specific attributes rather than using complex search syntax.',
    SearchTicketsByFilterSchema.shape,
    searchTicketsByFilter
  );
}

export default { registerTools };
