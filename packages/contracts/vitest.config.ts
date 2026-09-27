import { defineProject } from "vitest/config";

export default defineProject({ test: { name: "contracts", include: ["test/**/*.test.ts"] } });
