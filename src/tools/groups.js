import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

// Define proper Zod schemas
const ListGroupsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of groups per page (max 100)")
});

const GetGroupSchema = z.object({
  id: z.number().describe("Group ID")
});

const CreateGroupSchema = z.object({
  name: z.string().describe("Group name"),
  description: z.string().optional().describe("Group description")
});

const UpdateGroupSchema = z.object({
  id: z.number().describe("Group ID to update"),
  name: z.string().optional().describe("Updated group name"),
  description: z.string().optional().describe("Updated group description")
});

const DeleteGroupSchema = z.object({
  id: z.number().describe("Group ID to delete")
});

// Tool handlers
async function listGroups(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listGroups(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing groups: ${error.message}` }],
      isError: true
    };
  }
}

async function getGroup(args) {
  try {
    const result = await zendeskClient.getGroup(args.id);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting group: ${error.message}` }],
      isError: true
    };
  }
}

async function createGroup(args) {
  try {
    const groupData = {
      name: args.name,
      description: args.description
    };
    
    const result = await zendeskClient.createGroup(groupData);
    return {
      content: [{ 
        type: "text", 
        text: `Group created successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating group: ${error.message}` }],
      isError: true
    };
  }
}

async function updateGroup(args) {
  try {
    const groupData = {};
    
    if (args.name !== undefined) groupData.name = args.name;
    if (args.description !== undefined) groupData.description = args.description;
    
    const result = await zendeskClient.updateGroup(args.id, groupData);
    return {
      content: [{ 
        type: "text", 
        text: `Group updated successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error updating group: ${error.message}` }],
      isError: true
    };
  }
}

async function deleteGroup(args) {
  try {
    await zendeskClient.deleteGroup(args.id);
    return {
      content: [{ 
        type: "text", 
        text: `Group ${args.id} deleted successfully!`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error deleting group: ${error.message}` }],
      isError: true
    };
  }
}

// Register tools function
function registerTools(server) {
  server.tool(
    'list_groups',
    'List agent groups in Zendesk',
    ListGroupsSchema.shape,
    listGroups
  );

  server.tool(
    'get_group',
    'Get a specific group by ID',
    GetGroupSchema.shape,
    getGroup
  );

  server.tool(
    'create_group',
    'Create a new agent group',
    CreateGroupSchema.shape,
    createGroup
  );

  server.tool(
    'update_group',
    'Update an existing group',
    UpdateGroupSchema.shape,
    updateGroup
  );

  server.tool(
    'delete_group',
    'Delete a group',
    DeleteGroupSchema.shape,
    deleteGroup
  );
}

export default { registerTools };

