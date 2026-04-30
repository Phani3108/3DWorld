import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
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

const FACT_CARD_DISTANCE = 6.5; // metres from billboard centre to start showing the card

export const MonumentBillboard = ({ type, w = 6, d = 6 }) => {
  const meshRef = useRef();
  const matRef  = useRef();
  const [texture, setTexture] = useState(null);
  const [meta, setMeta] = useState(null);     // Phase 10K — full catalog entry for the fact card
  const [showCard, setShowCard] = useState(false);
  const { camera } = useThree();

  // Resolve {photoUrl, builtYear, blurb, openingHours, attribution}
  // for this landmark type.
  useEffect(() => {
    let cancelled = false;
    fetchCatalog().then(async (cat) => {
      if (cancelled) return;
      const entry = cat?.[type];
      if (!entry) return;
      setMeta(entry);
      if (!entry.photoUrl) return;
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
  // Phase 10K: also drives the fact card visibility (within 6.5 m).
  useFrame(() => {
    if (!meshRef.current) return;
    const wp = new THREE.Vector3();
    meshRef.current.getWorldPosition(wp);
    const dist = camera.position.distanceTo(wp);

    if (texture && matRef.current) {
      let opacity;
      if (dist <= FADE_NEAR)      opacity = 1;
      else if (dist >= FADE_FAR)  opacity = 0;
      else                        opacity = 1 - (dist - FADE_NEAR) / (FADE_FAR - FADE_NEAR);
      matRef.current.opacity = opacity;
      meshRef.current.visible = opacity > 0.01;
    }
    // Show the fact card only when truly close — keeps screens uncluttered.
    const cardWanted = dist <= FACT_CARD_DISTANCE && !!meta;
    if (cardWanted !== showCard) setShowCard(cardWanted);
  });

  // Render order: photo plane (if texture present) + fact card (if close + meta loaded).
  return (
    <group>
      {texture && (
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
      )}
      {/* If there's no photo we still render a minimal anchor mesh so the
          fact-card distance check has a position to compare against. */}
      {!texture && meta && (
        <mesh
          ref={meshRef}
          position={[0, planeY, planeZ]}
          raycast={() => null}
          visible={false}
        >
          <planeGeometry args={[0.001, 0.001]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
      {showCard && meta && (
        <Html
          position={[0, Math.max(planeY + planeH / 2 + 0.6, 3.5), planeZ]}
          center
          distanceFactor={6}
          zIndexRange={[2, 0]}
          style={{ pointerEvents: "none" }}
        >
          <FactCard meta={meta} />
        </Html>
      )}
    </group>
  );
};

// Phase 10K — small flat card used by both the photo billboard's near
// proximity and (later) the bulletin board's monument list.
const FactCard = ({ meta }) => (
  <div
    style={{
      width: 240,
      background: "rgba(15,23,42,0.85)",
      backdropFilter: "blur(8px)",
      color: "#e2e8f0",
      borderRadius: 10,
      padding: "10px 12px",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 12,
      lineHeight: 1.4,
      border: "1px solid rgba(148,163,184,0.35)",
      boxShadow: "0 8px 22px rgba(0,0,0,0.45)",
    }}
  >
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
        {meta.builtYear ? `🏛 Built ${meta.builtYear}` : "🏛"}
      </span>
      {meta.openingHours && (
        <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: "auto" }}>
          {meta.openingHours}
        </span>
      )}
    </div>
    <div style={{ marginBottom: 6, color: "#cbd5e1" }}>{meta.blurb}</div>
    {meta.attribution && (
      <div style={{ fontSize: 9.5, color: "#64748b", borderTop: "1px solid rgba(148,163,184,0.2)", paddingTop: 4, marginTop: 4 }}>
        Photo: {meta.attribution}
      </div>
    )}
  </div>
);

export default MonumentBillboard;
