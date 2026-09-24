import fs from "fs";
import os from "os";
import path from "path";

// Stores such as conversationLog.js and questService.js persist to JSON
// files relative to process.cwd(), and some suites delete those files to
// reset state. Point cwd at a fresh temp dir so that never hits real data.
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "3dworld-test-"));
process.chdir(dir);

// Tests must never reach a real LLM, whatever the developer's shell has.
delete process.env.ANTHROPIC_API_KEY;
delete process.env.LLM_API_KEY;
process.env.LLM_PROVIDER = process.env.LLM_PROVIDER || "stub";
