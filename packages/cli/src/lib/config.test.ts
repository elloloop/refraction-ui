import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import { loadConfig, findConfig } from "./config";
import path from "path";

const cwd = process.cwd();
const tempDir = path.join(cwd, "tmp-test");

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
  }
});

describe("config", () => {
  describe("loadConfig", () => {
    it("loads json config", async () => {
      mkdirSync(tempDir, { recursive: true });
      writeFileSync(
        path.join(tempDir, ".refractionrc.json"),
        JSON.stringify({ cli: { verbose: true } })
      );
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });

    it("loads yaml config", async () => {
      mkdirSync(tempDir, { recursive: true });
      const yamlContent = `
cli:
  verbose: true
tokens:
  input: ./tokens
  output: ./styles
`;
      writeFileSync(path.join(tempDir, ".refractionrc.yaml"), yamlContent);
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
      expect(cfg.tokens?.input).toBe("./tokens");
    });

    it("loads js config", async () => {
      mkdirSync(tempDir, { recursive: true });
      const jsContent = `export default { cli: { verbose: true } };`;
      writeFileSync(path.join(tempDir, ".refractionrc.js"), jsContent);
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });

    it("returns empty object when no config exists", async () => {
      mkdirSync(tempDir, { recursive: true });
      const cfg = await loadConfig(tempDir);
      expect(cfg).toEqual({});
    });

    it("loads config from package.json", async () => {
      mkdirSync(tempDir, { recursive: true });
      writeFileSync(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "test",
          version: "1.0.0",
          refraction: { cli: { verbose: true } },
        })
      );
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });
  });

  describe("findConfig", () => {
    it("finds json config file", async () => {
      mkdirSync(tempDir, { recursive: true });
      writeFileSync(
        path.join(tempDir, ".refractionrc.json"),
        JSON.stringify({})
      );
      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.json");
    });

    it("finds yaml config file", async () => {
      mkdirSync(tempDir, { recursive: true });
      writeFileSync(path.join(tempDir, ".refractionrc.yaml"), "cli: {}");
      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.yaml");
    });

    it("returns null when no config exists", async () => {
      mkdirSync(tempDir, { recursive: true });
      const configPath = await findConfig(tempDir);
      expect(configPath).toBeNull();
    });
  });
});
