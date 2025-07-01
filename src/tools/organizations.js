import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

// Define proper Zod schemas
const ListOrganizationsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of organizations per page (max 100)")
});

const GetOrganizationSchema = z.object({
  id: z.number().describe("Organization ID")
});

const CreateOrganizationSchema = z.object({
  name: z.string().describe("Organization name"),
  domain_names: z.array(z.string()).optional().describe("Domain names for the organization"),
  details: z.string().optional().describe("Details about the organization"),
  notes: z.string().optional().describe("Notes about the organization"),
  tags: z.array(z.string()).optional().describe("Tags for the organization")
});

const UpdateOrganizationSchema = z.object({
  id: z.number().describe("Organization ID to update"),
  name: z.string().optional().describe("Updated organization name"),
  domain_names: z.array(z.string()).optional().describe("Updated domain names"),
  details: z.string().optional().describe("Updated details"),
  notes: z.string().optional().describe("Updated notes"),
  tags: z.array(z.string()).optional().describe("Updated tags")
});

const DeleteOrganizationSchema = z.object({
  id: z.number().describe("Organization ID to delete")
});

// Tool handlers
async function listOrganizations(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listOrganizations(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing organizations: ${error.message}` }],
      isError: true
    };
  }
}

async function getOrganization(args) {
  try {
    const result = await zendeskClient.getOrganization(args.id);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting organization: ${error.message}` }],
      isError: true
    };
  }
}

async function createOrganization(args) {
  try {
    const orgData = {
      name: args.name,
      domain_names: args.domain_names,
      details: args.details,
      notes: args.notes,
      tags: args.tags
    };
    
    const result = await zendeskClient.createOrganization(orgData);
    return {
      content: [{ 
        type: "text", 
        text: `Organization created successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating organization: ${error.message}` }],
      isError: true
    };
  }
}

async function updateOrganization(args) {
  try {
    const orgData = {};
    
    if (args.name !== undefined) orgData.name = args.name;
    if (args.domain_names !== undefined) orgData.domain_names = args.domain_names;
    if (args.details !== undefined) orgData.details = args.details;
    if (args.notes !== undefined) orgData.notes = args.notes;
    if (args.tags !== undefined) orgData.tags = args.tags;
    
    const result = await zendeskClient.updateOrganization(args.id, orgData);
    return {
      content: [{ 
        type: "text", 
        text: `Organization updated successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error updating organization: ${error.message}` }],
      isError: true
    };
  }
}

async function deleteOrganization(args) {
  try {
    await zendeskClient.deleteOrganization(args.id);
    return {
      content: [{ 
        type: "text", 
        text: `Organization ${args.id} deleted successfully!`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error deleting organization: ${error.message}` }],
      isError: true
    };
  }
}

// Register tools function
function registerTools(server) {
  server.tool(
    'list_organizations',
    'List organizations in Zendesk',
    ListOrganizationsSchema.shape,
    listOrganizations
  );

  server.tool(
    'get_organization',
    'Get a specific organization by ID',
    GetOrganizationSchema.shape,
    getOrganization
  );

  server.tool(
    'create_organization',
    'Create a new organization',
    CreateOrganizationSchema.shape,
    createOrganization
  );

  server.tool(
    'update_organization',
    'Update an existing organization',
    UpdateOrganizationSchema.shape,
    updateOrganization
  );

  server.tool(
    'delete_organization',
    'Delete an organization',
    DeleteOrganizationSchema.shape,
    deleteOrganization
  );
}

export default { registerTools };

