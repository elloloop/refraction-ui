import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';

export interface WriteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
}

export async function safeWrite(filePath: string, content: string, options: WriteOptions = {}): Promise<void> {
  const spinner = ora(`Writing ${filePath}`).start();
  const exists = await fs.pathExists(filePath);
  if (exists && !options.overwrite) {
    spinner.fail(`File ${filePath} already exists`);
    throw new Error(`File exists: ${filePath}`);
  }
  if (!options.dryRun) {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content);
  }
  spinner.succeed(`Wrote ${filePath}`);
}

export async function safeRead(filePath: string): Promise<string> {
  const spinner = ora(`Reading ${filePath}`).start();
  try {
    const data = await fs.readFile(filePath, 'utf8');
    spinner.succeed(`Read ${filePath}`);
    return data;
  } catch (err) {
    spinner.fail(`Failed to read ${filePath}`);
    throw err;
  }
}
