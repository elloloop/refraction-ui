import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

describe('refui CLI', () => {
  it('generates a React component with add:component', async () => {
    const tempDir = path.join(__dirname, 'temp-cli');
    await fs.remove(tempDir);
    await fs.ensureDir(tempDir);

    await fs.outputFile(path.join(tempDir, 'package.json'), JSON.stringify({ type: 'module' }));

    await execa('node', [path.join(__dirname, '..', 'dist/index.js'), 'add:component', 'badge'], {
      cwd: tempDir,
    });

    expect(fs.existsSync(path.join(tempDir, 'packages/react/badge/index.tsx'))).toBe(true);
  });
});
