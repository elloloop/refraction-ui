import { afterEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import { loadConfig, findConfig } from "./config";
import path from "path";

const cwd = process.cwd();
const tempDir = path.join(cwd, "tmp-test");

afterEach(async () => {
  await fs.remove(tempDir);
});

describe("config", () => {
  describe("loadConfig", () => {
    it("loads json config", async () => {
      await fs.ensureDir(tempDir);
      await fs.writeJson(path.join(tempDir, ".refractionrc.json"), {
        cli: { verbose: true },
      });
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });

    it("loads yaml config", async () => {
      await fs.ensureDir(tempDir);
      const yamlContent = `
cli:
  verbose: true
tokens:
  input: ./tokens
  output: ./styles
`;
      await fs.writeFile(path.join(tempDir, ".refractionrc.yaml"), yamlContent);
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
      expect(cfg.tokens?.input).toBe("./tokens");
    });

    it("loads js config", async () => {
      await fs.ensureDir(tempDir);
      const jsContent = `module.exports = { cli: { verbose: true } };`;
      await fs.writeFile(path.join(tempDir, ".refractionrc.js"), jsContent);
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });

    it("returns empty object when no config exists", async () => {
      await fs.ensureDir(tempDir);
      const cfg = await loadConfig(tempDir);
      expect(cfg).toEqual({});
    });

    it("loads config from package.json", async () => {
      await fs.ensureDir(tempDir);
      const packageJson = {
        name: "test",
        version: "1.0.0",
        refraction: {
          cli: { verbose: true },
        },
      };
      await fs.writeJson(path.join(tempDir, "package.json"), packageJson);
      const cfg = await loadConfig(tempDir);
      expect(cfg.cli?.verbose).toBe(true);
    });
  });

  describe("findConfig", () => {
    it("finds json config file", async () => {
      await fs.ensureDir(tempDir);
      await fs.writeJson(path.join(tempDir, ".refractionrc.json"), {});
      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.json");
    });

    it("finds yaml config file", async () => {
      await fs.ensureDir(tempDir);
      await fs.writeFile(path.join(tempDir, ".refractionrc.yaml"), "cli: {}");
      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.yaml");
    });

    it("returns null when no config exists", async () => {
      await fs.ensureDir(tempDir);
      const configPath = await findConfig(tempDir);
      expect(configPath).toBeNull();
    });
  });
});
