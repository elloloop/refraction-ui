import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import readline from 'node:readline';

test('add_component via stdio', async (t) => {
  const child = spawn('node', ['src/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: { ...process.env, MCP_TOKEN: 'secret' }
  });
  const rl = readline.createInterface({ input: child.stdout });
  const msg = { jsonrpc: '2.0', id: 1, method: 'add_component', params: { component: 'Button', authToken: 'secret' } };
  const lines = [];
  rl.on('line', line => lines.push(line));
  await once(rl, 'line'); // server ready
  child.stdin.write(JSON.stringify(msg) + '\n');
  await once(rl, 'line');
  await once(rl, 'line');
  const response = JSON.parse(lines[2]);
  assert.equal(response.result.success, true);
  child.kill();
  await once(child, 'exit');
});
