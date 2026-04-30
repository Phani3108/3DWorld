import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * MonumentBillboard — Phase 10E.
 *
 * Renders a real photographic plane in front of a primitive landmark.
 * The plane sits on the south face (camera-facing for the default
 * orientation), starting at the top of the landmark's primitive base.
 *
 * Strategy:
 *   • Camera-distance opacity fade: invisible past 24 m, full opacity
 *     under 12 m, smooth lerp between. Keeps the playful silhouette
 *     readable from far and grounds it with a photo when you approach.
 *   • Texture loaded via `THREE.TextureLoader` with onError silently
 *     hiding the plane — missing photos degrade to plain primitive.
 *   • Plane is double-sided so it works regardless of which side the
 *     camera approaches from.
 *
 * The catalog of {photoUrl, attribution} per landmark type is fetched
 * once on mount via /api/v1/monuments and cached at the module level
 * so we don't re-hit on every Landmark instance.
 */

// Module-level cache so all MonumentBillboards share the catalog fetch.
let _catalog = null;
let _catalogPromise = null;
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const fetchCatalog = () => {
  if (_catalog) return Promise.resolve(_catalog);
  if (_catalogPromise) return _catalogPromise;
  _catalogPromise = fetch(`${SERVER_URL}/api/v1/monuments`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((data) => { _catalog = data || {}; return _catalog; })
    .catch(() => { _catalog = {}; return _catalog; });
  return _catalogPromise;
};

// Texture cache — multiple billboards of the same type share GPU memory.
const textureCache = new Map();
const failedTextures = new Set();

const loadTexture = (url) =>
  new Promise((resolve) => {
    if (failedTextures.has(url)) return resolve(null);
    if (textureCache.has(url)) return resolve(textureCache.get(url));
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        textureCache.set(url, tex);
        resolve(tex);
      },
      undefined,
      () => {
        failedTextures.add(url);
        resolve(null);
      },
    );
  });

const FADE_FAR  = 24;  // beyond this: invisible
const FADE_NEAR = 12;  // closer than this: full opacity
const PLANE_HEIGHT_FRACTION = 0.7; // billboard height = base * this fraction

export const MonumentBillboard = ({ type, w = 6, d = 6 }) => {
  const meshRef = useRef();
  const matRef  = useRef();
  const [texture, setTexture] = useState(null);
  const { camera } = useThree();

  // Resolve {photoUrl} for this landmark type.
  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then(async (cat) => {
      if (cancelled) return;
      const entry = cat?.[type];
      if (!entry?.photoUrl) return;
      const tex = await loadTexture(entry.photoUrl);
      if (!cancelled && tex) setTexture(tex);
    });
    return () => { cancelled = true; };
  }, [type]);

  // Plane sized to match the landmark's footprint with a sensible aspect.
  // Photos are usually landscape (4:3), so the width is the larger of the
  // two footprint dims and height is 70% of width.
  const { planeW, planeH, planeY, planeZ } = useMemo(() => {
    const longSide = Math.max(w, d);
    const planeW = longSide * 0.85;
    const planeH = planeW * 0.65; // portrait of a landmark looks ~3:2
    const planeY = planeH * PLANE_HEIGHT_FRACTION + 0.5;
    // Sit it just outside the south face of the primitive footprint
    // (positive z direction). Half of d + tiny offset.
    const planeZ = d / 2 + 0.05;
    return { planeW, planeH, planeY, planeZ };
  }, [w, d]);

  // Distance fade — runs every frame on the geometry's material.
  useFrame(() => {
    if (!meshRef.current || !matRef.current || !texture) return;
    const wp = new THREE.Vector3();
    meshRef.current.getWorldPosition(wp);
    const dist = camera.position.distanceTo(wp);
    let opacity;
    if (dist <= FADE_NEAR)      opacity = 1;
    else if (dist >= FADE_FAR)  opacity = 0;
    else                        opacity = 1 - (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
    matRef.current.opacity = opacity;
    // Hide entirely below threshold so we don't pay z-cost on far landmarks.
    meshRef.current.visible = opacity > 0.01;
  });

  if (!texture) return null;

  return (
    <mesh
      ref={meshRef}
      position={[0, planeY, planeZ]}
      raycast={() => null}
      renderOrder={5}
    >
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
};

export default MonumentBillboard;
