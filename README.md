# Zendesk API MCP Server

    A comprehensive Model Context Protocol (MCP) server for interacting with the Zendesk API. This server provides tools and resources for managing Zendesk Support, Talk, Chat, and Guide products.

    **Note:** This is an enhanced version of the original [zendesk-mcp-server](https://github.com/mattcoatsworth/zendesk-mcp-server) with significant improvements including advanced search capabilities, additional tools, and enhanced functionality.

    ## Features

    - Complete coverage of Zendesk API functionality
    - Tools for managing tickets, users, organizations, and more
    - Resources for accessing Zendesk API documentation
    - Secure authentication with Zendesk API tokens

    ## Getting Started

    ### Prerequisites

    - Node.js 14 or higher
    - A Zendesk account with API access

    ### Installation

    1. Clone this repository
    2. Install dependencies:
       ```
       npm install
       ```
    3. Create a `.env` file with your Zendesk credentials:
       ```
       ZENDESK_SUBDOMAIN=your-subdomain
       ZENDESK_EMAIL=your-email@example.com
       ZENDESK_API_TOKEN=your-api-token
       ```

    ### Running the Server

    Start the server:
    ```
    npm start
    ```

    For development with auto-restart:
    ```
    npm run dev
    ```

    ### Testing with MCP Inspector

    Test the server using the MCP Inspector:
    ```
    npm run inspect
    ```

    ### Development Testing

    Various test scripts are available for development and debugging:
    ```
    node test-tickets.js        # Test ticket functionality
    node test-search.js         # Test search functionality
    node test-mcp.js           # Test MCP protocol
    ```

    ## Available Tools

    ### Tickets
    - `list_tickets`: List tickets in Zendesk
    - `get_ticket`: Get a specific ticket by ID
    - `create_ticket`: Create a new ticket
    - `update_ticket`: Update an existing ticket
    - `delete_ticket`: Delete a ticket

    ### Users
    - `list_users`: List users in Zendesk
    - `get_user`: Get a specific user by ID
    - `create_user`: Create a new user
    - `update_user`: Update an existing user
    - `delete_user`: Delete a user

    ### Organizations
    - `list_organizations`: List organizations in Zendesk
    - `get_organization`: Get a specific organization by ID
    - `create_organization`: Create a new organization
    - `update_organization`: Update an existing organization
    - `delete_organization`: Delete an organization

    ### Groups
    - `list_groups`: List agent groups in Zendesk
    - `get_group`: Get a specific group by ID
    - `create_group`: Create a new agent group
    - `update_group`: Update an existing group
    - `delete_group`: Delete a group

    ### Macros
    - `list_macros`: List macros in Zendesk
    - `get_macro`: Get a specific macro by ID
    - `create_macro`: Create a new macro
    - `update_macro`: Update an existing macro
    - `delete_macro`: Delete a macro

    ### Views
    - `list_views`: List views in Zendesk
    - `get_view`: Get a specific view by ID
    - `create_view`: Create a new view
    - `update_view`: Update an existing view
    - `delete_view`: Delete a view

    ### Triggers
    - `list_triggers`: List triggers in Zendesk
    - `get_trigger`: Get a specific trigger by ID
    - `create_trigger`: Create a new trigger
    - `update_trigger`: Update an existing trigger
    - `delete_trigger`: Delete a trigger

    ### Automations
    - `list_automations`: List automations in Zendesk
    - `get_automation`: Get a specific automation by ID
    - `create_automation`: Create a new automation
    - `update_automation`: Update an existing automation
    - `delete_automation`: Delete an automation

    ### Search (Enhanced)
    - `search`: Search across all Zendesk data types using advanced query syntax
    - `search_tickets`: Dedicated ticket search with automatic type filtering
    - `search_tickets_by_filter`: Simplified ticket search using common filter parameters

    ### Help Center
    - `list_articles`: List Help Center articles
    - `get_article`: Get a specific Help Center article by ID
    - `create_article`: Create a new Help Center article
    - `update_article`: Update an existing Help Center article
    - `delete_article`: Delete a Help Center article

    ### Talk
    - `get_talk_stats`: Get Zendesk Talk statistics

    ### Chat
    - `list_chats`: List Zendesk Chat conversations

    ## Available Resources

    - `zendesk://docs/{section}`: Access documentation for different sections of the Zendesk API

    ## Search Query Syntax

    The enhanced search tools support Zendesk's powerful search syntax:

    - `type:ticket status:open` - Find open tickets
    - `priority:high created>2025-01-01` - High priority tickets created after Jan 1, 2025
    - `subject:"500 error"` - Tickets with "500 error" in subject
    - `tags:webhook description:configuration` - Tickets tagged "webhook" with "configuration" in description
    - `status:pending updated<2025-06-01` - Pending tickets updated before June 1, 2025

    ## Enhancements

    This version includes several enhancements over the original:

    - **Advanced Search**: Three different search tools for various use cases
    - **Enhanced Error Handling**: Better error messages and debugging
    - **Improved Documentation**: Comprehensive inline documentation
    - **Development Tools**: Additional test scripts for development

    ## License

    MIT
