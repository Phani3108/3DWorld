import {
  type DistrictGeometry,
  localFrame,
  type PublicDistrict,
  type PublicPlace,
} from "@3dworld/contracts";
import { Html } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useSetAtom } from "jotai";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";
import { walkTargetAtom } from "../../state/store.ts";
import { type CityStyle, styleFor } from "./cityStyle.ts";
import { createFacadeMaterial } from "./facadeMaterial.ts";
import { LANDMARK_BY_KEY, LANDMARK_MODELS } from "./Landmarks.tsx";
import {
  type AreaKind,
  buildAreas,
  buildBuildings,
  buildStreets,
  footprintFrame,
  lampsForStreets,
} from "./osmMeshes.ts";
import { lampsAlong, StreetLamps } from "./StreetLamps.tsx";
import { type Box, generateStandIn, type Strip } from "./standInCity.ts";
import { Trees } from "./Vegetation.tsx";

const Y = new Vector3(0, 1, 0);

/** Named historic buildings get their real stone colours instead of a facade palette. */
const NAMED_COLOURS: Record<string, string> = {
  "Mecca Masjid": "#8c8579",
  "Char Kaman": "#d9ccad",
  "Shahi Maqbara": "#bfb29a",
  "Bhagyalaxmi Temple": "#e8e2d4",
};

const COMMERCIAL = new Set([
  "restaurant",
  "tea_stall",
  "cafe",
  "bar",
  "deli",
  "corner_store",
  "kopitiam",
  "chippery",
  "food_stall",
  "majlis",
]);

export type Bounds =
  | { minX: number; minZ: number; maxX: number; maxZ: number }
  | { radius: number };

const useInstances = <T,>(items: T[], write: (item: T, m: Matrix4, c: Color) => void) => {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const c = new Color();
    items.forEach((item, i) => {
      write(item, m, c);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, write]);
  return ref;
};

const Storefront = ({ place }: { place: PublicPlace }) => (
  <group>
    <mesh position={[0, 2.4, -1]} castShadow receiveShadow>
      <boxGeometry args={[9, 4.8, 7]} />
      <meshStandardMaterial color="#e9dcc3" roughness={0.9} />
    </mesh>
    <mesh position={[0, 1.4, 2.52]}>
      <planeGeometry args={[2.2, 2.8]} />
      <meshStandardMaterial color="#2a2118" roughness={0.8} />
    </mesh>
    {[-3, 3].map((x) => (
      <mesh key={x} position={[x, 1.6, 2.52]}>
        <planeGeometry args={[2.4, 1.8]} />
        <meshStandardMaterial
          color="#1c2733"
          roughness={0.2}
          metalness={0.3}
          emissive="#ffcf8a"
          emissiveIntensity={0.15}
        />
      </mesh>
    ))}
    <mesh position={[0, 3.3, 3.3]} rotation={[0.35, 0, 0]} castShadow>
      <boxGeometry args={[8.6, 0.08, 1.8]} />
      <meshStandardMaterial color="#b3432f" roughness={0.8} />
    </mesh>
    <mesh position={[0, 4.35, 2.56]}>
      <boxGeometry args={[6, 0.8, 0.1]} />
      <meshStandardMaterial color="#1d2a3a" roughness={0.6} />
    </mesh>
    {place.kind === "tea_stall" || place.kind === "kopitiam" || place.kind === "cafe"
      ? [-2.6, 2.6].map((x) => (
          <mesh key={x} position={[x, 0.4, 4.6]} castShadow>
            <cylinderGeometry args={[0.45, 0.45, 0.8, 16]} />
            <meshStandardMaterial color="#d8d4cc" roughness={0.4} />
          </mesh>
        ))
      : null}
  </group>
);

const Plaza = ({ radius, colour }: { radius: number; colour: string }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
    <circleGeometry args={[radius, 48]} />
    <meshStandardMaterial color={colour} roughness={0.95} />
  </mesh>
);

const PlaceLabel = ({ place, height }: { place: PublicPlace; height: number }) => (
  <Html
    position={[0, height, 0]}
    center
    distanceFactor={40}
    zIndexRange={[10, 0]}
    style={{ pointerEvents: "none" }}
  >
    <div className="rounded-full bg-ink/80 px-3 py-1 text-sm whitespace-nowrap text-text shadow-lg ring-1 ring-line">
      <span aria-hidden="true">{place.emoji}</span> {place.name}
    </div>
  </Html>
);

