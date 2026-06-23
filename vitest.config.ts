import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests run the PURE engine in plain Node (no browser, no Next.js).
// The "@/..." alias mirrors tsconfig so tests import the engine the same
// way the app does.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
