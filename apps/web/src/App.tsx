import { useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { Onboarding } from "./features/onboarding/Onboarding.tsx";
import { WorldShell } from "./features/shell/WorldShell.tsx";
import { ApiError, api } from "./lib/api.ts";
import { prefetchScene } from "./lib/loadScene.ts";
import { sessionAtom } from "./state/store.ts";

export const App = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const world = useQuery({ queryKey: ["world"], queryFn: api.world, staleTime: 5 * 60_000 });
  const me = useQuery({
    queryKey: ["me", session?.token],
    queryFn: () => api.me(session!.token),
    enabled: !!session,
    retry: false,
  });

  // The 3D scene is ~1.3 MB; fetch it while the world list and onboarding load.
  useEffect(prefetchScene, []);

  // A stored guest the server no longer knows (e.g. a fresh dev database) → start over.
  useEffect(() => {
    if (me.error instanceof ApiError && me.error.status === 401) setSession(null);
  }, [me.error, setSession]);

  if (world.isError) {
    return (
      <main className="grid h-full place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-semibold">The city server isn't answering</h1>
          <p className="mt-2 text-muted">Start it with `npm run dev:server`, then reload.</p>
        </div>
      </main>
    );
  }
  if (!world.data) {
    return <main className="grid h-full place-items-center text-muted">Loading 3D World…</main>;
  }
  if (!session) return <Onboarding world={world.data} />;
  return <WorldShell world={world.data} />;
};
