import { Sky, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Color, type DirectionalLight, type HemisphereLight, Object3D, Vector3 } from "three";
import { daylight, sunDirection, sunPosition } from "../../lib/sun.ts";
import { selfPose } from "../../state/store.ts";
import { nightUniform } from "./facadeMaterial.ts";

const TWILIGHT = new Color("#2b3a64");
const NIGHT = new Color("#0d1530");
const DAY_FOG = new Color("#c9d3dc");
const NIGHT_FOG = new Color("#1a2138");

/**
 * Real sun for the district's latitude/longitude at the real current time.
 * Recomputed every 30 s; the shadow frustum follows the player. Nights stay
 * readable: moonlight, a starfield, and (in District) lit windows and street lamps.
 */
export const SunSky = ({
  lat,
  lon,
  timeOverride,
}: {
  lat: number;
  lon: number;
  timeOverride?: Date | undefined;
}) => {
  const [now, setNow] = useState(() => timeOverride ?? new Date());
  useEffect(() => {
    if (timeOverride) {
      setNow(timeOverride);
      return;
    }
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, [timeOverride]);

  const sun = useMemo(() => sunPosition(now, lat, lon), [now, lat, lon]);
  const dir = useMemo(() => {
    const d = sunDirection(sun);
    return new Vector3(d.x, d.y, d.z).normalize();
  }, [sun]);
  const day = daylight(sun.altitude);
  const golden = Math.max(0, 1 - Math.abs(sun.altitude * (180 / Math.PI) - 4) / 14);
  const isDay = dir.y > 0;

  const light = useRef<DirectionalLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const target = useMemo(() => new Object3D(), []);
  const { scene } = useThree();

  useEffect(() => {
    scene.add(target);
    return () => {
      scene.remove(target);
    };
  }, [scene, target]);

  useEffect(() => {
    nightUniform.value = 1 - day;
    scene.background = day > 0.02 ? null : NIGHT.clone().lerp(TWILIGHT, Math.min(1, day * 20));
    if (scene.fog && "color" in scene.fog) {
      (scene.fog.color as Color).copy(DAY_FOG).lerp(NIGHT_FOG, 1 - day);
    }
  }, [scene, day]);

  useFrame(() => {
    const { x, z } = selfPose.current;
    target.position.set(x, 0, z);
    // At night the key light is the moon, high in the opposite sky.
    const src = isDay ? dir : new Vector3(-dir.x, 0.6, -dir.z).normalize();
    light.current?.position.set(x + src.x * 120, src.y * 120, z + src.z * 120);
  });

  const sunColour = useMemo(
    () => new Color("#fff4e0").lerp(new Color("#ffb46b"), golden),
    [golden],
  );
  const moonColour = "#a9bcff";

  return (
    <>
      {day > 0.02 ? (
        <Sky
          distance={4000}
          sunPosition={[dir.x * 100, dir.y * 100, dir.z * 100]}
          turbidity={6 + golden * 4}
          rayleigh={1.2 + golden * 1.5}
          mieCoefficient={0.006}
          mieDirectionalG={0.85}
        />
      ) : (
        <Stars radius={1500} depth={400} count={4000} factor={40} saturation={0} fade speed={0.2} />
      )}
      <hemisphereLight
        ref={hemi}
        color={isDay ? "#cfe3ff" : "#5d6fa8"}
        groundColor={isDay ? "#6b5a45" : "#23232d"}
        intensity={isDay ? 0.35 + day * 0.45 : 0.75}
      />
      <directionalLight
        ref={light}
        target={target}
        color={isDay ? sunColour : moonColour}
        intensity={isDay ? 0.4 + day * 2.6 : 0.55}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-near={1}
        shadow-camera-far={400}
      />
    </>
  );
};