/** Real streets and buildings compiled from OpenStreetMap. */
const OsmDistrict = ({
  geometry,
  style,
  places,
  frame,
}: {
  geometry: DistrictGeometry;
  style: CityStyle;
  places: PublicPlace[];
  frame: ReturnType<typeof localFrame>;
}) => {
  const streets = useMemo(() => buildStreets(geometry), [geometry]);
  const areas = useMemo(() => buildAreas(geometry), [geometry]);
  const areaColour: Record<AreaKind, string> = {
    water: "#3b6b82",
    land: style.ground,
    beach: "#dccb9f",
    park: "#5f7d45",
    plaza: "#b9ab90",
    parking: "#5b5b5e",
  };
  const buildings = useMemo(
    () => buildBuildings(geometry, style.facades, NAMED_COLOURS),
    [geometry, style],
  );
  const facade = useMemo(() => createFacadeMaterial(style.floorHeight, true), [style.floorHeight]);
  const lamps = useMemo(() => lampsForStreets(geometry), [geometry]);
  const landmarks = geometry.buildings.filter((b) => b.landmark && LANDMARK_BY_KEY[b.landmark]);
  const venues = new Map(geometry.venues.map((v) => [v.placeId, v]));

  return (
    <group>
      <mesh geometry={streets.sidewalk} receiveShadow>
        <meshStandardMaterial color={style.sidewalk} roughness={0.92} />
      </mesh>
      <mesh geometry={streets.asphalt} receiveShadow>
        <meshStandardMaterial color={style.road} roughness={0.95} />
      </mesh>
      <mesh geometry={streets.paving} receiveShadow>
        <meshStandardMaterial color="#b9ab90" roughness={0.9} />
      </mesh>
      {[...areas].map(([kind, g]) => (
        <mesh key={kind} geometry={g} receiveShadow>
          <meshStandardMaterial
            color={areaColour[kind]}
            roughness={kind === "water" ? 0.12 : 0.95}
            metalness={kind === "water" ? 0.05 : 0}
          />
        </mesh>
      ))}
      <mesh geometry={buildings} material={facade} castShadow receiveShadow />
      <Trees points={geometry.trees} />
      {landmarks.map((b) => {
        const Model = LANDMARK_BY_KEY[b.landmark!]!;
        const f = footprintFrame(b.ring);
        return (
          <group key={b.id} position={[f.x, 0, f.z]} rotation={[0, f.yaw, 0]}>
            <Model />
          </group>
        );
      })}
      <StreetLamps lamps={lamps} />
      {places.map((place) => {
        const venue = venues.get(place.id);
        if (venue) {
          return (
            <group key={place.id} position={[venue.x, 0, venue.z]} rotation={[0, venue.yaw, 0]}>
              <Storefront place={place} />
              <PlaceLabel place={place} height={7} />
            </group>
          );
        }
        const at = frame.toLocal(place.location);
        const isLandmark = landmarks.length > 0 && place.kind === "landmark";
        return (
          <group key={place.id} position={[at.x, 0, at.z]}>
            <PlaceLabel place={place} height={isLandmark ? 58 : 8} />
          </group>
        );
      })}
    </group>
  );
};

const stripMatrix = (y: number, colour: string) => (s: Strip, m: Matrix4, c: Color) => {
  m.compose(
    new Vector3(s.x, y, s.z),
    new Quaternion().setFromAxisAngle(Y, s.rot),
    new Vector3(s.width, 1, s.length),
  );
  c.set(colour);
};

const writeBox = (b: Box, m: Matrix4, c: Color) => {
  m.compose(
    new Vector3(b.x, b.h / 2, b.z),
    new Quaternion().setFromAxisAngle(Y, b.rot),
    new Vector3(b.w, b.h, b.d),
  );
  c.set(b.colour);
};

