import { execa } from 'execa';
import { rmSync, existsSync } from 'fs';
import { join } from 'path';
import { afterEach, expect, test } from 'vitest';

const out1 = join(process.cwd(), 'Button.tsx');
const out2 = join(process.cwd(), 'Button.stories.tsx');

afterEach(() => {
  [out1, out2].forEach(f => existsSync(f) && rmSync(f));
});

test('dry run does not write files', async () => {
  await execa('node', ['bin/refraction.js', 'add', 'button', '--dry-run']);
  expect(existsSync(out1)).toBe(false);
  expect(existsSync(out2)).toBe(false);
});

test('writes files with force', async () => {
  await execa('node', ['bin/refraction.js', 'add', 'button', '--force']);
  expect(existsSync(out1)).toBe(true);
  expect(existsSync(out2)).toBe(true);
});
