import { useMutation, useQuery } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { api } from "../../lib/api.ts";
import { disconnect } from "../../lib/realtime.ts";
import { sessionAtom } from "../../state/store.ts";

export const MePanel = () => {
  const [session, setSession] = useAtom(sessionAtom);
  const avatars = useQuery({ queryKey: ["avatars"], queryFn: api.avatars });
  const change = useMutation({
    mutationFn: (avatarId: string) => api.updateMe(session!.token, { avatarId }),
    onSuccess: (res) => session && setSession({ ...session, user: res.user }),
  });
  if (!session) return null;
  return (
    <div className="h-full space-y-4 overflow-y-auto pr-1">
      <div>
        <p className="text-sm text-muted">Signed in as a guest</p>
        <p className="font-display text-2xl font-semibold">{session.user.name}</p>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Look</legend>
        <p className="text-sm text-muted">Takes effect for others when you next enter a place.</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(avatars.data?.avatars ?? []).map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={session.user.avatarId === a.id}
              onClick={() => change.mutate(a.id)}
              className={`tap rounded-xl border px-3 text-left text-sm ${
                session.user.avatarId === a.id
                  ? "border-amber bg-amber/10"
                  : "border-line hover:border-muted"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className="tap rounded-xl border border-line px-4 text-sm hover:border-rose hover:text-rose"
        onClick={() => {
          disconnect();
          setSession(null);
        }}
      >
        Leave and forget this guest
      </button>
    </div>
  );
};
