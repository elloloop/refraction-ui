import { afterEach, describe, expect, it } from "vitest";
import fs from "fs-extra";
import { safeWrite, safeRead, findConfig } from "./fs-utils";
import path from "path";

const cwd = process.cwd();
const tempDir = path.join(cwd, "tmp-test-fs");

afterEach(async () => {
  await fs.remove(tempDir);
});

describe("fs-utils", () => {
  describe("safeWrite", () => {
    it("creates a new file successfully", async () => {
      await fs.ensureDir(tempDir);
      const filePath = path.join(tempDir, "test.txt");
      await safeWrite(filePath, "test content");
      expect(await fs.readFile(filePath, "utf8")).toBe("test content");
    });

    it("throws error when file exists and overwrite is false", async () => {
      await fs.ensureDir(tempDir);
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "existing content");

      await expect(
        safeWrite(filePath, "new content", { overwrite: false })
      ).rejects.toThrow("File exists:");
    });

    it("overwrites file when overwrite is true", async () => {
      await fs.ensureDir(tempDir);
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "existing content");

      await safeWrite(filePath, "new content", { overwrite: true });
      expect(await fs.readFile(filePath, "utf8")).toBe("new content");
    });

    it("does not write file when dryRun is true", async () => {
      await fs.ensureDir(tempDir);
      const filePath = path.join(tempDir, "test.txt");

      await safeWrite(filePath, "test content", { dryRun: true });
      expect(await fs.pathExists(filePath)).toBe(false);
    });
  });

  describe("safeRead", () => {
    it("reads file content successfully", async () => {
      await fs.ensureDir(tempDir);
      const filePath = path.join(tempDir, "test.txt");
      await fs.writeFile(filePath, "test content");

      const content = await safeRead(filePath);
      expect(content).toBe("test content");
    });

    it("throws error when file does not exist", async () => {
      const filePath = path.join(tempDir, "nonexistent.txt");

      await expect(safeRead(filePath)).rejects.toThrow();
    });
  });

  describe("findConfig", () => {
    it("finds config file in current directory", async () => {
      await fs.ensureDir(tempDir);
      await fs.writeJson(path.join(tempDir, ".refractionrc.json"), {
        cli: { verbose: true },
      });

      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.json");
    });

    it("returns null when no config file exists", async () => {
      await fs.ensureDir(tempDir);

      const configPath = await findConfig(tempDir);
      expect(configPath).toBeNull();
    });
  });
});
