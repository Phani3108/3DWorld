import { loadWorld, validateWorld } from "../src/index.ts";

const world = loadWorld();
const { errors, warnings, stats } = validateWorld(world);

console.log(`content ${world.version}`);
console.log(
  Object.entries(stats)
    .map(([k, v]) => `  ${k.padEnd(18)} ${v}`)
    .join("\n"),
);
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${errors.length} error(s), ${warnings.length} warning(s)`);
process.exitCode = errors.length > 0 ? 1 : 0;
