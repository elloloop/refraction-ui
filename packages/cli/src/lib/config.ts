import { cosmiconfig } from "cosmiconfig";
import path from "path";

export interface RefractionConfig {
  tokens?: {
    input?: string;
    output?: string;
    format?: string;
  };
  components?: {
    output?: string;
    engine?: string;
  };
  cli?: {
    verbose?: boolean;
    dryRun?: boolean;
  };
}

export async function loadConfig(
  startDir: string = process.cwd()
): Promise<RefractionConfig> {
  const explorer = cosmiconfig("refraction", {
    searchPlaces: [
      "package.json",
      ".refractionrc",
      ".refractionrc.json",
      ".refractionrc.yaml",
      ".refractionrc.yml",
      ".refractionrc.js",
      ".refractionrc.cjs",
      "refraction.config.js",
      "refraction.config.cjs",
    ],
  });

  const result = await explorer.search(startDir);
  if (result && result.config) {
    return result.config as RefractionConfig;
  }
  return {};
}

export async function findConfig(
  startDir: string = process.cwd()
): Promise<string | null> {
  const explorer = cosmiconfig("refraction");
  const result = await explorer.search(startDir);
  return result ? path.resolve(result.filepath) : null;
}
