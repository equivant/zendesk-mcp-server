import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const ConditionSchema = z.object({
  field: z.string().describe("Field to check"),
  operator: z.string().describe("Operator for comparison"),
  value: z.any().describe("Value to compare against")
});

const ActionSchema = z.object({
  field: z.string().describe("Field to modify"),
  value: z.any().describe("Value to set")
});

const ListAutomationsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of automations per page (max 100)")
});

const GetAutomationSchema = z.object({
  id: z.number().describe("Automation ID")
});

const CreateAutomationSchema = z.object({
  title: z.string().describe("Automation title"),
  description: z.string().optional().describe("Automation description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).describe("Conditions for the automation"),
  actions: z.array(ActionSchema).describe("Actions to perform when automation conditions are met")
});

const UpdateAutomationSchema = z.object({
  id: z.number().describe("Automation ID to update"),
  title: z.string().optional().describe("Updated automation title"),
  description: z.string().optional().describe("Updated automation description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).optional().describe("Updated conditions"),
  actions: z.array(ActionSchema).optional().describe("Updated actions")
});

const DeleteAutomationSchema = z.object({
  id: z.number().describe("Automation ID to delete")
});

async function listAutomations(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listAutomations(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error listing automations: ${error.message}` }], isError: true };
  }
}

async function getAutomation(args) {
  try {
    const result = await zendeskClient.getAutomation(args.id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error getting automation: ${error.message}` }], isError: true };
  }
}

async function createAutomation(args) {
  try {
    const result = await zendeskClient.createAutomation(args);
    return { content: [{ type: "text", text: `Automation created successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error creating automation: ${error.message}` }], isError: true };
  }
}

async function updateAutomation(args) {
  try {
    const { id, ...automationData } = args;
    const result = await zendeskClient.updateAutomation(id, automationData);
    return { content: [{ type: "text", text: `Automation updated successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error updating automation: ${error.message}` }], isError: true };
  }
}

async function deleteAutomation(args) {
  try {
    await zendeskClient.deleteAutomation(args.id);
    return { content: [{ type: "text", text: `Automation ${args.id} deleted successfully!` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error deleting automation: ${error.message}` }], isError: true };
  }
}

function registerTools(server) {
  server.tool('list_automations', 'List automations in Zendesk', ListAutomationsSchema.shape, listAutomations);
  server.tool('get_automation', 'Get a specific automation by ID', GetAutomationSchema.shape, getAutomation);
  server.tool('create_automation', 'Create a new automation', CreateAutomationSchema.shape, createAutomation);
  server.tool('update_automation', 'Update an existing automation', UpdateAutomationSchema.shape, updateAutomation);
  server.tool('delete_automation', 'Delete an automation', DeleteAutomationSchema.shape, deleteAutomation);
}

export default { registerTools };