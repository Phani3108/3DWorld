/**
 * Load server/.env before any other module reads process.env.
 *
 * Must stay the first import in index.js: ESM evaluates imports in order,
 * and several modules read env at import time. Uses Node's built-in loader
 * (Node ≥ 20.12). Variables already set in the real environment win, so a
 * host dashboard (Render, Fly) can override the file.
 */
import fs from "fs";
import { fileURLToPath } from "url";

const envPath = fileURLToPath(new URL("./.env", import.meta.url));
if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}
