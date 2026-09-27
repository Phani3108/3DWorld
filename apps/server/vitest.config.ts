import { defineProject } from "vitest/config";

export default defineProject({
  test: { name: "server", include: ["test/**/*.test.ts"], testTimeout: 15_000 },
});