/** Seeded procedural stand-in for districts whose map data isn't compiled yet. */
const StandInDistrict = ({
  district,
  style,
  places,
  frame,
}: {
  district: PublicDistrict;
  style: CityStyle;
  places: PublicPlace[];
  frame: ReturnType<typeof localFrame>;
}) => {
  const spawn = useMemo(() => frame.toLocal(district.spawn), [frame, district.spawn]);
  const local = useMemo(
    () => places.map((p) => ({ place: p, at: frame.toLocal(p.location) })),
    [places, frame],
  );
  const city = useMemo(
    () =>
      generateStandIn({
        seed: district.id,
        radius: district.radiusM,
        style,
        clear: [
          { ...spawn, r: 14 },
          ...local.map(({ place, at }) => ({
            ...at,
            r: LANDMARK_MODELS[place.id] ? 40 : place.kind === "park" ? 45 : 16,
          })),
        ],
      }),
    [district.id, district.radiusM, style, spawn, local],
  );
  const facade = useMemo(() => createFacadeMaterial(style.floorHeight), [style.floorHeight]);
  const roadWrite = useMemo(() => stripMatrix(0.02, style.road), [style.road]);
  const walkWrite = useMemo(() => stripMatrix(0.08, style.sidewalk), [style.sidewalk]);
  const roadsRef = useInstances(city.roads, roadWrite);
  const walksRef = useInstances(city.sidewalks, walkWrite);
  const buildingsRef = useInstances(city.buildings, writeBox);
  const lamps = useMemo(
    () => lampsAlong(city.sidewalks, district.radiusM),
    [city.sidewalks, district.radiusM],
  );

  return (
    <group>
      <instancedMesh ref={roadsRef} args={[undefined, undefined, city.roads.length]} receiveShadow>
        <boxGeometry args={[1, 0.04, 1]} />
        <meshStandardMaterial roughness={0.95} />
      </instancedMesh>
      <instancedMesh
        ref={walksRef}
        args={[undefined, undefined, city.sidewalks.length]}
        receiveShadow
      >
        <boxGeometry args={[1, 0.16, 1]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh
        ref={buildingsRef}
        args={[undefined, facade, city.buildings.length]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
      <StreetLamps lamps={lamps} />
      {local.map(({ place, at }) => {
        const Landmark = LANDMARK_MODELS[place.id];
        const facing = Math.atan2(spawn.x - at.x, spawn.z - at.z);
        return (
          <group key={place.id} position={[at.x, 0, at.z]}>
            {Landmark ? (
              <>
                <Plaza radius={38} colour={style.sidewalk} />
                <Landmark />
              </>
            ) : place.kind === "park" ? (
              <Plaza radius={45} colour="#5f7a45" />
            ) : COMMERCIAL.has(place.kind) ? (
              <group rotation={[0, facing, 0]}>
                <Storefront place={place} />
              </group>
            ) : (
              <Plaza radius={Math.max(12, place.radiusM * 1.5)} colour={style.sidewalk} />
            )}
            <PlaceLabel place={place} height={Landmark ? 58 : 7} />
          </group>
        );
      })}
    </group>
  );
};

/** Walkable limits: the mapped area when real data exists, else the district radius. */
export const boundsFor = (
  district: PublicDistrict,
  geometry: DistrictGeometry | undefined,
): Bounds => (geometry ? geometry.bounds : { radius: district.radiusM + 40 });

export const District = ({
  cityId,
  district,
  places,
  geometry,
}: {
  cityId: string;
  district: PublicDistrict;
  places: PublicPlace[];
  geometry: DistrictGeometry | undefined;
}) => {
  const style = styleFor(cityId);
  const frame = useMemo(() => localFrame(district.origin), [district.origin]);
  const setWalkTarget = useSetAtom(walkTargetAtom);

  const down = useRef<{ x: number; y: number } | null>(null);
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    down.current = { x: e.nativeEvent.clientX, y: e.nativeEvent.clientY };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = down.current;
    down.current = null;
    if (!d || e.nativeEvent.button !== 0) return;
    if (Math.hypot(e.nativeEvent.clientX - d.x, e.nativeEvent.clientY - d.y) > 6) return; // a drag, not a click
    e.stopPropagation();
    setWalkTarget({ x: e.point.x, z: e.point.z, label: "the spot you picked" });
  };

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onPointerDown={onDown} onPointerUp={onUp}>
        <circleGeometry args={[district.radiusM + 400, 96]} />
        <meshStandardMaterial color={style.ground} roughness={1} />
      </mesh>
      {geometry ? (
        <OsmDistrict geometry={geometry} style={style} places={places} frame={frame} />
      ) : (
        <StandInDistrict district={district} style={style} places={places} frame={frame} />
      )}
    </group>
  );
};
