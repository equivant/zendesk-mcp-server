import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const ListMacrosSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of macros per page (max 100)")
});

const GetMacroSchema = z.object({
  id: z.number().describe("Macro ID")
});

const CreateMacroSchema = z.object({
  title: z.string().describe("Macro title"),
  description: z.string().optional().describe("Macro description"),
  actions: z.array(z.object({
    field: z.string().describe("Field to modify"),
    value: z.any().describe("Value to set")
  })).describe("Actions to perform when macro is applied")
});

const UpdateMacroSchema = z.object({
  id: z.number().describe("Macro ID to update"),
  title: z.string().optional().describe("Updated macro title"),
  description: z.string().optional().describe("Updated macro description"),
  actions: z.array(z.object({
    field: z.string().describe("Field to modify"),
    value: z.any().describe("Value to set")
  })).optional().describe("Updated actions")
});

const DeleteMacroSchema = z.object({
  id: z.number().describe("Macro ID to delete")
});

async function listMacros(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listMacros(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing macros: ${error.message}` }],
      isError: true
    };
  }
}

async function getMacro(args) {
  try {
    const result = await zendeskClient.getMacro(args.id);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting macro: ${error.message}` }],
      isError: true
    };
  }
}

async function createMacro(args) {
  try {
    const macroData = {
      title: args.title,
      description: args.description,
      actions: args.actions
    };
    
    const result = await zendeskClient.createMacro(macroData);
    return {
      content: [{ 
        type: "text", 
        text: `Macro created successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error creating macro: ${error.message}` }],
      isError: true
    };
  }
}

async function updateMacro(args) {
  try {
    const macroData = {};
    
    if (args.title !== undefined) macroData.title = args.title;
    if (args.description !== undefined) macroData.description = args.description;
    if (args.actions !== undefined) macroData.actions = args.actions;
    
    const result = await zendeskClient.updateMacro(args.id, macroData);
    return {
      content: [{ 
        type: "text", 
        text: `Macro updated successfully!\n\n${JSON.stringify(result, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error updating macro: ${error.message}` }],
      isError: true
    };
  }
}

async function deleteMacro(args) {
  try {
    await zendeskClient.deleteMacro(args.id);
    return {
      content: [{ 
        type: "text", 
        text: `Macro ${args.id} deleted successfully!`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error deleting macro: ${error.message}` }],
      isError: true
    };
  }
}

function registerTools(server) {
  server.tool('list_macros', 'List macros in Zendesk', ListMacrosSchema.shape, listMacros);
  server.tool('get_macro', 'Get a specific macro by ID', GetMacroSchema.shape, getMacro);
  server.tool('create_macro', 'Create a new macro', CreateMacroSchema.shape, createMacro);
  server.tool('update_macro', 'Update an existing macro', UpdateMacroSchema.shape, updateMacro);
  server.tool('delete_macro', 'Delete a macro', DeleteMacroSchema.shape, deleteMacro);
}

export default { registerTools };

