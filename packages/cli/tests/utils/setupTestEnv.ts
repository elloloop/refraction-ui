import fs from 'fs-extra';
import path from 'path';

export async function setupTempDir(name: string) {
  const dir = path.join(__dirname, `temp-${name}`);
  await fs.remove(dir);
  await fs.ensureDir(dir);
  return dir;
}
