import React, { useMemo } from "react";
import { useGrid } from "../../hooks/useGrid";

/**
 * Roads — Phase 10A.
 *
 * Renders the road network for a city as flat extruded planes:
 *   • main road  — dark asphalt + dashed yellow centre stripe
 *   • bike lane  — green-tinted strip
 *   • sidewalk   — light grey strip
 *
 * Inputs come from `city.roads` (server/shared/roadNetwork.js):
 *   { segments: [{a,b,width,type}], intersections: [...], crosswalks: [...] }
 *
 * Render strategy:
 *   • Roads are flat planes at y = 0.005 (just above the city ground at y=0).
 *   • Sidewalks at y = 0.012 so they paint on top of asphalt at junctions.
 *   • Centre stripes at y = 0.018 (above asphalt, below venue tints which
 *     sit at y = 0.02 in Room.jsx — confirmed visually OK with a small gap).
 *   • Crosswalks at y = 0.020 with white stripe pattern via repeating box meshes.
 *   • renderOrder is set explicitly to keep the painter's order stable
 *     even if depthTest fails on integrated GPUs.
 *
 * All meshes are non-raycastable (raycast={() => null}) so click-to-move
 * still hits the ground plane underneath.
 */

const COLORS = {
  asphalt:   "#2a2a2e",
  laneStripe:"#f5d058",
  bike:      "#2f6b3d",
  sidewalk:  "#cdc6b6",
  crosswalk: "#f3f3f3",
};

const HEIGHTS = {
  main:     0.005,
  bike:     0.010,
  sidewalk: 0.012,
  stripe:   0.018,
  crosswalk:0.020,
};

const segLength = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const RoadSegment = React.memo(function RoadSegment({ seg, gridToVector3 }) {
  const { a, b, width = 2, type = "main" } = seg;
  const horz = a[1] === b[1];
  const len  = segLength(a, b);
  // Position at midpoint, in world-space.
  const midGrid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const mid = gridToVector3(midGrid);
  const planeArgs = horz ? [len, width] : [width, len];
  const color =
    type === "bike"     ? COLORS.bike :
    type === "sidewalk" ? COLORS.sidewalk :
                          COLORS.asphalt;
  const y =
    type === "bike"     ? HEIGHTS.bike :
    type === "sidewalk" ? HEIGHTS.sidewalk :
                          HEIGHTS.main;
  return (
    <mesh
      position={[mid.x, y, mid.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
      renderOrder={type === "sidewalk" ? 2 : 1}
    >
      <planeGeometry args={planeArgs} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
});

/**
 * Centre stripe for a `main` segment — an array of small dashes parallel
 * to the road. Renders only on segments wider than ~2 cells (skip tiny
 * connector spurs).
 */
const CentreStripe = React.memo(function CentreStripe({ seg, gridToVector3 }) {
  const { a, b, width = 2, type } = seg;
  if (type !== "main" || width < 2) return null;
  const horz = a[1] === b[1];
  const len  = segLength(a, b);
  // Place dashes every 2 cells, each dash 0.8 cells long, 0.15 wide.
  const DASH_LEN = 0.8, DASH_W = 0.15, DASH_STRIDE = 2;
  const count = Math.max(1, Math.floor(len / DASH_STRIDE));
  const dashes = [];
  for (let i = 0; i < count; i++) {
    const t = (i * DASH_STRIDE + DASH_STRIDE / 2) / len;
    const gx = a[0] + (b[0] - a[0]) * t;
    const gz = a[1] + (b[1] - a[1]) * t;
    dashes.push([gx, gz]);
  }
  return (
    <group>
      {dashes.map(([gx, gz], i) => {
        const v = gridToVector3([gx, gz]);
        const dimX = horz ? DASH_LEN : DASH_W;
        const dimZ = horz ? DASH_W : DASH_LEN;
        return (
          <mesh
            key={i}
            position={[v.x, HEIGHTS.stripe, v.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
            renderOrder={3}
          >
            <planeGeometry args={[dimX, dimZ]} />
            <meshStandardMaterial color={COLORS.laneStripe} roughness={0.7} emissive={COLORS.laneStripe} emissiveIntensity={0.05} />
          </mesh>
        );
      })}
    </group>
  );
});

/**
 * Zebra crosswalk — 5 white stripes perpendicular to the road. Phase 10A
 * already emits crosswalks at every road intersection; the visual matches
 * the dual-orientation pattern (one set across the horizontal road, one
 * set across the vertical). 10B's crosswalk component reuses this look
 * and adds the signal pole.
 */
const Crosswalk = React.memo(function Crosswalk({ at, orient, gridToVector3 }) {
  const STRIPES = 5;
  const STRIPE_LEN = 2.4;
  const STRIPE_W = 0.35;
  const STRIDE = 0.55;
  const v = gridToVector3(at);
  const horizontal = orient === "horizontal";
  return (
    <group position={[v.x, HEIGHTS.crosswalk, v.z]}>
      {Array.from({ length: STRIPES }).map((_, i) => {
        const offset = (i - (STRIPES - 1) / 2) * STRIDE;
        const [dx, dz] = horizontal ? [0, offset] : [offset, 0];
        const [w, h] = horizontal ? [STRIPE_LEN, STRIPE_W] : [STRIPE_W, STRIPE_LEN];
        return (
          <mesh
            key={i}
            position={[dx, 0, dz]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
            renderOrder={4}
          >
            <planeGeometry args={[w, h]} />
            <meshStandardMaterial color={COLORS.crosswalk} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
});

/**
 * Top-level <Roads> component. Receives the road network for the current
 * city (from `cityAtom`) and renders all segments + centre stripes +
 * crosswalks. No-op when network is empty.
 */
export const Roads = ({ network }) => {
  const { gridToVector3 } = useGrid();
  const segs = network?.segments || [];
  const cws  = network?.crosswalks || [];

  const segmentMeshes = useMemo(
    () => segs.map((s, i) => <RoadSegment key={`seg-${i}`} seg={s} gridToVector3={gridToVector3} />),
    [segs, gridToVector3],
  );
  const stripeMeshes = useMemo(
    () => segs.map((s, i) => <CentreStripe key={`stripe-${i}`} seg={s} gridToVector3={gridToVector3} />),
    [segs, gridToVector3],
  );
  const crosswalkMeshes = useMemo(
    () => cws.map((c, i) => <Crosswalk key={`xw-${i}`} at={c.at} orient={c.orient} gridToVector3={gridToVector3} />),
    [cws, gridToVector3],
  );

  if (segs.length === 0) return null;
  return (
    <group>
      {segmentMeshes}
      {stripeMeshes}
      {crosswalkMeshes}
    </group>
  );
};

export default Roads;
