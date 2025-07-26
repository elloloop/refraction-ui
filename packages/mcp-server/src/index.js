import { createInterface } from 'node:readline';
import { WebSocketServer } from 'ws';
import {
  add_component,
  upgrade_component,
  build_tokens,
  validate_tokens,
  init_project,
  a11y_test,
} from './cli-tools.js';
import {
  addComponentSchema,
  upgradeComponentSchema,
  buildTokensSchema,
  validateTokensSchema,
  initProjectSchema,
  a11yTestSchema,
} from './schemas.js';

const AUTH_TOKEN = process.env.MCP_TOKEN || 'secret';

const methods = {
  add_component: [addComponentSchema, add_component],
  upgrade_component: [upgradeComponentSchema, upgrade_component],
  build_tokens: [buildTokensSchema, build_tokens],
  validate_tokens: [validateTokensSchema, validate_tokens],
  init_project: [initProjectSchema, init_project],
  a11y_test: [a11yTestSchema, a11y_test],
};

function handleRpc(request, respond) {
  if (request.jsonrpc !== '2.0' || !request.method) {
    return respond({ jsonrpc: '2.0', id: request.id || null, error: { code: -32600, message: 'Invalid Request' } });
  }
  const entry = methods[request.method];
  if (!entry) {
    return respond({ jsonrpc: '2.0', id: request.id || null, error: { code: -32601, message: 'Method not found' } });
  }
  const [schema, fn] = entry;
  try {
    const params = schema.parse(request.params);
    if (params.authToken !== AUTH_TOKEN) {
      return respond({ jsonrpc: '2.0', id: request.id || null, error: { code: -32000, message: 'Unauthorized' } });
    }
    fn(params).then(result => {
      respond({ jsonrpc: '2.0', id: request.id || null, result });
    }).catch(err => {
      respond({ jsonrpc: '2.0', id: request.id || null, error: { code: -32001, message: err.message } });
    });
  } catch (e) {
    respond({ jsonrpc: '2.0', id: request.id || null, error: { code: -32602, message: e.message } });
  }
}

export function startStdioServer() {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: false });
  rl.on('line', line => {
    if (!line.trim()) return;
    try {
      const msg = JSON.parse(line);
      handleRpc(msg, resp => {
        process.stdout.write(JSON.stringify(resp) + '\n');
      });
    } catch (err) {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n');
    }
  });
  console.log('MCP stdio server ready');
}

export function startWebSocketServer(port = 8123) {
  const wss = new WebSocketServer({ port });
  wss.on('connection', ws => {
    ws.on('message', data => {
      try {
        const msg = JSON.parse(data.toString());
        handleRpc(msg, resp => ws.send(JSON.stringify(resp)));
      } catch {
        ws.send(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
      }
    });
  });
  console.log('MCP WebSocket server listening on', port);
  return wss;
}

if (process.argv[2] === 'ws') {
  startWebSocketServer(process.env.PORT ? Number(process.env.PORT) : 8123);
} else {
  startStdioServer();
}
