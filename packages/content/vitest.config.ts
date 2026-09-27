import { defineProject } from "vitest/config";

export default defineProject({ test: { name: "content", include: ["test/**/*.test.ts"] } });
