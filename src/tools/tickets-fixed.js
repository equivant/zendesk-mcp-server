import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

// Define proper Zod schemas
const ListTicketsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of tickets per page (max 100)"),
  sort_by: z.string().optional().describe("Field to sort by"),
  sort_order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)")
});

const GetTicketSchema = z.object({
  id: z.number().describe("Ticket ID")
});

const CreateTicketSchema = z.object({
  subject: z.string().describe("Ticket subject"),
  comment: z.string().describe("Ticket comment/description"),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional().describe("Ticket priority"),
  status: z.enum(["new", "open", "pending", "hold", "solved", "closed"]).optional().describe("Ticket status"),
  requester_id: z.number().optional().describe("User ID of the requester"),
  assignee_id: z.number().optional().describe("User ID of the assignee"),
  group_id: z.number().optional().describe("Group ID for the ticket"),
  type: z.enum(["problem", "incident", "question", "task"]).optional().describe("Ticket type"),
  tags: z.array(z.string()).optional().describe("Tags for the ticket")
});

const UpdateTicketSchema = z.object({
  id: z.number().describe("Ticket ID to update"),
  subject: z.string().optional().describe("Updated ticket subject"),
  comment: z.string().optional().describe("New comment to add"),
  priority: z.enum(["urgent", "high", "normal", "low"]).optional().describe("Updated ticket priority"),
  status: z.enum(["new", "open", "pending", "hold", "solved", "closed"]).optional().describe("Updated ticket status"),
  assignee_id: z.number().optional().describe("User ID of the new assignee"),
  group_id: z.number().optional().describe("New group ID for the ticket"),
  type: z.enum(["problem", "incident", "question", "task"]).optional().describe("Updated ticket type"),
  tags: z.array(z.string()).optional().describe("Updated tags for the ticket")
});

const DeleteTicketSchema = z.object({
  id: z.number().describe("Ticket ID to delete")
});

// Tool handlers
async function listTickets(args) {
  try {
    const params = { page: args.page, per_page: args.per_page, sort_by: args.sort_by, sort_order: args.sort_order };
    const result = await zendeskClient.listTickets(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing tickets: ${error.message}` }],
      isError: true
    };
  }
}

async function getTicket(args) {
  try {
    const result = await zendeskClient.getTicket(args.id);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting ticket: ${error.message}` }],
      isError: true
    };
  }
}

async function createTicket(args) {
  try {
    const ticketData = {
      subject: args.subject,
      comment: { body: args.comment },
      priority: args.priority,
      status: args.status,
      requester_id: args.requester_id,
      assignee_id: args.assignee_id,
      group_id: args.group_id,
      type: args.type,
      tags: args.tags
    };
    
    const result = await zendeskClient.createTicket(ticketData);
    return {
      content: [{ 
        type: "text", 
        text: `Ticket created successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating ticket: ${error.message}` }],
      isError: true
    };
  }
}

async function updateTicket(args) {
  try {
    const ticketData = {};
    
    if (args.subject !== undefined) ticketData.subject = args.subject;
    if (args.comment !== undefined) ticketData.comment = { body: args.comment };
    if (args.priority !== undefined) ticketData.priority = args.priority;
    if (args.status !== undefined) ticketData.status = args.status;
    if (args.assignee_id !== undefined) ticketData.assignee_id = args.assignee_id;
    if (args.group_id !== undefined) ticketData.group_id = args.group_id;
    if (args.type !== undefined) ticketData.type = args.type;
    if (args.tags !== undefined) ticketData.tags = args.tags;
    
    const result = await zendeskClient.updateTicket(args.id, ticketData);
    return {
      content: [{ 
        type: "text", 
        text: `Ticket updated successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error updating ticket: ${error.message}` }],
      isError: true
    };
  }
}

async function deleteTicket(args) {
  try {
    await zendeskClient.deleteTicket(args.id);
    return {
      content: [{ 
        type: "text", 
        text: `Ticket ${args.id} deleted successfully!`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error deleting ticket: ${error.message}` }],
      isError: true
    };
  }
}

// Register tools function (like Atlassian)
function registerTools(server) {
  server.tool(
    'list_tickets',
    'List tickets in Zendesk',
    ListTicketsSchema.shape,
    listTickets
  );

  server.tool(
    'get_ticket',
    'Get a specific ticket by ID',
    GetTicketSchema.shape,
    getTicket
  );

  server.tool(
    'create_ticket',
    'Create a new ticket',
    CreateTicketSchema.shape,
    createTicket
  );

  server.tool(
    'update_ticket',
    'Update an existing ticket',
    UpdateTicketSchema.shape,
    updateTicket
  );

  server.tool(
    'delete_ticket',
    'Delete a ticket',
    DeleteTicketSchema.shape,
    deleteTicket
  );
}

export default { registerTools };