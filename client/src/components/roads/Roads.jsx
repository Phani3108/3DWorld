import React, { useMemo } from "react";
import { useAtom } from "jotai";
import { mapAtom } from "../SocketManager";
import { TrafficSignal } from "./TrafficSignal";

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
 * COORDINATE SPACE — important: the segments + widths are in GRID cells
 * (the same coord space venueCatalog footprints + character.position use).
 * The visible city ground is `map.size` world units across, with
 * `gridDivision` cells per world unit. So grid → world is `/ gridDivision`.
 * Both the position AND the geometry size must divide; mixing units made
 * the v1 of this component invisible (planes were 2× ground size, partly
 * off-screen).
 *
 * Render strategy:
 *   • Roads are flat planes at y = 0.02 (just above ground at y=0; venue
 *     tints sit at y ≈ 0.04 — empirically the layer ordering reads OK).
 *   • Centre stripes y = 0.04, sidewalks y = 0.05, crosswalks y = 0.06.
 *   • renderOrder bumps each layer for stable painter's order on integrated GPUs.
 *
 * All meshes are non-raycastable so click-to-move still hits the ground.
 */

// Phase 11B — dark high-contrast palette so roads read against every
// city ground (Hyderabad amber, Singapore pale, NYC grey, Sydney sand).
// "Night-pavement" feel — deliberate, since the previous mid-grey was
// invisible on dark grounds and washed out on light ones.
const COLORS = {
  asphalt:    "#0e0e10",
  laneStripe: "#fff8b0",
  bike:       "#1f5630",
  sidewalk:   "#dcd4be",
  crosswalk:  "#ffffff",
};

const Y = {
  main:      0.020,
  bike:      0.025,
  sidewalk:  0.030,
  stripe:    0.040,
  crosswalk: 0.045,
};

const segLength = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Convert a grid coord to world units (mirrors Room.jsx venue tint maths). */
const toWorldOne = (g, div) => g / div;
const toWorldXZ  = (gx, gz, div) => [gx / div, gz / div];

const RoadSegment = React.memo(function RoadSegment({ seg, div }) {
  const { a, b, width = 2, type = "main" } = seg;
  const horz = a[1] === b[1];
  const lenGrid = segLength(a, b);
  const lenW    = lenGrid / div;
  const widthW  = width / div;
  // Midpoint in world coords (no centring offset — segments are line-defined).
  const [mx, mz] = toWorldXZ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, div);
  const planeArgs = horz ? [lenW, widthW] : [widthW, lenW];
  const color =
    type === "bike"     ? COLORS.bike :
    type === "sidewalk" ? COLORS.sidewalk :
                          COLORS.asphalt;
  const y =
    type === "bike"     ? Y.bike :
    type === "sidewalk" ? Y.sidewalk :
                          Y.main;
  return (
    <mesh
      position={[mx, y, mz]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
      renderOrder={type === "sidewalk" ? 3 : type === "bike" ? 2 : 1}
    >
      <planeGeometry args={planeArgs} />
      <meshStandardMaterial color={color} roughness={0.95} metalness={0} />
    </mesh>
  );
});

const CentreStripe = React.memo(function CentreStripe({ seg, div }) {
  const { a, b, width = 2, type } = seg;
  if (type !== "main" || width < 2) return null;
  const horz = a[1] === b[1];
  const lenGrid = segLength(a, b);
  // Dashes every ~2 grid cells along the segment.
  const DASH_LEN_GRID    = 0.8;
  const DASH_WIDTH_GRID  = 0.18;
  const STRIDE_GRID      = 2.0;
  const count = Math.max(1, Math.floor(lenGrid / STRIDE_GRID));
  const dashes = [];
  for (let i = 0; i < count; i++) {
    const t = (i * STRIDE_GRID + STRIDE_GRID / 2) / lenGrid;
    const gx = a[0] + (b[0] - a[0]) * t;
    const gz = a[1] + (b[1] - a[1]) * t;
    dashes.push([gx, gz]);
  }
  const lenW = DASH_LEN_GRID / div;
  const wW   = DASH_WIDTH_GRID / div;
  return (
    <group>
      {dashes.map(([gx, gz], i) => {
        const [wx, wz] = toWorldXZ(gx, gz, div);
        const dimX = horz ? lenW : wW;
        const dimZ = horz ? wW : lenW;
        return (
          <mesh
            key={i}
            position={[wx, Y.stripe, wz]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
            renderOrder={4}
          >
            <planeGeometry args={[dimX, dimZ]} />
            <meshStandardMaterial color={COLORS.laneStripe} roughness={0.55} emissive={COLORS.laneStripe} emissiveIntensity={0.45} />
          </mesh>
        );
      })}
    </group>
  );
});

const Crosswalk = React.memo(function Crosswalk({ at, orient, div }) {
  const STRIPES = 5;
  const STRIPE_LEN_GRID  = 2.4;
  const STRIPE_W_GRID    = 0.32;
  const STRIDE_GRID      = 0.55;
  const [wx, wz] = toWorldXZ(at[0], at[1], div);
  const horizontal = orient === "horizontal";
  return (
    <group position={[wx, Y.crosswalk, wz]}>
      {Array.from({ length: STRIPES }).map((_, i) => {
        const offset = (i - (STRIPES - 1) / 2) * STRIDE_GRID / div;
        const [dx, dz] = horizontal ? [0, offset] : [offset, 0];
        const lenW = STRIPE_LEN_GRID / div;
        const wW   = STRIPE_W_GRID  / div;
        const [planeW, planeH] = horizontal ? [lenW, wW] : [wW, lenW];
        return (
          <mesh
            key={i}
            position={[dx, 0, dz]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
            renderOrder={5}
          >
            <planeGeometry args={[planeW, planeH]} />
            <meshStandardMaterial color={COLORS.crosswalk} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
});

export const Roads = ({ network }) => {
  const [map] = useAtom(mapAtom);
  const div = map?.gridDivision || 2;
  const segs = network?.segments || [];
  const cws  = network?.crosswalks || [];
  const intersections = network?.intersections || [];

  const segmentMeshes = useMemo(
    () => segs.map((s, i) => <RoadSegment key={`seg-${i}`} seg={s} div={div} />),
    [segs, div],
  );
  const stripeMeshes = useMemo(
    () => segs.map((s, i) => <CentreStripe key={`stripe-${i}`} seg={s} div={div} />),
    [segs, div],
  );
  const crosswalkMeshes = useMemo(
    () => cws.map((c, i) => <Crosswalk key={`xw-${i}`} at={c.at} orient={c.orient} div={div} />),
    [cws, div],
  );
  // Phase 10B — pole-mounted signal at every road intersection. Position
  // is in world coords too — TrafficSignal does its own grid→world via
  // gridToVector3. Pass the grid coords directly.
  const signalMeshes = useMemo(
    () => intersections.map(([x, z], i) => (
      <TrafficSignal key={`sig-${i}`} at={[x + 1.5, z + 1.5]} div={div} />
    )),
    [intersections, div],
  );

  if (segs.length === 0) return null;
  return (
    <group>
      {segmentMeshes}
      {stripeMeshes}
      {crosswalkMeshes}
      {signalMeshes}
    </group>
  );
};

export default Roads;
