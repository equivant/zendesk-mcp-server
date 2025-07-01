import { z } from 'zod';
import { zendeskClient } from '../zendesk-client.js';

const GetTalkStatsSchema = z.object({});

async function getTalkStats(args) {
  try {
    const result = await zendeskClient.getTalkStats();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error getting Talk stats: ${error.message}` }],
      isError: true
    };
  }
}

function registerTools(server) {
  server.tool('get_talk_stats', 'Get Zendesk Talk statistics', GetTalkStatsSchema.shape, getTalkStats);
}

export default { registerTools };