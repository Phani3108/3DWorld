import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
  build: { target: "es2022", sourcemap: true },
  test: {
    name: "web",
    environment: "happy-dom",
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
