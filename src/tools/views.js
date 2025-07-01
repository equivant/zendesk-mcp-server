import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const ConditionSchema = z.object({
  field: z.string().describe("Field to filter on"),
  operator: z.string().describe("Operator for comparison"),
  value: z.any().describe("Value to compare against")
});

const ListViewsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of views per page (max 100)")
});

const GetViewSchema = z.object({
  id: z.number().describe("View ID")
});

const CreateViewSchema = z.object({
  title: z.string().describe("View title"),
  description: z.string().optional().describe("View description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).describe("Conditions for the view")
});

const UpdateViewSchema = z.object({
  id: z.number().describe("View ID to update"),
  title: z.string().optional().describe("Updated view title"),
  description: z.string().optional().describe("Updated view description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).optional().describe("Updated conditions")
});

const DeleteViewSchema = z.object({
  id: z.number().describe("View ID to delete")
});

async function listViews(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listViews(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error listing views: ${error.message}` }], isError: true };
  }
}

async function getView(args) {
  try {
    const result = await zendeskClient.getView(args.id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error getting view: ${error.message}` }], isError: true };
  }
}

async function createView(args) {
  try {
    const result = await zendeskClient.createView(args);
    return { content: [{ type: "text", text: `View created successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error creating view: ${error.message}` }], isError: true };
  }
}

async function updateView(args) {
  try {
    const { id, ...viewData } = args;
    const result = await zendeskClient.updateView(id, viewData);
    return { content: [{ type: "text", text: `View updated successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error updating view: ${error.message}` }], isError: true };
  }
}

async function deleteView(args) {
  try {
    await zendeskClient.deleteView(args.id);
    return { content: [{ type: "text", text: `View ${args.id} deleted successfully!` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error deleting view: ${error.message}` }], isError: true };
  }
}

function registerTools(server) {
  server.tool('list_views', 'List views in Zendesk', ListViewsSchema.shape, listViews);
  server.tool('get_view', 'Get a specific view by ID', GetViewSchema.shape, getView);
  server.tool('create_view', 'Create a new view', CreateViewSchema.shape, createView);
  server.tool('update_view', 'Update an existing view', UpdateViewSchema.shape, updateView);
  server.tool('delete_view', 'Delete a view', DeleteViewSchema.shape, deleteView);
}

export default { registerTools };

