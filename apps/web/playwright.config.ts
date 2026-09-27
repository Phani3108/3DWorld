import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end: a real browser against a real server (in-memory PGlite).
 * Locally, PW_CHROMIUM can point at any Chromium build if the bundled one isn't installed.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:5180",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    launchOptions: {
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
      ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}),
    },
  },
  webServer: [
    {
      command: "npm run start -w @3dworld/server",
      cwd: "../..",
      url: "http://localhost:4000/v1/health",
      env: { PORT: "4000", CORS_ORIGINS: "http://localhost:5180", RESIDENT_REPLY_DELAY_MS: "0" },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npx vite preview --port 5180 --strictPort",
      url: "http://localhost:5180",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
