/**
 * Prop — lightweight 3D primitives used for venue layouts.
 *
 * Same pattern as landmarks/Landmark.jsx: no GLTF assets, everything is
 * box/cylinder/cone with accent-tinted materials. Keeps the bundle small
 * and keeps the visual language coherent with the landmarks.
 *
 * Each prop is a non-interactive group (raycast disabled) so it doesn't
 * clash with the existing build mode / drag flows.
 */

import { useMemo } from "react";

/** Grid → world position helper. Mirrors Landmark.jsx maths. */
const toWorldPos = (gridX, gridZ, gridDivision = 2) => {
  // item.gridPosition in city rooms is already in grid-cell units. Each cell
  // is 0.5 world units at gridDivision=2. We place the prop at its top-left
  // and the mesh recentres via its own geometry, same as Item.jsx.
  return [gridX / gridDivision, 0, gridZ / gridDivision];
};

export const Prop = ({ type, gridPosition, rotation = 0, accent = "#fb7185", gridDivision = 2, scale = 1 }) => {
  if (!Array.isArray(gridPosition)) return null;
  const Impl = useMemo(() => PROP_IMPLS[type] || null, [type]);
  if (!Impl) return null;
  const [wx, wy, wz] = toWorldPos(gridPosition[0], gridPosition[1], gridDivision);
  return (
    <group
      position={[wx, wy, wz]}
      rotation={[0, (rotation || 0) * Math.PI / 2, 0]}
      scale={scale}
      raycast={() => null}
    >
      <Impl accent={accent} />
    </group>
  );
};

// ── Restaurant / Café ───────────────────────────────────────────────
const TableRestaurant = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.05, 1]} /><meshStandardMaterial color="#ffffff" />
    </mesh>
    {/* Tablecloth accent edge */}
    <mesh position={[0.5, 0.43, 0.5]}>
      <boxGeometry args={[1.02, 0.01, 1.02]} /><meshStandardMaterial color={accent} transparent opacity={0.5} />
    </mesh>
    {/* Leg */}
    <mesh position={[0.5, 0.2, 0.5]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 0.4, 8]} /><meshStandardMaterial color="#4b5563" />
    </mesh>
    {/* Plate */}
    <mesh position={[0.5, 0.44, 0.5]}>
      <cylinderGeometry args={[0.2, 0.2, 0.02, 20]} /><meshStandardMaterial color="#f1f5f9" />
    </mesh>
  </group>
);
const ChairRestaurant = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.28, 0.5]} castShadow>
      <boxGeometry args={[0.6, 0.06, 0.6]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 0.55, 0.25]} castShadow>
      <boxGeometry args={[0.6, 0.5, 0.06]} /><meshStandardMaterial color={accent} />
    </mesh>
    {[[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.14, z]}>
        <cylinderGeometry args={[0.03, 0.03, 0.28, 6]} /><meshStandardMaterial color="#374151" />
      </mesh>
    ))}
  </group>
);
const MenuBoard = ({ accent }) => (
  <group>
    <mesh position={[0.5, 1.0, 0.1]} castShadow>
      <boxGeometry args={[1.4, 0.9, 0.08]} /><meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0.5, 1.0, 0.06]}>
      <boxGeometry args={[1.3, 0.8, 0.02]} /><meshStandardMaterial color="#f8fafc" />
    </mesh>
    {/* Accent header strip */}
    <mesh position={[0.5, 1.35, 0.05]}>
      <boxGeometry args={[1.3, 0.1, 0.02]} /><meshStandardMaterial color={accent} />
    </mesh>
  </group>
);
const KitchenCounter = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.45, 0.5]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.9, 1]} /><meshStandardMaterial color="#d1d5db" />
    </mesh>
    <mesh position={[0.5, 0.93, 0.5]}>
      <boxGeometry args={[1.05, 0.06, 1.05]} /><meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0.5, 1.0, 0.5]}>
      <boxGeometry args={[0.6, 0.12, 0.6]} /><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.2} />
    </mesh>
  </group>
);
const OrderingWindow = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.5, 0.1]} castShadow>
      <boxGeometry args={[1, 1, 0.08]} /><meshStandardMaterial color="#e5e7eb" />
    </mesh>
    <mesh position={[0.5, 0.75, 0.05]}>
      <boxGeometry args={[0.9, 0.4, 0.02]} /><meshStandardMaterial color="#0f172a" transparent opacity={0.5} />
    </mesh>
    <mesh position={[0.5, 0.2, 0.1]}>
      <boxGeometry args={[1, 0.1, 0.1]} /><meshStandardMaterial color={accent} />
    </mesh>
  </group>
);
const CoffeeMachine = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.45, 0.5]} castShadow>
      <boxGeometry args={[0.6, 0.8, 0.4]} /><meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0.5, 0.92, 0.5]}>
      <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 0.3, 0.72]}>
      <boxGeometry args={[0.3, 0.04, 0.04]} /><meshStandardMaterial color="#6b7280" />
    </mesh>
  </group>
);

