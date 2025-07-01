import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

// Define proper Zod schemas
const ListUsersSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of users per page (max 100)"),
  role: z.enum(["end-user", "agent", "admin"]).optional().describe("Filter users by role")
});

const GetUserSchema = z.object({
  id: z.number().describe("User ID")
});

const CreateUserSchema = z.object({
  name: z.string().describe("User's full name"),
  email: z.string().email().describe("User's email address"),
  role: z.enum(["end-user", "agent", "admin"]).optional().describe("User's role"),
  phone: z.string().optional().describe("User's phone number"),
  organization_id: z.number().optional().describe("ID of the user's organization"),
  tags: z.array(z.string()).optional().describe("Tags for the user"),
  notes: z.string().optional().describe("Notes about the user")
});

const UpdateUserSchema = z.object({
  id: z.number().describe("User ID to update"),
  name: z.string().optional().describe("Updated user's name"),
  email: z.string().email().optional().describe("Updated email address"),
  role: z.enum(["end-user", "agent", "admin"]).optional().describe("Updated user's role"),
  phone: z.string().optional().describe("Updated phone number"),
  organization_id: z.number().optional().describe("Updated organization ID"),
  tags: z.array(z.string()).optional().describe("Updated tags for the user"),
  notes: z.string().optional().describe("Updated notes about the user")
});

const DeleteUserSchema = z.object({
  id: z.number().describe("User ID to delete")
});

// Tool handlers
async function listUsers(args) {
  try {
    const params = { page: args.page, per_page: args.per_page, role: args.role };
    const result = await zendeskClient.listUsers(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing users: ${error.message}` }],
      isError: true
    };
  }
}

async function getUser(args) {
  try {
    const result = await zendeskClient.getUser(args.id);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting user: ${error.message}` }],
      isError: true
    };
  }
}

async function createUser(args) {
  try {
    const userData = {
      name: args.name,
      email: args.email,
      role: args.role,
      phone: args.phone,
      organization_id: args.organization_id,
      tags: args.tags,
      notes: args.notes
    };
    
    const result = await zendeskClient.createUser(userData);
    return {
      content: [{ 
        type: "text", 
        text: `User created successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating user: ${error.message}` }],
      isError: true
    };
  }
}

async function updateUser(args) {
  try {
    const userData = {};
    
    if (args.name !== undefined) userData.name = args.name;
    if (args.email !== undefined) userData.email = args.email;
    if (args.role !== undefined) userData.role = args.role;
    if (args.phone !== undefined) userData.phone = args.phone;
    if (args.organization_id !== undefined) userData.organization_id = args.organization_id;
    if (args.tags !== undefined) userData.tags = args.tags;
    if (args.notes !== undefined) userData.notes = args.notes;
    
    const result = await zendeskClient.updateUser(args.id, userData);
    return {
      content: [{ 
        type: "text", 
        text: `User updated successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error updating user: ${error.message}` }],
      isError: true
    };
  }
}

async function deleteUser(args) {
  try {
    await zendeskClient.deleteUser(args.id);
    return {
      content: [{ 
        type: "text", 
        text: `User ${args.id} deleted successfully!`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error deleting user: ${error.message}` }],
      isError: true
    };
  }
}

// Register tools function
function registerTools(server) {
  server.tool(
    'list_users',
    'List users in Zendesk',
    ListUsersSchema.shape,
    listUsers
  );

  server.tool(
    'get_user',
    'Get a specific user by ID',
    GetUserSchema.shape,
    getUser
  );

  server.tool(
    'create_user',
    'Create a new user',
    CreateUserSchema.shape,
    createUser
  );

  server.tool(
    'update_user',
    'Update an existing user',
    UpdateUserSchema.shape,
    updateUser
  );

  server.tool(
    'delete_user',
    'Delete a user',
    DeleteUserSchema.shape,
    deleteUser
  );
}

export default { registerTools };

