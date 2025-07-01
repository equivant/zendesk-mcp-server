import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { zendeskClient } from './zendesk-client.js';
import { logger } from './debug-logger.js';
import ticketsTools from './tools/tickets.js';
import usersTools from './tools/users.js';
import organizationsTools from './tools/organizations.js';
import groupsTools from './tools/groups.js';
import { macrosTools } from './tools/macros.js';
import { viewsTools } from './tools/views.js';
import { triggersTools } from './tools/triggers.js';
import { automationsTools } from './tools/automations.js';
import searchTools from './tools/search.js';
import { helpCenterTools } from './tools/help-center.js';
import { supportTools } from './tools/support.js';
import { talkTools } from './tools/talk.js';
import { chatTools } from './tools/chat.js';

// Create an MCP server for Zendesk API
logger.debug('Creating MCP server instance');
const server = new McpServer({
  name: "Zendesk API",
  version: "1.0.0",
  description: "MCP Server for interacting with the Zendesk API"
});

// We'll add request logging at the transport level instead

// Register tools using the new format
logger.debug('Registering Zendesk tools...');

ticketsTools.registerTools(server);
logger.debug('Registered Tickets tools');

usersTools.registerTools(server);
logger.debug('Registered Users tools');

organizationsTools.registerTools(server);
logger.debug('Registered Organizations tools');

searchTools.registerTools(server);
logger.debug('Registered Search tools');

groupsTools.registerTools(server);
logger.debug('Registered Groups tools');

// TODO: Convert other tool modules to new format
// macrosTools.registerTools(server);
// etc.

logger.info('All tools registered successfully');

// Add a resource for Zendesk API documentation
server.resource(
  "documentation",
  new ResourceTemplate("zendesk://docs/{section}", { list: undefined }),
  async (uri, { section }) => {
    const docs = {
      "tickets": "Tickets API allows you to create, modify, and manage support tickets.\nEndpoints: GET /api/v2/tickets, POST /api/v2/tickets, etc.",
      "users": "Users API allows you to create, modify, and manage end users and agents.\nEndpoints: GET /api/v2/users, POST /api/v2/users, etc.",
      "organizations": "Organizations API allows you to create and manage organizations.\nEndpoints: GET /api/v2/organizations, POST /api/v2/organizations, etc.",
      "groups": "Groups API allows you to create and manage agent groups.\nEndpoints: GET /api/v2/groups, POST /api/v2/groups, etc.",
      "macros": "Macros API allows you to create and manage macros for ticket actions.\nEndpoints: GET /api/v2/macros, POST /api/v2/macros, etc.",
      "views": "Views API allows you to create and manage views for filtering tickets.\nEndpoints: GET /api/v2/views, POST /api/v2/views, etc.",
      "triggers": "Triggers API allows you to create and manage triggers for automation.\nEndpoints: GET /api/v2/triggers, POST /api/v2/triggers, etc.",
      "automations": "Automations API allows you to create and manage time-based automations.\nEndpoints: GET /api/v2/automations, POST /api/v2/automations, etc.",
      "search": "Search API allows you to search across Zendesk data using specific syntax.\nEndpoints: GET /api/v2/search\n\nSearch Query Syntax:\n- Use 'type:ticket' to search for tickets\n- Use 'status:open', 'status:pending', etc. to filter by status\n- Use 'priority:high', 'priority:urgent', etc. to filter by priority\n- Use 'created>2025-01-01' to filter by creation date\n- Use 'updated<2025-06-01' to filter by update date\n- Use 'subject:\"exact phrase\"' to search in subject\n- Use 'description:keyword' to search in description\n- Use 'tags:webhook' to search by tags\n- Combine multiple filters with spaces: 'type:ticket status:open webhook'\n\nExamples:\n- 'type:ticket webhook error'\n- 'type:ticket status:open priority:high'\n- 'type:ticket created>2025-01-01 tags:api'\n- 'type:ticket subject:\"500 error\" description:configuration'",
      "help_center": "Help Center API allows you to manage articles, categories, and sections.\nEndpoints: GET /api/v2/help_center/articles, etc.",
      "support": "Support API includes core functionality for the Support product.\nEndpoints: Various endpoints for tickets, users, etc.",
      "talk": "Talk API allows you to manage Zendesk Talk phone calls and settings.\nEndpoints: GET /api/v2/channels/voice/stats, etc.",
      "chat": "Chat API allows you to manage Zendesk Chat conversations.\nEndpoints: GET /api/v2/chats, etc.",
      "overview": "The Zendesk API is a RESTful API that uses JSON for serialization. It provides access to Zendesk Support, Talk, Chat, and Guide products."
    };

    if (!section || section === "all") {
      return {
        contents: [{
          uri: uri.href,
          text: `Zendesk API Documentation Overview\n\n${Object.keys(docs).map(key => `- ${key}: ${docs[key].split('\n')[0]}`).join('\n')}`
        }]
      };
    }

    if (docs[section]) {
      return {
        contents: [{
          uri: uri.href,
          text: `Zendesk API Documentation: ${section}\n\n${docs[section]}`
        }]
      };
    }

    return {
      contents: [{
        uri: uri.href,
        text: `Documentation section '${section}' not found. Available sections: ${Object.keys(docs).join(', ')}`
      }]
    };
  }
);

// MCP protocol logging will be handled at the transport level

// Explicitly initialize tool handlers to ensure they're registered
logger.debug('Setting tool request handlers');
try {
  server.setToolRequestHandlers();
  logger.debug('Tool request handlers set successfully');
} catch (error) {
  logger.error('Failed to set tool request handlers', error);
}

logger.debug('Server setup complete');
export { server };