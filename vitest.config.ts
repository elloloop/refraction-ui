import { defineConfig } from "vitest/config";

import path from "node:path";

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@refraction-ui\/([^/]+)(.*)$/,
        replacement: path.resolve(__dirname, "./packages/$1/src$2")
      }
    ]
  },
  test: {
    environment: "node",
    passWithNoTests: true,
    include: ["**/*.test.ts", "**/*.test.js", "**/*.test.tsx"],
    exclude: ["test/**/*", "**/node_modules/**", "**/dist/**"],
  },
});
