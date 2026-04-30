import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * TrafficSignal — Phase 10B.
 *
 * 3-light pole rendered at every road intersection. Phase cycles
 *   green (5s) → yellow (1s) → red (4s)  = 10 s loop
 * synchronised to wall-clock time so every client sees the same colour
 * without server broadcast. The intersection's `[x, z]` grid position
 * also seeds a small phase offset (cells far apart get out-of-sync
 * cycles, which feels like a real city's coordinated grid).
 *
 * Phases reach the GPU via material `emissiveIntensity` swaps —
 * meshStandardMaterial gives the lit bulb a warm halo, while the
 * inactive bulbs sit at 0.05 emissive (just visible at night, dark
 * in daylight).
 */

const PHASES = [
  { name: "green",  durationMs: 5000 },
  { name: "yellow", durationMs: 1000 },
  { name: "red",    durationMs: 4000 },
];
const CYCLE_MS = PHASES.reduce((sum, p) => sum + p.durationMs, 0);

const phaseAt = (now) => {
  const t = now % CYCLE_MS;
  let acc = 0;
  for (const p of PHASES) {
    acc += p.durationMs;
    if (t < acc) return p.name;
  }
  return "green";
};

/** Stable per-intersection offset based on grid coordinates. */
const offsetFor = ([x, z]) => ((x * 7 + z * 13) % CYCLE_MS);

const Bulb = ({ on, color, pos }) => {
  return (
    <mesh position={pos} raycast={() => null}>
      <sphereGeometry args={[0.15, 16, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={on ? 1.4 : 0.05}
        roughness={0.4}
      />
    </mesh>
  );
};

export const TrafficSignal = ({ at, div = 2 }) => {
  // Position in world units — divide grid coords by gridDivision (same
  // convention as venue tints + Roads.jsx). No useGrid → avoids the
  // +0.25 centring offset baked into that helper.
  const v = useMemo(
    () => ({ x: at[0] / div, z: at[1] / div }),
    [at, div],
  );
  const offset = useMemo(() => offsetFor(at), [at]);
  const greenRef  = useRef();
  const yellowRef = useRef();
  const redRef    = useRef();

  // Update emissive intensity each frame — cheap because there are at
  // most 9 signals per city and Howl/three only flushes uniforms when
  // values actually change.
  useFrame(() => {
    const phase = phaseAt(Date.now() + offset);
    if (greenRef.current)  greenRef.current.emissiveIntensity  = phase === "green"  ? 1.4 : 0.05;
    if (yellowRef.current) yellowRef.current.emissiveIntensity = phase === "yellow" ? 1.4 : 0.05;
    if (redRef.current)    redRef.current.emissiveIntensity    = phase === "red"    ? 1.4 : 0.05;
  });

  return (
    <group position={[v.x, 0, v.z]}>
      {/* Pole */}
      <mesh position={[0, 1.5, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.06, 0.08, 3, 8]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>
      {/* Housing */}
      <mesh position={[0, 3.0, 0]} raycast={() => null}>
        <boxGeometry args={[0.45, 1.1, 0.45]} />
        <meshStandardMaterial color="#0f172a" roughness={0.85} />
      </mesh>
      {/* Bulbs — top to bottom: red, yellow, green */}
      <mesh ref={redRef}    position={[0, 3.4, 0.24]} raycast={() => null}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.05} />
      </mesh>
      <mesh ref={yellowRef} position={[0, 3.0, 0.24]} raycast={() => null}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.05} />
      </mesh>
      <mesh ref={greenRef}  position={[0, 2.6, 0.24]} raycast={() => null}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
};

export default TrafficSignal;
