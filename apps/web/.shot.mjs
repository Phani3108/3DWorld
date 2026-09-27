// Headless render check: onboard a guest via the API, seed localStorage, screenshot the scene.
import { chromium } from "@playwright/test";

const [, , url = "http://localhost:5180/", out = "shot.png"] = process.argv;
const res = await fetch("http://localhost:4000/v1/session", {
  method: "POST",
  headers: { "content-type": "application/json", origin: "http://localhost:5180" },
  body: JSON.stringify({ name: "Headless", avatarId: "body-m-adult" }),
});
const session = await res.json();
const browser = await chromium.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-mac-arm64/chrome-headless-shell", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
const logs = [];
page.on("console", (m) => { if (!m.text().includes("synchronously unmount")) logs.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
const [cityId, districtId] = (process.env.PLACE ?? "hyderabad:hyd-old-city").split(":");
const place = { cityId, districtId };
await page.addInitScript(([s, place]) => {
  localStorage.setItem("3dworld.session.v1", JSON.stringify({ token: s.token, user: s.user }));
  localStorage.setItem("3dworld.place.v1", JSON.stringify(place));
}, [session, place]);
await page.goto(url);
await page.waitForTimeout(9000);
const info = await page.evaluate(() => {
  const t = window.__three;
  const c = document.querySelector("canvas");
  if (!t) return { three: false, canvases: document.querySelectorAll("canvas").length, cw: c?.width, ch: c?.height, main: document.querySelector("main")?.innerText.slice(0, 200), gl: !!c?.getContext("webgl2") };
  let meshes = 0, instanced = 0;
  t.scene.traverse((o) => { if (o.isMesh) meshes++; if (o.isInstancedMesh) instanced++; });
  return { three: true, children: t.scene.children.length, meshes, instanced, cam: t.camera.position.toArray().map((v) => +v.toFixed(1)), calls: t.gl.info.render.calls, tris: t.gl.info.render.triangles };
});
await page.screenshot({ path: out });
console.log(JSON.stringify(info));
console.log(logs.slice(0, 12).join("\n"));
await browser.close();
