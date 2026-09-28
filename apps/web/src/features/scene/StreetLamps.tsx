import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  type InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { nightUniform } from "./facadeMaterial.ts";

export type Lamp = { x: number; z: number };

const POLE_HEIGHT = 6;

const glowTexture = () => {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.45)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
};

/**
 * Sodium-warm street lamps: instanced poles and heads, plus additive light
 * pools on the ground instead of hundreds of real lights. They fade in with
 * the real sunset.
 */
export const StreetLamps = ({ lamps }: { lamps: Lamp[] }) => {
  const poles = useRef<InstancedMesh>(null);
  const heads = useRef<InstancedMesh>(null);
  const pools = useRef<InstancedMesh>(null);
  const headMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#3a3a3a", emissive: "#ffbf73", emissiveIntensity: 0 }),
    [],
  );
  const poolMaterial = useMemo(
    () =>
      new MeshBasicMaterial({
        map: glowTexture(),
        color: "#ffb35c",
        transparent: true,
        opacity: 0,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useLayoutEffect(() => {
    const m = new Matrix4();
    lamps.forEach((l, i) => {
      poles.current?.setMatrixAt(i, m.makeTranslation(l.x, POLE_HEIGHT / 2, l.z));
      heads.current?.setMatrixAt(i, m.makeTranslation(l.x, POLE_HEIGHT, l.z));
      pools.current?.setMatrixAt(i, m.makeRotationX(-Math.PI / 2).setPosition(l.x, 0.2, l.z));
    });
    for (const mesh of [poles.current, heads.current, pools.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [lamps]);

  useFrame(() => {
    const night = nightUniform.value;
    headMaterial.emissiveIntensity = night * 6;
    poolMaterial.opacity = night * 0.45;
    if (pools.current) pools.current.visible = night > 0.05;
  });

  return (
    <group>
      <instancedMesh ref={poles} args={[undefined, undefined, lamps.length]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, POLE_HEIGHT, 6]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.6} metalness={0.4} />
      </instancedMesh>
      <instancedMesh ref={heads} args={[undefined, headMaterial, lamps.length]}>
        <boxGeometry args={[0.5, 0.18, 0.3]} />
      </instancedMesh>
      <instancedMesh ref={pools} args={[undefined, poolMaterial, lamps.length]} renderOrder={1}>
        <planeGeometry args={[16, 16]} />
      </instancedMesh>
    </group>
  );
};

/** Lamps every `spacing` metres along sidewalk strips, inside `radius`. */
export const lampsAlong = (
  strips: Array<{ x: number; z: number; length: number; rot: number }>,
  radius: number,
  spacing = 28,
): Lamp[] => {
  const out: Lamp[] = [];
  for (const s of strips) {
    const dx = Math.sin(s.rot);
    const dz = Math.cos(s.rot);
    for (let t = -s.length / 2; t <= s.length / 2; t += spacing) {
      const x = s.x + dx * t;
      const z = s.z + dz * t;
      if (Math.hypot(x, z) <= radius) out.push({ x, z });
    }
  }
  return out;
};
