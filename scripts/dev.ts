// Runs the server and the web app together with prefixed output. Ctrl-C stops both.
import { spawn } from "node:child_process";

const run = (name: string, colour: number, args: string[]) => {
  const child = spawn("npm", args, { stdio: ["ignore", "pipe", "pipe"], env: process.env });
  const tag = `\x1b[${colour}m${name.padEnd(6)}\x1b[0m`;
  const pipe = (stream: NodeJS.ReadableStream) =>
    stream.on("data", (chunk: Buffer) => {
      for (const line of chunk.toString().split("\n"))
        if (line.trim()) console.log(`${tag} ${line}`);
    });
  pipe(child.stdout);
  pipe(child.stderr);
  return child;
};

const children = [
  run("server", 36, ["run", "dev", "-w", "@3dworld/server"]),
  run("web", 33, ["run", "dev", "-w", "@3dworld/web"]),
];
const stop = () => {
  for (const c of children) c.kill("SIGTERM");
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
for (const c of children) c.on("exit", (code) => code && code !== 0 && stop());
