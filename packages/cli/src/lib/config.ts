import { cosmiconfig } from 'cosmiconfig';
import path from 'path';

export interface RefractionConfig {
  tokens?: Record<string, unknown>;
  components?: Record<string, unknown>;
  cli?: {
    verbose?: boolean;
    dryRun?: boolean;
  };
}

export async function loadConfig(startDir: string = process.cwd()): Promise<RefractionConfig> {
  const explorer = cosmiconfig('refraction');
  const result = await explorer.search(startDir);
  if (result && result.config) {
    return result.config as RefractionConfig;
  }
  return {};
}

export async function findConfig(startDir: string = process.cwd()): Promise<string | null> {
  const explorer = cosmiconfig('refraction');
  const result = await explorer.search(startDir);
  return result ? path.resolve(result.filepath) : null;
}