// ── Market / Souk ───────────────────────────────────────────────────
const GoldCounter = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow>
      <boxGeometry args={[1, 0.8, 0.6]} /><meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0.5, 0.82, 0.5]}>
      <boxGeometry args={[1.02, 0.05, 0.62]} /><meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.4} />
    </mesh>
    {[0.25, 0.5, 0.75].map((x, i) => (
      <mesh key={i} position={[x, 0.88, 0.5]}>
        <sphereGeometry args={[0.08, 12, 10]} /><meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={0.5} />
      </mesh>
    ))}
  </group>
);
const SpiceRack = ({ accent }) => (
  <group>
    {[
      ["#dc2626", 0.2], ["#f59e0b", 0.5], ["#ea580c", 0.8],
      ["#7c2d12", 0.35], ["#a16207", 0.65],
    ].map(([color, x], i) => (
      <mesh key={i} position={[x, 0.2, 0.5]} castShadow>
        <coneGeometry args={[0.14, 0.4, 12]} /><meshStandardMaterial color={color} />
      </mesh>
    ))}
    <mesh position={[0.5, 0.02, 0.5]} receiveShadow>
      <boxGeometry args={[1, 0.04, 0.9]} /><meshStandardMaterial color="#78350f" />
    </mesh>
  </group>
);
const FruitCart = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.35, 0.5]} castShadow>
      <boxGeometry args={[1, 0.3, 0.7]} /><meshStandardMaterial color="#92400e" />
    </mesh>
    {[["#dc2626", 0.3, 0.35], ["#facc15", 0.5, 0.5], ["#16a34a", 0.7, 0.4], ["#f97316", 0.4, 0.65]].map(([c, x, z], i) => (
      <mesh key={i} position={[x, 0.58, z]}>
        <sphereGeometry args={[0.08, 12, 10]} /><meshStandardMaterial color={c} />
      </mesh>
    ))}
    <mesh position={[0.15, 0.15, 0.5]}>
      <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0.85, 0.15, 0.5]}>
      <cylinderGeometry args={[0.1, 0.1, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
  </group>
);
const TextileRoll = ({ accent }) => (
  <group>
    {[[0.25, "#7c3aed"], [0.5, accent], [0.75, "#0ea5e9"]].map(([x, color], i) => (
      <mesh key={i} position={[x, 0.35, 0.5]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 20]} /><meshStandardMaterial color={color} />
      </mesh>
    ))}
  </group>
);
const HawkerStall = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow>
      <boxGeometry args={[1, 0.8, 0.7]} /><meshStandardMaterial color="#1f2937" />
    </mesh>
    <mesh position={[0.5, 1.1, 0.5]} rotation={[0.2, 0, 0]}>
      <boxGeometry args={[1.2, 0.04, 0.9]} /><meshStandardMaterial color={accent} />
    </mesh>
    {[0.2, 0.5, 0.8].map((x, i) => (
      <mesh key={i} position={[x, 0.87, 0.55]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 16]} /><meshStandardMaterial color="#f97316" />
      </mesh>
    ))}
  </group>
);

