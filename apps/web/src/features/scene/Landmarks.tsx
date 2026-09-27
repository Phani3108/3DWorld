import { useMemo } from "react";
import { DoubleSide } from "three";

const STONE = "#d6c7a4";
const STONE_DARK = "#b9a882";
const SHADOW = "#3a3226";

/**
 * Charminar (1591), procedurally: a ~20 m square arch pavilion with four
 * fluted minarets, balconies and domed caps. Minaret spacing (23.5 m) is
 * measured from the OpenStreetMap footprint; heights are approximate — a
 * stand-in until a surveyed model replaces it.
 */
export const Charminar = () => {
  const side = 21;
  const span = 23.5;
  const bodyH = 21;
  const minaretH = 48;
  const minaretR = 1.7;
  const corners = useMemo(
    () =>
      [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const,
    [],
  );

  return (
    <group>
      {/* plinth */}
      <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[span + 6, 1.2, span + 6]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.95} />
      </mesh>
      {/* main body with four great arches (dark recesses on each face) */}
      <mesh position={[0, 1.2 + bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[side, bodyH, side]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot) => (
        <group key={rot} rotation={[0, rot, 0]}>
          <mesh position={[0, 1.2 + 6.5, side / 2 + 0.02]}>
            <planeGeometry args={[9, 13]} />
            <meshStandardMaterial color={SHADOW} roughness={1} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 1.2 + 13, side / 2 + 0.02]} rotation={[0, 0, 0]}>
            <circleGeometry args={[4.5, 24, 0, Math.PI]} />
            <meshStandardMaterial color={SHADOW} roughness={1} side={DoubleSide} />
          </mesh>
          {/* upper gallery: a row of small arches */}
          {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((x) => (
            <mesh key={x} position={[x, 1.2 + bodyH - 3.2, side / 2 + 0.02]}>
              <planeGeometry args={[1.6, 2.6]} />
              <meshStandardMaterial color={SHADOW} roughness={1} side={DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* parapet */}
      <mesh position={[0, 1.2 + bodyH + 0.6, 0]} castShadow>
        <boxGeometry args={[side + 0.6, 1.2, side + 0.6]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
      </mesh>
      {corners.map(([sx, sz]) => (
        <group key={`${sx}${sz}`} position={[(sx * span) / 2, 1.2, (sz * span) / 2]}>
          <mesh position={[0, minaretH / 2, 0]} castShadow>
            <cylinderGeometry args={[minaretR * 0.8, minaretR * 1.15, minaretH, 16]} />
            <meshStandardMaterial color={STONE} roughness={0.85} />
          </mesh>
          {[bodyH + 1, bodyH + 11, bodyH + 19].map((y) => (
            <mesh key={y} position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[minaretR * 1.55, minaretR * 1.35, 0.8, 16]} />
              <meshStandardMaterial color={STONE_DARK} roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[0, minaretH + 1.4, 0]} castShadow>
            <sphereGeometry args={[minaretR * 1.05, 16, 12]} />
            <meshStandardMaterial color={STONE} roughness={0.8} />
          </mesh>
          <mesh position={[0, minaretH + 3.2, 0]}>
            <coneGeometry args={[0.25, 1.6, 8]} />
            <meshStandardMaterial color="#a88c4a" roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Hand-built landmark stand-ins, keyed by place id (procedural districts)… */
export const LANDMARK_MODELS: Record<string, () => React.JSX.Element> = {
  hyd_charminar_bazaar: Charminar,
};

/** …and by the `landmark` key the OSM compiler puts on a real footprint. */
export const LANDMARK_BY_KEY: Record<string, () => React.JSX.Element> = {
  charminar: Charminar,
};
