import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/**/*.test.ts", "packages/**/*.test.js"],
    exclude: ["test/**/*", "**/node_modules/**", "**/dist/**"],
  },
});
