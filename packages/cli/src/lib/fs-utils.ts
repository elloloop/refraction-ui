import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { findConfig as findConfigFile } from "./config";

export interface WriteOptions {
  overwrite?: boolean;
  dryRun?: boolean;
}

function log(symbol: string, message: string) {
  console.log(`${symbol} ${message}`);
}

export async function safeWrite(
  filePath: string,
  content: string,
  options: WriteOptions = {}
): Promise<void> {
  log("-", `Writing ${filePath}`);
  const exists = existsSync(filePath);
  if (exists && !options.overwrite) {
    log("✖", `File ${filePath} already exists`);
    throw new Error(`File exists: ${filePath}`);
  }
  if (!options.dryRun) {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  }
  log("✔", `Wrote ${filePath}`);
}

export async function safeRead(filePath: string): Promise<string> {
  log("-", `Reading ${filePath}`);
  try {
    const data = readFileSync(filePath, "utf8");
    log("✔", `Read ${filePath}`);
    return data;
  } catch (err) {
    log("✖", `Failed to read ${filePath}`);
    throw err;
  }
}

export async function findConfig(
  startDir: string = process.cwd()
): Promise<string | null> {
  return findConfigFile(startDir);
}
