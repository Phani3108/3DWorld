import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
  build: {
    target: "es2022",
    sourcemap: true,
    // three.js alone is ~700 kB minified and only loads with the lazy 3D scene;
    // the first-load entry stays well under this.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Split the scene's vendors so they download in parallel and three.js stays
        // cached across deploys (it changes far less often than our scene code).
        codeSplitting: {
          // Only the matched packages; pulling their deps along would drag react-dom
          // out of the entry and make these lazy chunks load up front.
          includeDependenciesRecursively: false,
          groups: [
            { name: "three", test: /node_modules[\\/]three[\\/]/ },
            {
              name: "postfx",
              test: /node_modules[\\/](postprocessing|n8ao|@react-three[\\/]postprocessing)[\\/]/,
            },
            {
              name: "r3f",
              test: /node_modules[\\/](@react-three|three-stdlib|maath|its-fine)[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    name: "web",
    environment: "happy-dom",
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
