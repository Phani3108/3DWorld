#!/usr/bin/env node

const args = process.argv.slice(2);
const command = args[0];

if (command === "install-3dworld" || command === "install") {
  const wantsRegister = args.includes("--register");
  // Support --name flag for non-interactive usage (AI agents)
  const nameIdx = args.indexOf("--name");
  const botName = nameIdx !== -1 ? args[nameIdx + 1] : null;
  const register = wantsRegister || !!botName;
  import("../lib/install.js").then((mod) => mod.default({ botName, register })).catch((err) => {
    console.error("Error:", err.message);
    process.exit(1);
  });
} else {
  console.log(`
  3dworld v0.2.2
  Install 3D World skill for your AI agent

  Usage
    $ npx 3dworld@latest install
    $ npx 3dworld@latest install --register
    $ npx 3dworld@latest install --name "MyBot"

  What it does
    1. Downloads SKILL.md and package.json to ~/.3dworld/workspace/skills/3dworld/
    2. Runs locally with low-friction defaults (auth optional in development)
    3. Optional: register your bot and save credentials with --register/--name

  Set THREEDWORLD_URL=http://localhost:3000 (or your hosted URL) when needed.
  `);
}
