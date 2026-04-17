/**
 * Landmark — stylised 3D silhouettes for the 20 city landmarks.
 *
 * For the first ship these are built from primitives (boxes, cylinders, cones)
 * so there's no GLTF asset dependency and every city is recognisable from far.
 * Real modelling can swap them in later without changing callers.
 *
 * Callers pass `{ type, footprint: { x, z, w, d }, palette, gridDivision }`
 * where footprint is in GRID coordinates (from server/shared/cityCatalog.js).
 */

import { useMemo } from "react";

/** A grid-unit → world-unit converter mirroring server/pathfinding.js maths. */
const toWorld = (grid, gridDivision = 2) => grid / gridDivision;

export const Landmark = ({ type, footprint, palette, gridDivision = 2 }) => {
  const worldX = toWorld((footprint.x + footprint.w / 2) * gridDivision, gridDivision);
  const worldZ = toWorld((footprint.z + footprint.d / 2) * gridDivision, gridDivision);
  const worldW = toWorld(footprint.w * gridDivision, gridDivision);
  const worldD = toWorld(footprint.d * gridDivision, gridDivision);
  const accent = palette?.accent || "#fb7185";
  const sky    = palette?.sky    || "#e5e7eb";
  const ground = palette?.ground || "#94a3b8";

  // Component picked by landmark `type` — all receive the same positional props.
  const Impl = useMemo(() => (LANDMARK_IMPLS[type] || GenericBlock), [type]);

  return (
    <group position={[worldX, 0, worldZ]}>
      <Impl w={worldW} d={worldD} accent={accent} sky={sky} ground={ground} />
    </group>
  );
};

// ── Generic fallback ─────────────────────────────────────────────────
const GenericBlock = ({ w, d, accent }) => (
  <mesh position={[0, 2, 0]} castShadow receiveShadow>
    <boxGeometry args={[w, 4, d]} />
    <meshStandardMaterial color={accent} />
  </mesh>
);

