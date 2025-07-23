import { initProject } from '../src/commands/init';
import fs from 'fs-extra';
import path from 'path';

const testDir = path.join(__dirname, 'temp-init');

beforeEach(async () => {
  await fs.remove(testDir);
  await fs.ensureDir(testDir);
});

describe('refui init', () => {
  it('creates base folder structure', async () => {
    await initProject({ theme: 'default', framework: 'react', cwd: testDir });
    const folders = ['core', 'react', 'angular', 'themes', 'cli', 'playground'];
    for (const folder of folders) {
      expect(fs.existsSync(path.join(testDir, 'packages', folder))).toBe(true);
    }
  });
});