// ── Street / outdoor ────────────────────────────────────────────────
const StreetLamp = ({ accent }) => (
  <group>
    <mesh position={[0.5, 1.2, 0.5]} castShadow>
      <cylinderGeometry args={[0.04, 0.06, 2.4, 8]} /><meshStandardMaterial color="#374151" />
    </mesh>
    <mesh position={[0.5, 2.45, 0.5]}>
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial color="#fde68a" emissive="#fcd34d" emissiveIntensity={0.9} />
    </mesh>
  </group>
);
const CityStreetSign = ({ accent }) => (
  <group>
    <mesh position={[0.5, 1.2, 0.5]} castShadow>
      <cylinderGeometry args={[0.03, 0.03, 2.4, 8]} /><meshStandardMaterial color="#4b5563" />
    </mesh>
    <mesh position={[0.5, 2.4, 0.5]}>
      <boxGeometry args={[0.8, 0.15, 0.04]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 2.55, 0.5]}>
      <boxGeometry args={[0.6, 0.12, 0.04]} /><meshStandardMaterial color="#1f2937" />
    </mesh>
  </group>
);
const FireHydrant = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.25, 0.5]} castShadow>
      <cylinderGeometry args={[0.1, 0.12, 0.5, 16]} /><meshStandardMaterial color="#dc2626" />
    </mesh>
    <mesh position={[0.5, 0.55, 0.5]}>
      <sphereGeometry args={[0.12, 16, 12]} /><meshStandardMaterial color="#dc2626" />
    </mesh>
    <mesh position={[0.6, 0.35, 0.5]}>
      <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} rotation={[0, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#fbbf24" />
    </mesh>
  </group>
);
const VenueBillboard = ({ accent }) => (
  <group>
    <mesh position={[0.5, 2, 0.5]} castShadow>
      <boxGeometry args={[2, 1.2, 0.1]} /><meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0.5, 2, 0.45]}>
      <boxGeometry args={[1.8, 1, 0.02]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.5, 0.6, 0.5]}>
      <cylinderGeometry args={[0.06, 0.06, 1.2, 8]} /><meshStandardMaterial color="#374151" />
    </mesh>
  </group>
);
const NewspaperStand = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow>
      <boxGeometry args={[0.6, 0.8, 0.4]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 0.85, 0.5]} rotation={[0.3, 0, 0]}>
      <boxGeometry args={[0.55, 0.02, 0.35]} /><meshStandardMaterial color="#f8fafc" />
    </mesh>
  </group>
);
const ParkBench = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.25, 0.5]} castShadow>
      <boxGeometry args={[1.6, 0.08, 0.4]} /><meshStandardMaterial color="#92400e" />
    </mesh>
    <mesh position={[0.5, 0.58, 0.3]} castShadow>
      <boxGeometry args={[1.6, 0.5, 0.08]} /><meshStandardMaterial color="#92400e" />
    </mesh>
    {[-0.65, 0.65].map((x, i) => (
      <mesh key={i} position={[0.5 + x, 0.12, 0.5]}>
        <boxGeometry args={[0.08, 0.24, 0.36]} /><meshStandardMaterial color="#4b5563" />
      </mesh>
    ))}
  </group>
);
const TrashBinStreet = ({ accent }) => (
  <mesh position={[0.5, 0.35, 0.5]} castShadow>
    <cylinderGeometry args={[0.18, 0.2, 0.7, 20]} />
    <meshStandardMaterial color="#1f2937" />
  </mesh>
);

// ── Nature ──────────────────────────────────────────────────────────
const TreeLarge = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.9, 0.5]} castShadow>
      <cylinderGeometry args={[0.12, 0.2, 1.8, 12]} /><meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0.5, 2.1, 0.5]} castShadow>
      <sphereGeometry args={[0.9, 18, 14]} /><meshStandardMaterial color="#16a34a" />
    </mesh>
  </group>
);
const TreeSmall = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.5, 0.5]} castShadow>
      <cylinderGeometry args={[0.06, 0.1, 1, 10]} /><meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0.5, 1.2, 0.5]} castShadow>
      <sphereGeometry args={[0.45, 14, 12]} /><meshStandardMaterial color="#22c55e" />
    </mesh>
  </group>
);
const FlowerPot = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.2, 0.5]} castShadow>
      <cylinderGeometry args={[0.18, 0.14, 0.4, 16]} /><meshStandardMaterial color="#b45309" />
    </mesh>
    {[0.3, 0.5, 0.7].map((x, i) => (
      <mesh key={i} position={[x, 0.5, 0.5]}>
        <sphereGeometry args={[0.08, 10, 8]} />
        <meshStandardMaterial color={i === 1 ? accent : "#f472b6"} />
      </mesh>
    ))}
  </group>
);
const Fountain = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.15, 0.5]} receiveShadow>
      <cylinderGeometry args={[0.9, 1.0, 0.3, 24]} /><meshStandardMaterial color="#cbd5e1" />
    </mesh>
    <mesh position={[0.5, 0.3, 0.5]}>
      <cylinderGeometry args={[0.85, 0.85, 0.05, 24]} />
      <meshStandardMaterial color="#38bdf8" transparent opacity={0.65} />
    </mesh>
    <mesh position={[0.5, 0.6, 0.5]}>
      <cylinderGeometry args={[0.08, 0.12, 0.6, 12]} /><meshStandardMaterial color="#94a3b8" />
    </mesh>
    <mesh position={[0.5, 1.0, 0.5]}>
      <sphereGeometry args={[0.16, 14, 10]} />
      <meshStandardMaterial color="#7dd3fc" transparent opacity={0.8} />
    </mesh>
  </group>
);

