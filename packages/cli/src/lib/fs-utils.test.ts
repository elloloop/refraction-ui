import { afterEach, describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { safeWrite, safeRead, findConfig } from "./fs-utils";
import path from "path";

const cwd = process.cwd();
const tempDir = path.join(cwd, "tmp-test-fs");

afterEach(() => {
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true });
  }
});

describe("fs-utils", () => {
  describe("safeWrite", () => {
    it("creates a new file successfully", async () => {
      mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, "test.txt");
      await safeWrite(filePath, "test content");
      expect(readFileSync(filePath, "utf8")).toBe("test content");
    });

    it("throws error when file exists and overwrite is false", async () => {
      mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, "test.txt");
      writeFileSync(filePath, "existing content");

      await expect(
        safeWrite(filePath, "new content", { overwrite: false })
      ).rejects.toThrow("File exists:");
    });

    it("overwrites file when overwrite is true", async () => {
      mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, "test.txt");
      writeFileSync(filePath, "existing content");

      await safeWrite(filePath, "new content", { overwrite: true });
      expect(readFileSync(filePath, "utf8")).toBe("new content");
    });

    it("does not write file when dryRun is true", async () => {
      mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, "test.txt");

      await safeWrite(filePath, "test content", { dryRun: true });
      expect(existsSync(filePath)).toBe(false);
    });
  });

  describe("safeRead", () => {
    it("reads file content successfully", async () => {
      mkdirSync(tempDir, { recursive: true });
      const filePath = path.join(tempDir, "test.txt");
      writeFileSync(filePath, "test content");

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
      mkdirSync(tempDir, { recursive: true });
      writeFileSync(
        path.join(tempDir, ".refractionrc.json"),
        JSON.stringify({ cli: { verbose: true } })
      );

      const configPath = await findConfig(tempDir);
      expect(configPath).toContain(".refractionrc.json");
    });

    it("returns null when no config file exists", async () => {
      mkdirSync(tempDir, { recursive: true });

      const configPath = await findConfig(tempDir);
      expect(configPath).toBeNull();
    });
  });
});