// ── Hyderabad ────────────────────────────────────────────────────────
const Charminar = ({ w, d, accent }) => (
  <group>
    {/* Base cube with 4 corner towers */}
    <mesh position={[0, 3, 0]} castShadow><boxGeometry args={[w, 6, d]} /><meshStandardMaterial color="#d97706" /></mesh>
    {[[ 1, 1], [ 1,-1], [-1, 1], [-1,-1]].map(([sx, sz], i) => (
      <group key={i}>
        <mesh position={[sx*(w/2-0.4), 5, sz*(d/2-0.4)]} castShadow>
          <cylinderGeometry args={[0.4, 0.5, 10, 8]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        <mesh position={[sx*(w/2-0.4), 10.4, sz*(d/2-0.4)]} castShadow>
          <coneGeometry args={[0.5, 1.2, 8]} />
          <meshStandardMaterial color={accent} />
        </mesh>
      </group>
    ))}
  </group>
);

const GolcondaArch = ({ w, d }) => (
  <group>
    <mesh position={[-w/2+0.5, 2, 0]} castShadow><boxGeometry args={[1, 4, d]} /><meshStandardMaterial color="#78350f" /></mesh>
    <mesh position={[ w/2-0.5, 2, 0]} castShadow><boxGeometry args={[1, 4, d]} /><meshStandardMaterial color="#78350f" /></mesh>
    <mesh position={[0, 4.5, 0]} castShadow><boxGeometry args={[w, 1, d]} /><meshStandardMaterial color="#92400e" /></mesh>
    <mesh position={[0, 5.5, 0]} castShadow><boxGeometry args={[w*0.8, 0.6, d*0.8]} /><meshStandardMaterial color="#fbbf24" /></mesh>
  </group>
);

const HitecTower = ({ w, d }) => (
  <group>
    <mesh position={[0, 8, 0]} castShadow><boxGeometry args={[w, 16, d]} /><meshStandardMaterial color="#0ea5e9" transparent opacity={0.85} /></mesh>
    <mesh position={[0, 16.5, 0]} castShadow><boxGeometry args={[w*0.6, 1, d*0.6]} /><meshStandardMaterial color="#0284c7" /></mesh>
  </group>
);

// ── Dubai ────────────────────────────────────────────────────────────
const BurjKhalifa = ({ w, d }) => (
  <group>
    <mesh position={[0, 10, 0]} castShadow><cylinderGeometry args={[w/2, w/2+0.3, 20, 6]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
    <mesh position={[0, 21, 0]} castShadow><cylinderGeometry args={[w/3, w/2, 2, 6]} /><meshStandardMaterial color="#64748b" /></mesh>
    <mesh position={[0, 23, 0]} castShadow><coneGeometry args={[0.2, 4, 6]} /><meshStandardMaterial color="#fbbf24" /></mesh>
  </group>
);

const BurjAlArab = ({ w, d, accent }) => (
  <group>
    {/* Stylised sail silhouette */}
    <mesh position={[0, 8, 0]} rotation={[0, 0, -0.1]} castShadow>
      <boxGeometry args={[w*0.4, 16, d]} /><meshStandardMaterial color="#f1f5f9" />
    </mesh>
    <mesh position={[w*0.15, 8, 0]} rotation={[0, 0, -0.25]} castShadow>
      <boxGeometry args={[w*0.1, 15, d*0.8]} /><meshStandardMaterial color={accent} />
    </mesh>
  </group>
);

const GoldSouk = ({ w, d }) => (
  <group>
    <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[w, 3, d]} /><meshStandardMaterial color="#d4a017" /></mesh>
    <mesh position={[0, 3.2, 0]} castShadow><boxGeometry args={[w, 0.4, d]} /><meshStandardMaterial color="#b45309" /></mesh>
    {[-1, 0, 1].map((i) => (
      <mesh key={i} position={[i*w*0.3, 3.8, 0]} castShadow><sphereGeometry args={[0.4, 12, 8]} /><meshStandardMaterial color="#fde68a" /></mesh>
    ))}
  </group>
);

// ── Bengaluru ────────────────────────────────────────────────────────
const VidhanaSoudha = ({ w, d }) => (
  <group>
    <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[w, 5, d]} /><meshStandardMaterial color="#f5f5dc" /></mesh>
    {[-1, 0, 1].map((i) => (
      <mesh key={i} position={[i*w*0.35, 6, 0]} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color="#eab308" /></mesh>
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <mesh key={i} position={[-w/2 + (i+0.5)*(w/5), 1.5, d/2]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 3, 8]} /><meshStandardMaterial color="#e7e5e4" />
      </mesh>
    ))}
  </group>
);

const CubbonPark = ({ w, d }) => (
  <group>
    {Array.from({ length: 8 }).map((_, i) => {
      const x = (Math.sin(i * 1.7) * w/2) * 0.7;
      const z = (Math.cos(i * 2.3) * d/2) * 0.7;
      const h = 2 + (i % 3);
      return (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h/2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, h, 6]} /><meshStandardMaterial color="#7c2d12" />
          </mesh>
          <mesh position={[0, h + 0.7, 0]} castShadow>
            <sphereGeometry args={[1.2, 12, 10]} /><meshStandardMaterial color="#16a34a" />
          </mesh>
        </group>
      );
    })}
  </group>
);

const TechPark = ({ w, d }) => (
  <group>
    <mesh position={[-w*0.2, 6, 0]} castShadow><boxGeometry args={[w*0.35, 12, d*0.8]} /><meshStandardMaterial color="#1e40af" transparent opacity={0.8} /></mesh>
    <mesh position={[ w*0.2, 4, 0]} castShadow><boxGeometry args={[w*0.35, 8, d*0.8]} /><meshStandardMaterial color="#3b82f6" transparent opacity={0.8} /></mesh>
  </group>
);

