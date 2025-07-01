import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const ListChatsSchema = z.object({
  page: z.number().optional().describe("Page number for pagination"),
  per_page: z.number().optional().describe("Number of chats per page (max 100)")
});

async function listChats(args) {
  try {
    const params = { page: args.page, per_page: args.per_page };
    const result = await zendeskClient.listChats(params);
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error listing chats: ${error.message}` }],
      isError: true
    };
  }
}

function registerTools(server) {
  server.tool('list_chats', 'List Zendesk Chat conversations', ListChatsSchema.shape, listChats);
}

export default { registerTools };