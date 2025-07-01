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

const ListTriggersSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of triggers per page (max 100)")
});

const GetTriggerSchema = z.object({
  id: z.number().describe("Trigger ID")
});

const CreateTriggerSchema = z.object({
  title: z.string().describe("Trigger title"),
  description: z.string().optional().describe("Trigger description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).describe("Conditions for the trigger"),
  actions: z.array(ActionSchema).describe("Actions to perform when trigger conditions are met")
});

const UpdateTriggerSchema = z.object({
  id: z.number().describe("Trigger ID to update"),
  title: z.string().optional().describe("Updated trigger title"),
  description: z.string().optional().describe("Updated trigger description"),
  conditions: z.object({
    all: z.array(ConditionSchema).optional(),
    any: z.array(ConditionSchema).optional()
  }).optional().describe("Updated conditions"),
  actions: z.array(ActionSchema).optional().describe("Updated actions")
});

const DeleteTriggerSchema = z.object({
  id: z.number().describe("Trigger ID to delete")
});

async function listTriggers(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listTriggers(params);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error listing triggers: ${error.message}` }], isError: true };
  }
}

async function getTrigger(args) {
  try {
    const result = await zendeskClient.getTrigger(args.id);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error getting trigger: ${error.message}` }], isError: true };
  }
}

async function createTrigger(args) {
  try {
    const result = await zendeskClient.createTrigger(args);
    return { content: [{ type: "text", text: `Trigger created successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error creating trigger: ${error.message}` }], isError: true };
  }
}

async function updateTrigger(args) {
  try {
    const { id, ...triggerData } = args;
    const result = await zendeskClient.updateTrigger(id, triggerData);
    return { content: [{ type: "text", text: `Trigger updated successfully!\n\n${JSON.stringify(result, null, 2)}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error updating trigger: ${error.message}` }], isError: true };
  }
}

async function deleteTrigger(args) {
  try {
    await zendeskClient.deleteTrigger(args.id);
    return { content: [{ type: "text", text: `Trigger ${args.id} deleted successfully!` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error deleting trigger: ${error.message}` }], isError: true };
  }
}

function registerTools(server) {
  server.tool('list_triggers', 'List triggers in Zendesk', ListTriggersSchema.shape, listTriggers);
  server.tool('get_trigger', 'Get a specific trigger by ID', GetTriggerSchema.shape, getTrigger);
  server.tool('create_trigger', 'Create a new trigger', CreateTriggerSchema.shape, createTrigger);
  server.tool('update_trigger', 'Update an existing trigger', UpdateTriggerSchema.shape, updateTrigger);
  server.tool('delete_trigger', 'Delete a trigger', DeleteTriggerSchema.shape, deleteTrigger);
}

export default { registerTools };

