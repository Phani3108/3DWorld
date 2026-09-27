import type { AvatarOption, WorldSnapshot } from "@3dworld/contracts";
import { DisplayName } from "@3dworld/contracts";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { useId, useState } from "react";
import { api } from "../../lib/api.ts";
import { cityClock } from "../../lib/cityTime.ts";
import { placeAtom, sessionAtom } from "../../state/store.ts";

const Step = ({
  n,
  of,
  title,
  children,
}: {
  n: number;
  of: number;
  title: string;
  children: React.ReactNode;
}) => (
  <section aria-labelledby="onboarding-title" className="panel mx-auto w-full max-w-2xl p-6 sm:p-8">
    <p className="text-sm text-muted">
      Step {n} of {of}
    </p>
    <h1 id="onboarding-title" className="mt-1 font-display text-3xl font-semibold tracking-tight">
      {title}
    </h1>
    <div className="mt-6">{children}</div>
  </section>
);

export const Onboarding = ({ world }: { world: WorldSnapshot }) => {
  const setSession = useSetAtom(sessionAtom);
  const setPlace = useSetAtom(placeAtom);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [avatarId, setAvatarId] = useState<string>("body-n-adult");
  const [cityId, setCityId] = useState<string>(world.cities[0]?.id ?? "hyderabad");
  const nameId = useId();
  const avatars = useQuery({ queryKey: ["avatars"], queryFn: api.avatars });
  const nameCheck = DisplayName.safeParse(name);
  const city = world.cities.find((c) => c.id === cityId) ?? world.cities[0];
  const district =
    city?.districts.find((d) => d.id === city.defaultDistrictId) ?? city?.districts[0];

  const create = useMutation({
    mutationFn: () => api.createSession(nameCheck.success ? nameCheck.data : name, avatarId),
    onSuccess: (res) => {
      if (city && district) setPlace({ cityId: city.id, districtId: district.id });
      setSession({ token: res.token, user: res.user });
    },
  });

  return (
    <main className="flex min-h-full items-center bg-[radial-gradient(ellipse_at_top,#26304f_0%,#10131f_60%)] px-4 py-10">
      {step === 1 && (
        <Step n={1} of={3} title="Who's arriving?">
          <label htmlFor={nameId} className="block text-sm font-semibold">
            Your name in the city
          </label>
          <input
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoComplete="nickname"
            className="tap mt-2 w-full rounded-xl border border-line bg-ink px-4 text-lg"
            aria-describedby={`${nameId}-hint`}
          />
          <p id={`${nameId}-hint`} className="mt-2 text-sm text-muted">
            {name && !nameCheck.success
              ? nameCheck.error.issues[0]?.message
              : "Up to 24 letters, any language."}
          </p>

          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">How you look</legend>
            <p className="mt-1 text-sm text-muted">
              Realistic bodies are on the way — these are stand-ins.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(avatars.data?.avatars ?? []).map((a: AvatarOption) => (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={avatarId === a.id}
                  onClick={() => setAvatarId(a.id)}
                  className={`tap rounded-xl border px-3 py-3 text-left text-sm ${
                    avatarId === a.id
                      ? "border-amber bg-amber/10"
                      : "border-line bg-ink hover:border-muted"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!nameCheck.success}
              onClick={() => setStep(2)}
              className="tap rounded-xl bg-amber px-6 font-semibold text-amber-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </Step>
      )}

      {step === 2 && (
        <Step n={2} of={3} title="Pick a city">
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="sr-only">Cities</legend>
            {world.cities.map((c) => (
              <label
                key={c.id}
                className={`tap cursor-pointer rounded-xl border p-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-teal ${
                  cityId === c.id
                    ? "border-amber bg-amber/10"
                    : "border-line bg-ink hover:border-muted"
                }`}
              >
                <input
                  type="radio"
                  name="city"
                  value={c.id}
                  checked={cityId === c.id}
                  onChange={() => setCityId(c.id)}
                  className="sr-only"
                />
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-lg font-semibold">
                    <span aria-hidden="true">{c.emoji}</span> {c.name}
                  </span>
                  <span className="text-sm text-muted">{cityClock(c.timezone)} local</span>
                </span>
                <span className="mt-1 block text-sm text-muted">{c.tagline}</span>
              </label>
            ))}
          </fieldset>
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="tap rounded-xl px-4 text-muted hover:text-text"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="tap rounded-xl bg-amber px-6 font-semibold text-amber-ink"
            >
              Next
            </button>
          </div>
        </Step>
      )}

      {step === 3 && city && district && (
        <Step n={3} of={3} title={`You'll arrive in ${district.name}`}>
          <p className="text-lg">{district.blurb}</p>
          <ul className="mt-4 space-y-1 text-muted">
            <li>
              It's {cityClock(city.timezone)} in {city.name} — the sun in the city is the real sun.
            </li>
            <li>Walk with W A S D or the arrow keys, or click the ground. Hold Shift to run.</li>
            <li>Talk to anyone: type @ and their name. Residents are AI characters.</li>
          </ul>
          {create.isError ? (
            <p role="alert" className="mt-4 text-rose">
              Couldn't reach the city server. Is it running? ({String(create.error.message)})
            </p>
          ) : null}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="tap rounded-xl px-4 text-muted hover:text-text"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => create.mutate()}
              disabled={create.isPending}
              className="tap rounded-xl bg-amber px-6 font-semibold text-amber-ink disabled:opacity-50"
            >
              {create.isPending ? "Arriving…" : `Enter ${city.name}`}
            </button>
          </div>
        </Step>
      )}
    </main>
  );
};
