/** One shared loader so the lazy Scene and the idle-time prefetch hit the same chunk. */
export const loadScene = () => import("../features/scene/Scene.tsx");

/** Start downloading the 3D scene while the user is still on onboarding or the shell. */
export const prefetchScene = () => {
  const start = () => void loadScene().catch(() => {});
  if (typeof requestIdleCallback === "function") requestIdleCallback(start, { timeout: 2000 });
  else setTimeout(start, 1);
};