// ── Mumbai ───────────────────────────────────────────────────────────
const GatewayOfIndia = ({ w, d }) => (
  <group>
    <mesh position={[-w*0.35, 3, 0]} castShadow><boxGeometry args={[w*0.2, 6, d]} /><meshStandardMaterial color="#a16207" /></mesh>
    <mesh position={[ w*0.35, 3, 0]} castShadow><boxGeometry args={[w*0.2, 6, d]} /><meshStandardMaterial color="#a16207" /></mesh>
    <mesh position={[0, 6.5, 0]} castShadow><boxGeometry args={[w, 1.2, d]} /><meshStandardMaterial color="#854d0e" /></mesh>
    <mesh position={[0, 8, 0]} castShadow><sphereGeometry args={[Math.min(w,d)*0.35, 20, 14]} /><meshStandardMaterial color="#fbbf24" /></mesh>
  </group>
);

const MarineDrive = ({ w, d, accent }) => (
  <group>
    {/* Curved promenade suggested as a long strip with street lamps */}
    <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[w, 0.1, d]} /><meshStandardMaterial color="#475569" /></mesh>
    {Array.from({ length: 10 }).map((_, i) => (
      <group key={i} position={[-w/2 + (i+0.5)*(w/10), 0, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.08, 0.1, 3, 6]} /><meshStandardMaterial color="#e7e5e4" /></mesh>
        <mesh position={[0, 3.2, 0]}><sphereGeometry args={[0.3, 10, 8]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} /></mesh>
      </group>
    ))}
  </group>
);

const LocalTrain = ({ w, d }) => (
  <group>
    {/* Tracks + carriage */}
    <mesh position={[0, 0.1, -0.4]} receiveShadow><boxGeometry args={[w, 0.1, 0.15]} /><meshStandardMaterial color="#57534e" /></mesh>
    <mesh position={[0, 0.1,  0.4]} receiveShadow><boxGeometry args={[w, 0.1, 0.15]} /><meshStandardMaterial color="#57534e" /></mesh>
    <mesh position={[0, 1.5, 0]} castShadow><boxGeometry args={[w*0.9, 2.5, d]} /><meshStandardMaterial color="#dc2626" /></mesh>
    <mesh position={[0, 3, 0]} castShadow><boxGeometry args={[w*0.9, 0.2, d]} /><meshStandardMaterial color="#7f1d1d" /></mesh>
  </group>
);

// ── New York ─────────────────────────────────────────────────────────
const TimesSquare = ({ w, d, accent }) => (
  <group>
    {/* Triangular "crossroads" hint */}
    {[[0, 0], [w*0.25, d*0.25], [-w*0.25, -d*0.25]].map(([x, z], i) => (
      <mesh key={i} position={[x, 7 + i, z]} castShadow>
        <boxGeometry args={[3, 14, 3]} /><meshStandardMaterial color="#27272a" />
      </mesh>
    ))}
    <mesh position={[0, 1, 0]}><boxGeometry args={[w*0.2, 2, d*0.2]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} /></mesh>
  </group>
);

const EmpireState = ({ w, d }) => (
  <group>
    <mesh position={[0, 7, 0]} castShadow><boxGeometry args={[w, 14, d]} /><meshStandardMaterial color="#9ca3af" /></mesh>
    <mesh position={[0, 15.5, 0]} castShadow><boxGeometry args={[w*0.6, 3, d*0.6]} /><meshStandardMaterial color="#6b7280" /></mesh>
    <mesh position={[0, 18, 0]} castShadow><cylinderGeometry args={[0.1, 0.2, 3, 6]} /><meshStandardMaterial color="#fbbf24" /></mesh>
  </group>
);

const BrooklynBridge = ({ w, d }) => (
  <group>
    {/* Towers */}
    <mesh position={[-w*0.3, 5, 0]} castShadow><boxGeometry args={[1.2, 10, d*0.6]} /><meshStandardMaterial color="#57534e" /></mesh>
    <mesh position={[ w*0.3, 5, 0]} castShadow><boxGeometry args={[1.2, 10, d*0.6]} /><meshStandardMaterial color="#57534e" /></mesh>
    {/* Deck */}
    <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[w, 0.4, d*0.8]} /><meshStandardMaterial color="#a8a29e" /></mesh>
  </group>
);

