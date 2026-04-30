import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * PhotoAvatarBillboard — Phase 10F (proper AI-avatar mode).
 *
 * Renders a tall, always-camera-facing textured plane (1.4 m wide × 2 m
 * tall) that becomes the avatar's visual body. Replaces the cartoon GLB
 * for any character whose `avatarPhotoUrl` resolves to a real image.
 *
 * Why a billboard (not a 3D photoreal mesh)?
 *   • The user said the cartoon GLB shape is the wrong vibe — they want
 *     "AI-based avatars that look properly like humans / animals /
 *     characters". A flat AI-generated portrait, billboard-style, gives
 *     that vibe without sourcing 28+ photoreal GLB rigs.
 *   • Always camera-facing means the photo never shears, never reveals
 *     a flat back. Reads as a "character" from any angle.
 *   • The existing avatar group still drives walking, so movement,
 *     pathing, vehicle rigs, and bond-emote positions all work unchanged.
 *
 * Texture loading is fault-tolerant — onError leaves `tex === null` and
 * the component renders nothing, so a missing photo silently degrades to
 * the fallback (caller picks: usually keeping the GLB visible).
 */

// Module-level texture cache keyed by URL. Many residents share the same
// avatarPhotoUrl convention so the same image isn't loaded 28 times.
const TEX_CACHE = new Map();
const TEX_FAILED = new Set();

const loadTexture = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve(null);
    if (TEX_FAILED.has(url)) return resolve(null);
    if (TEX_CACHE.has(url)) return resolve(TEX_CACHE.get(url));
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        TEX_CACHE.set(url, tex);
        resolve(tex);
      },
      undefined,
      () => {
        TEX_FAILED.add(url);
        resolve(null);
      },
    );
  });

const WIDTH  = 1.35;
const HEIGHT = 1.95;

export const PhotoAvatarBillboard = ({ photoUrl, accent = "#fbbf24", isBot = false }) => {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);
  const { camera } = useThree();

  // Lazy-load the texture; reset when URL changes so users who upload a
  // new photo see it next render without a remount.
  useEffect(() => {
    let cancelled = false;
    setTexture(null);
    loadTexture(photoUrl).then((t) => {
      if (!cancelled) setTexture(t);
    });
    return () => { cancelled = true; };
  }, [photoUrl]);

  // Always-camera-facing rotation. Update only the Y rotation so the
  // billboard stays upright; tilting with camera pitch looks weird.
  useFrame(() => {
    if (!meshRef.current) return;
    const wp = new THREE.Vector3();
    meshRef.current.getWorldPosition(wp);
    const dx = camera.position.x - wp.x;
    const dz = camera.position.z - wp.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  if (!texture) return null;

  return (
    <group
      ref={meshRef}
      position={[0, HEIGHT / 2, 0]}
      raycast={() => null}
      renderOrder={2}
    >
      {/* Soft drop-shadow behind the photo — gives a hint of depth */}
      <mesh position={[0, 0, -0.02]} renderOrder={1}>
        <planeGeometry args={[WIDTH * 1.06, HEIGHT * 1.04]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
      {/* Accent border ring */}
      <mesh position={[0, 0, -0.005]} renderOrder={1.5}>
        <planeGeometry args={[WIDTH + 0.04, HEIGHT + 0.04]} />
        <meshBasicMaterial color={isBot ? "#22d3ee" : accent} />
      </mesh>
      {/* The photo itself */}
      <mesh position={[0, 0, 0]} renderOrder={2}>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};

/**
 * Fallback billboard used when no photo exists yet — paints the user's
 * initials inside a colored circle on a small SVG so the AI-avatar mode
 * still reads as "I'm represented by a portrait" instead of nothing.
 *
 * Useful while the asset pipeline is being filled in.
 */
export const InitialBillboard = ({ initials = "?", accent = "#fbbf24", isBot = false }) => {
  const tex = useMemo(() => {
    const w = 256;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = w * (HEIGHT / WIDTH); // ~370
    const ctx = canvas.getContext("2d");
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#1a1a2e");
    grad.addColorStop(1, isBot ? "#0e7490" : accent);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Initials
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "bold 110px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials.slice(0, 2).toUpperCase(), canvas.width / 2, canvas.height / 2);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [initials, accent, isBot]);

  const meshRef = useRef();
  const { camera } = useThree();
  useFrame(() => {
    if (!meshRef.current) return;
    const wp = new THREE.Vector3();
    meshRef.current.getWorldPosition(wp);
    const dx = camera.position.x - wp.x;
    const dz = camera.position.z - wp.z;
    meshRef.current.rotation.y = Math.atan2(dx, dz);
  });

  return (
    <group
      ref={meshRef}
      position={[0, HEIGHT / 2, 0]}
      raycast={() => null}
      renderOrder={2}
    >
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[WIDTH + 0.04, HEIGHT + 0.04]} />
        <meshBasicMaterial color={isBot ? "#22d3ee" : accent} />
      </mesh>
      <mesh>
        <planeGeometry args={[WIDTH, HEIGHT]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
};

export default PhotoAvatarBillboard;
