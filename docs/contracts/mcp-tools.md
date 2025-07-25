# MCP Tools (Model Context Protocol)

Server: `@refraction-ui/mcp-server`

## Tools

### generate_component
Input: spec (name, states, variants).  
Output: files (tsx, test, story), meta.

### scaffold_flow
Input: flow type (auth, settings), options.  
Output: pages, routes, state wiring.

### convert_tokens
Input: foreign token JSON.  
Output: normalized refraction-tokens.json and CSS vars.

### a11y_check
Input: glob or component name.  
Output: list of violations and suggestions.

### upgrade_component
Input: local path and target version.  
Output: patch or diff.

### docs_lookup
Input: component name.  
Output: MDX snippet and links.

## Transport
- JSON-RPC 2.0 over stdio or WebSocket.
- Streaming for large payloads.
- Zod schemas shared between client and server.

## Security
- Root-dir sandbox, dry-run mode.
- Allow or deny list for write operations.
