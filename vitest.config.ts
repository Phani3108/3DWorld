import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/contracts", "packages/content", "apps/server", "apps/web"],
  },
});