// ── Beach / Park / Tourist ──────────────────────────────────────────
const SurfboardRack = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.2, 0.5]} castShadow>
      <boxGeometry args={[1.2, 0.06, 0.3]} /><meshStandardMaterial color="#78350f" />
    </mesh>
    {[["#f87171", -0.3], [accent, 0], ["#60a5fa", 0.3]].map(([c, x], i) => (
      <mesh key={i} position={[0.5 + x, 0.7, 0.5]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.28, 1.5, 0.05]} />
        <meshStandardMaterial color={c} />
      </mesh>
    ))}
  </group>
);
const BeachUmbrella = ({ accent }) => (
  <group>
    <mesh position={[0.5, 1.1, 0.5]}>
      <cylinderGeometry args={[0.03, 0.03, 2.2, 8]} /><meshStandardMaterial color="#e5e7eb" />
    </mesh>
    <mesh position={[0.5, 2.2, 0.5]}>
      <coneGeometry args={[0.9, 0.5, 20, 1, true]} />
      <meshStandardMaterial color={accent} side={2} />
    </mesh>
  </group>
);
const PhotoSpot = ({ accent }) => (
  <group>
    {/* Floor mark */}
    <mesh position={[0.5, 0.02, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.6, 0.75, 40]} />
      <meshBasicMaterial color={accent} transparent opacity={0.7} />
    </mesh>
    {/* Camera icon poster */}
    <mesh position={[0.5, 1.2, 0.5]}>
      <boxGeometry args={[0.6, 0.6, 0.04]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0.5, 1.2, 0.53]}>
      <sphereGeometry args={[0.12, 16, 12]} />
      <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
    </mesh>
    <mesh position={[0.5, 0.5, 0.5]}>
      <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
      <meshStandardMaterial color="#64748b" />
    </mesh>
  </group>
);
const SouvenirStall = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow>
      <boxGeometry args={[1, 0.8, 0.7]} /><meshStandardMaterial color="#92400e" />
    </mesh>
    <mesh position={[0.5, 0.88, 0.5]}>
      <boxGeometry args={[1.1, 0.04, 0.8]} /><meshStandardMaterial color={accent} />
    </mesh>
    {[0.25, 0.5, 0.75].map((x, i) => (
      <group key={i}>
        <mesh position={[x, 0.93, 0.5]}>
          <boxGeometry args={[0.15, 0.12, 0.1]} />
          <meshStandardMaterial color={["#dc2626", "#facc15", "#38bdf8"][i]} />
        </mesh>
      </group>
    ))}
  </group>
);
const InformationKiosk = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.4, 0.5]} castShadow>
      <cylinderGeometry args={[0.35, 0.35, 0.8, 12]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 0.9, 0.5]}>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} /><meshStandardMaterial color="#0f172a" />
    </mesh>
    <mesh position={[0.5, 1.1, 0.5]}>
      <boxGeometry args={[0.3, 0.3, 0.05]} />
      <meshStandardMaterial color="#f8fafc" />
    </mesh>
  </group>
);
const TourMapStand = ({ accent }) => (
  <group>
    <mesh position={[0.5, 0.75, 0.5]} rotation={[0.6, 0, 0]} castShadow>
      <boxGeometry args={[0.8, 0.6, 0.05]} /><meshStandardMaterial color={accent} />
    </mesh>
    <mesh position={[0.5, 0.4, 0.5]}>
      <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} /><meshStandardMaterial color="#374151" />
    </mesh>
  </group>
);

// ── Type → component registry ───────────────────────────────────────
const PROP_IMPLS = {
  // Restaurant / Café
  tableRestaurant: TableRestaurant,
  chairRestaurant: ChairRestaurant,
  menuBoard: MenuBoard,
  kitchenCounter: KitchenCounter,
  orderingWindow: OrderingWindow,
  coffeeMachine: CoffeeMachine,
  // Market / Souk
  goldCounter: GoldCounter,
  spiceRack: SpiceRack,
  fruitCart: FruitCart,
  textileRoll: TextileRoll,
  hawkerStall: HawkerStall,
  // Street / outdoor
  streetLamp: StreetLamp,
  cityStreetSign: CityStreetSign,
  fireHydrant: FireHydrant,
  venueBillboard: VenueBillboard,
  newspaperStand: NewspaperStand,
  parkBench: ParkBench,
  trashBinStreet: TrashBinStreet,
  // Nature
  treeLarge: TreeLarge,
  treeSmall: TreeSmall,
  flowerPot: FlowerPot,
  fountain: Fountain,
  // Beach / Park / Tourist
  surfboardRack: SurfboardRack,
  beachUmbrella: BeachUmbrella,
  photoSpot: PhotoSpot,
  souvenirStall: SouvenirStall,
  informationKiosk: InformationKiosk,
  tourMapStand: TourMapStand,
};

/** @returns {string[]} list of registered prop types. */
export const listPropTypes = () => Object.keys(PROP_IMPLS);

export default Prop;
