import { afterEach, describe, expect, it } from 'vitest';
import fs from 'fs-extra';
import { loadConfig } from './config';
import path from 'path';

const cwd = process.cwd();
const tempDir = path.join(cwd, 'tmp-test');

afterEach(async () => {
  await fs.remove(tempDir);
});

describe('loadConfig', () => {
  it('loads json config', async () => {
    await fs.ensureDir(tempDir);
    await fs.writeJson(path.join(tempDir, '.refractionrc.json'), { cli: { verbose: true } });
    const cfg = await loadConfig(tempDir);
    expect(cfg.cli?.verbose).toBe(true);
  });
});
