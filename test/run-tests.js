import assert from 'assert';
import { loadTokens, buildTokens, generateCSS, generateTailwind } from '../packages/tokens-core/index.js';
import fs from 'fs';
import path from 'path';

const tokenPath = path.join(path.dirname(new URL(import.meta.url).pathname), 'sample-tokens.json');
const tokens = loadTokens(tokenPath);
const built = buildTokens(tokens);

assert.ok(built['default_light'], 'theme+mode key exists');
assert.strictEqual(built['default_light']['global-color-blue-500'], '#3b82f6');
assert.strictEqual(built['default_light']['semantic-fg-default'], 'var(--global-color-blue-500)');
assert.strictEqual(built['default_light']['components-button-primary-bg'], 'var(--semantic-fg-default)');

const css = generateCSS(built);
assert.ok(css.includes('--global-color-blue-500'), 'CSS contains variable');
fs.writeFileSync(path.join(path.dirname(tokenPath), 'tokens.test.css'), css);

const tw = generateTailwind(built);
assert.ok(tw.includes('colors') && tw.includes('blue-500'), 'Tailwind fragment contains colors');
fs.writeFileSync(path.join(path.dirname(tokenPath), 'tailwind.tokens.test.js'), tw);

console.log('All tests passed');
