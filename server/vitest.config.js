import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Runs before every test file: moves the working directory to a
    // throwaway temp dir so stores that read/write JSON in cwd (and tests
    // that delete those files) never touch a developer's real data.
    setupFiles: ["./__tests__/setup/isolateCwd.js"],
    include: ["__tests__/**/*.test.js"],
  },
});