// ── Singapore ────────────────────────────────────────────────────────
const MarinaBaySands = ({ w, d, accent }) => (
  <group>
    {[-w*0.33, 0, w*0.33].map((x, i) => (
      <mesh key={i} position={[x, 7, 0]} castShadow>
        <boxGeometry args={[w*0.22, 14, d]} /><meshStandardMaterial color="#e5e7eb" />
      </mesh>
    ))}
    {/* Boat-shape roof */}
    <mesh position={[0, 14.5, 0]} rotation={[0, 0, 0]} castShadow>
      <boxGeometry args={[w, 0.5, d*0.4]} /><meshStandardMaterial color={accent} />
    </mesh>
  </group>
);

const Supertrees = ({ w, d }) => (
  <group>
    {[[0, 0], [w*0.3, 0], [-w*0.3, 0], [0, d*0.3], [0, -d*0.3]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 5, 0]} castShadow><cylinderGeometry args={[0.3, 0.5, 10, 6]} /><meshStandardMaterial color="#78350f" /></mesh>
        <mesh position={[0, 10.5, 0]} castShadow>
          <sphereGeometry args={[1.8, 16, 12]} /><meshStandardMaterial color="#16a34a" emissive="#16a34a" emissiveIntensity={0.15} />
        </mesh>
      </group>
    ))}
  </group>
);

const Merlion = ({ w, d }) => (
  <group>
    <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[w, 2, d]} /><meshStandardMaterial color="#e5e7eb" /></mesh>
    <mesh position={[0, 3, 0]} castShadow><sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color="#f1f5f9" /></mesh>
  </group>
);

// ── Sydney ───────────────────────────────────────────────────────────
const OperaHouse = ({ w, d }) => (
  <group>
    {/* Three overlapping "sails" */}
    {[[0, 0, 0], [w*0.25, 0, 0.3], [w*0.5, 0, 0.6]].map(([x, y, z], i) => (
      <mesh key={i} position={[x - w*0.2, 3 + i*0.5, z]} rotation={[-0.3, 0.3, -0.2]} castShadow>
        <coneGeometry args={[2.2, 5, 16, 1, true]} /><meshStandardMaterial color="#f1f5f9" side={2} />
      </mesh>
    ))}
    <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[w, 1, d]} /><meshStandardMaterial color="#a8a29e" /></mesh>
  </group>
);

const HarbourBridge = ({ w, d }) => (
  <group>
    {/* Arch */}
    <mesh position={[0, 5, 0]} castShadow>
      <torusGeometry args={[w/2, 0.4, 8, 24, Math.PI]} /><meshStandardMaterial color="#475569" />
    </mesh>
    <mesh position={[0, 1, 0]} castShadow><boxGeometry args={[w, 0.4, d*0.8]} /><meshStandardMaterial color="#64748b" /></mesh>
    {/* Pylons */}
    <mesh position={[-w/2+0.4, 2.5, 0]} castShadow><boxGeometry args={[0.8, 5, d*0.6]} /><meshStandardMaterial color="#57534e" /></mesh>
    <mesh position={[ w/2-0.4, 2.5, 0]} castShadow><boxGeometry args={[0.8, 5, d*0.6]} /><meshStandardMaterial color="#57534e" /></mesh>
  </group>
);

// ── Type → component registry ───────────────────────────────────────
const LANDMARK_IMPLS = {
  // Hyderabad
  charminar: Charminar,
  golcondaArch: GolcondaArch,
  hitecTower: HitecTower,
  // Dubai
  burjKhalifa: BurjKhalifa,
  burjAlArab: BurjAlArab,
  goldSouk: GoldSouk,
  // Bengaluru
  vidhanaSoudha: VidhanaSoudha,
  cubbonPark: CubbonPark,
  techPark: TechPark,
  // Mumbai
  gatewayOfIndia: GatewayOfIndia,
  marineDrive: MarineDrive,
  localTrain: LocalTrain,
  // New York
  timesSquare: TimesSquare,
  empireState: EmpireState,
  brooklynBridge: BrooklynBridge,
  // Singapore
  marinaBaySands: MarinaBaySands,
  supertrees: Supertrees,
  merlion: Merlion,
  // Sydney
  operaHouse: OperaHouse,
  harbourBridge: HarbourBridge,
};

export default Landmark;
