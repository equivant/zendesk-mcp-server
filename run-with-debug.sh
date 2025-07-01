#!/bin/bash
echo "Starting Zendesk MCP Server with debug logging enabled..."
echo ""
echo "Debug logs will be written to:"
echo "- Console (stderr)"
echo "- File: zendesk-mcp-debug.log"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

export DEBUG_MCP=true
node src/index.js --debug