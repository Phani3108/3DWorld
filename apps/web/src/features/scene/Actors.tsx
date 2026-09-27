import { type Look, MOVEMENT, type Pose, type PublicResident } from "@3dworld/contracts";
import { Html, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { type Group, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { sendPose } from "../../lib/realtime.ts";
import {
  composerDraftAtom,
  currentPose,
  playersAtom,
  poses,
  selfPose,
  sessionAtom,
  thinkingAtom,
  walkTargetAtom,
} from "../../state/store.ts";
import type { Bounds } from "./District.tsx";
import { HumanFigure } from "./HumanFigure.tsx";
import { buildFor } from "./look.ts";

const UP = new Vector3(0, 1, 0);
/** Camera orbit centre height above the player's feet (m). */
const EYE = 2.2;

export const lookFromAvatarId = (
  avatarId: string,
): Pick<Look, "presentation" | "ageBand" | "attire"> => {
  const [, p, age] = avatarId.split("-");
  return {
    presentation: p === "f" ? "feminine" : p === "m" ? "masculine" : "neutral",
    ageBand: age === "young" ? "young-adult" : age === "senior" ? "senior" : "adult",
    attire: "",
  };
};

/** Heading 0 = north (-z), clockwise. Figures are modelled facing +z. */
const yawFor = (heading: number) => Math.PI - heading;

const Label = ({
  text,
  sub,
  height,
}: {
  text: string;
  sub?: string | undefined;
  height: number;
}) => (
  <Html
    position={[0, height + 0.35, 0]}
    center
    distanceFactor={14}
    zIndexRange={[20, 0]}
    style={{ pointerEvents: "none" }}
  >
    <div className="flex flex-col items-center whitespace-nowrap">
      <span className="rounded-md bg-ink/80 px-2 py-0.5 text-[13px] font-semibold text-text ring-1 ring-line">
        {text}
      </span>
      {sub ? <span className="mt-0.5 text-[11px] text-muted">{sub}</span> : null}
    </div>
  </Html>
);

/** Someone driven by server poses (resident or remote player), interpolated. */
const RemoteActor = ({
  id,
  name,
  sub,
  look,
  cityId,
  talking,
  onSelect,
}: {
  id: string;
  name: string;
  sub?: string;
  look: Pick<Look, "presentation" | "ageBand" | "attire">;
  cityId?: string | undefined;
  talking?: boolean;
  onSelect?: () => void;
}) => {
  const group = useRef<Group>(null);
  const speed = useRef(0);
  const last = useRef<{ x: number; z: number } | null>(null);
  const build = useMemo(() => buildFor(id, look, cityId), [id, look, cityId]);
  const anim = useRef<Pose["anim"]>("idle");

  useFrame((_, dt) => {
    const motion = poses.get(id);
    const g = group.current;
    if (!motion || !g) return;
    const p = currentPose(motion);
    g.position.set(p.x, 0, p.z);
    if (talking) {
      // Turn toward the player who asked.
      const self = selfPose.current;
      const face = Math.atan2(self.x - p.x, -(self.z - p.z));
      g.rotation.y = yawFor(face);
    } else {
      g.rotation.y = yawFor(p.heading);
    }
    if (last.current && dt > 0) {
      const v = Math.hypot(p.x - last.current.x, p.z - last.current.z) / dt;
      speed.current = speed.current * 0.8 + Math.min(v, 8) * 0.2;
    }
    last.current = { x: p.x, z: p.z };
    anim.current = p.anim;
  });

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a three.js group, not DOM; the Nearby list is the accessible path.
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <HumanFigure build={build} anim={anim.current} speed={speed} talking={talking ?? false} />
      <Label text={talking ? `${name} · …` : name} sub={sub} height={build.height} />
    </group>
  );
};

export const Residents = ({
  residents,
  cityId,
}: {
  residents: PublicResident[];
  cityId: string;
}) => {
  const thinking = useAtomValue(thinkingAtom);
  const setDraft = useSetAtom(composerDraftAtom);
  return (
    <>
      {residents
        .filter((r) => poses.has(r.id))
        .map((r) => (
          <RemoteActor
            key={r.id}
            id={r.id}
            name={r.name}
            sub={r.role === "host" ? "host" : undefined}
            look={r.look}
            cityId={cityId}
            talking={r.id in thinking}
            onSelect={() => {
              setDraft(`@${r.name} `);
              document.getElementById("composer-input")?.focus();
            }}
          />
        ))}
    </>
  );
};

export const RemotePlayers = () => {
  const players = useAtomValue(playersAtom);
  return (
    <>
      {[...players.values()].map((p) => (
        <RemoteActor key={p.id} id={p.id} name={p.name} look={lookFromAvatarId(p.avatarId)} />
      ))}
    </>
  );
};

const MOVE_KEYS = new Set([
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "shift",
]);
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  !!target.closest("input, textarea, select, [contenteditable='true'], [role='dialog']");

/** The local player: keyboard / click-to-walk, camera follow, 10 Hz pose uplink. */
const clampTo = (bounds: Bounds, x: number, z: number): [number, number] => {
  if ("radius" in bounds) {
    const r = Math.hypot(x, z);
    return r > bounds.radius ? [(x / r) * bounds.radius, (z / r) * bounds.radius] : [x, z];
  }
  const m = 4; // stay off the ragged edge of the mapped area
  return [
    Math.min(bounds.maxX - m, Math.max(bounds.minX + m, x)),
    Math.min(bounds.maxZ - m, Math.max(bounds.minZ + m, z)),
  ];
};

export const SelfPlayer = ({ bounds }: { bounds: Bounds }) => {
  const session = useAtomValue(sessionAtom);
  const [target, setTarget] = useAtom(walkTargetAtom);
  const keys = useRef(new Set<string>());
  const group = useRef<Group>(null);
  const speed = useRef(0);
  const lastSent = useRef({ at: 0, pose: selfPose.current });
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const look = useMemo(
    () => lookFromAvatarId(session?.user.avatarId ?? "body-n-adult"),
    [session?.user.avatarId],
  );
  const build = useMemo(() => buildFor(session?.user.id ?? "me", look), [session?.user.id, look]);
  const anim = useRef<Pose["anim"]>("idle");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (!MOVE_KEYS.has(k)) return;
      keys.current.add(k);
      if (k.startsWith("arrow")) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase());
    const clear = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  // Start the camera low behind the player, so the skyline ahead is in frame.
  useEffect(() => {
    const p = selfPose.current;
    const fx = Math.sin(p.heading);
    const fz = -Math.cos(p.heading);
    camera.position.set(p.x - fx * 11, 3.2, p.z - fz * 11);
    controls.current?.target.set(p.x, EYE, p.z);
    controls.current?.update();
  }, [camera]);

  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);

  useFrame((state, dt) => {
    const k = keys.current;
    const pose = selfPose.current;
    state.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, UP).normalize();

    let dx = 0;
    let dz = 0;
    if (k.has("w") || k.has("arrowup")) {
      dx += forward.x;
      dz += forward.z;
    }
    if (k.has("s") || k.has("arrowdown")) {
      dx -= forward.x;
      dz -= forward.z;
    }
    if (k.has("d") || k.has("arrowright")) {
      dx += right.x;
      dz += right.z;
    }
    if (k.has("a") || k.has("arrowleft")) {
      dx -= right.x;
      dz -= right.z;
    }

    let arrived = false;
    if (dx !== 0 || dz !== 0) {
      if (target) setTarget(null);
    } else if (target) {
      dx = target.x - pose.x;
      dz = target.z - pose.z;
      if (Math.hypot(dx, dz) < 0.6) {
        dx = 0;
        dz = 0;
        arrived = true;
      }
    }
    if (arrived) setTarget(null);

    const len = Math.hypot(dx, dz);
    const running = k.has("shift");
    const v = len > 0 ? (running ? MOVEMENT.runSpeed * 0.9 : 1.6) : 0;
    let { x, z, heading } = pose;
    if (len > 0) {
      const step = Math.min(
        v * Math.min(dt, 0.1),
        target && !k.size ? len : Number.POSITIVE_INFINITY,
      );
      [x, z] = clampTo(bounds, x + (dx / len) * step, z + (dz / len) * step);
      const want = Math.atan2(dx, -dz);
      const turn = Math.atan2(Math.sin(want - heading), Math.cos(want - heading));
      heading += turn * Math.min(1, dt * 10);
    }
    const nextAnim: Pose["anim"] = len > 0 ? (running ? "run" : "walk") : "idle";
    const moved = x !== pose.x || z !== pose.z;
    const next = { x, z, heading, anim: nextAnim };
    if (moved && controls.current) {
      state.camera.position.x += x - pose.x;
      state.camera.position.z += z - pose.z;
      controls.current.target.set(x, EYE, z);
      controls.current.update();
    }
    selfPose.current = next;
    anim.current = nextAnim;
    speed.current = len > 0 ? v : 0;
    group.current?.position.set(x, 0, z);
    if (group.current) group.current.rotation.y = yawFor(heading);

    const now = performance.now();
    const prev = lastSent.current;
    const changed = prev.pose.x !== x || prev.pose.z !== z || prev.pose.anim !== nextAnim;
    if (changed && now - prev.at > 100) {
      sendPose(next);
      lastSent.current = { at: now, pose: next };
    }
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        minDistance={3}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.47}
        enableDamping
      />
      <group ref={group}>
        <HumanFigure build={build} anim={anim.current} speed={speed} />
        <Label text={session?.user.name ?? "You"} sub="you" height={build.height} />
      </group>
    </>
  );
};
