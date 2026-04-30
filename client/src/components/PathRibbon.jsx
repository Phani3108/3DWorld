import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { selfPathAtom } from "./SocketManager";
import * as THREE from "three";

/**
 * PathRibbon — Phase 10I.
 *
 * Renders the LOCAL player's currently-active path as a glowing dotted
 * line on the ground from their current position to the destination.
 *
 * Implementation:
 *   • Builds a list of small flat dash meshes from the path Vector3 array.
 *   • Each dash is a thin emissive plane oriented along the segment.
 *   • Animates a UV-style offset on the meshes (rotating dash phase) so
 *     the line "flows forward" toward the destination.
 *   • Sits at y = 0.025 — above asphalt, sidewalks, and venue tints,
 *     below avatar feet so it doesn't clip into the legs.
 *   • Cleared automatically when selfPathAtom becomes null (arrival).
 *
 * Renders nothing when there's no active path or fewer than 2 waypoints.
 */

const DASH_SPACING = 0.45;   // world units between dash centres
const DASH_LENGTH = 0.30;
const DASH_WIDTH  = 0.15;
const RIBBON_Y    = 0.025;
const RIBBON_COLOR = "#fbbf24"; // amber gold

export const PathRibbon = () => {
  const [path] = useAtom(selfPathAtom);
  const groupRef = useRef();

  // Recompute the dash list whenever the path changes (path is a stable
  // array reference inside Avatar — only swapped on a new playerMove).
  const dashes = useMemo(() => {
    if (!Array.isArray(path) || path.length < 2) return [];
    const out = [];
    for (let i = 0; i < path.length - 1; i++) {
      const a = path[i];
      const b = path[i + 1];
      const dir = new THREE.Vector3().subVectors(b, a);
      const len = dir.length();
      if (len < 0.05) continue;
      dir.normalize();
      const angle = Math.atan2(dir.x, dir.z); // rotation around Y
      // Walk along the segment placing dashes at a consistent stride
      const count = Math.max(1, Math.floor(len / DASH_SPACING));
      for (let j = 0; j < count; j++) {
        const t = (j + 0.5) / count;
        out.push({
          x: a.x + (b.x - a.x) * t,
          z: a.z + (b.z - a.z) * t,
          angleY: angle,
          // Phase used to offset the per-dash flicker so it reads as motion
          phase: i * 0.7 + j * 0.25,
        });
      }
    }
    return out;
  }, [path]);

  // Animate the dashes — pulse opacity along the path direction.
  useFrame(({ clock }) => {
    if (!groupRef.current || dashes.length === 0) return;
    const t = clock.getElapsedTime() * 2.0;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length && i < dashes.length; i++) {
      const mesh = children[i];
      if (!mesh.material) continue;
      const wave = 0.55 + 0.45 * Math.sin(t - dashes[i].phase);
      mesh.material.opacity = wave;
      mesh.material.emissiveIntensity = 0.2 + 0.6 * wave;
    }
  });

  if (dashes.length === 0) return null;
  return (
    <group ref={groupRef} raycast={() => null}>
      {dashes.map((d, i) => (
        <mesh
          key={i}
          position={[d.x, RIBBON_Y, d.z]}
          rotation={[-Math.PI / 2, 0, -d.angleY]}
          raycast={() => null}
          renderOrder={6}
        >
          <planeGeometry args={[DASH_WIDTH, DASH_LENGTH]} />
          <meshStandardMaterial
            color={RIBBON_COLOR}
            emissive={RIBBON_COLOR}
            emissiveIntensity={0.6}
            transparent
            opacity={0.9}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

export default PathRibbon;
