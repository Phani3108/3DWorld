import type { CityDetail, PublicDistrict } from "@3dworld/contracts";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, N8AO, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useState } from "react";
import { NoToneMapping } from "three";
import { useDistrictGeometry } from "../../lib/districtGeometry.ts";
import { RemotePlayers, Residents, SelfPlayer } from "./Actors.tsx";
import { boundsFor, District } from "./District.tsx";
import { SunSky } from "./SunSky.tsx";

const params = () => new URLSearchParams(typeof location === "undefined" ? "" : location.search);

/** `?debug` exposes the three.js state as window.__three (for e2e checks and debugging). */
const DebugHandle = () => {
  const state = useThree();
  (window as unknown as { __three?: unknown }).__three = state;
  return null;
};

/** `?at=2026-09-26T06:30:00Z` pins the sun to a moment (demos, screenshots, tests). */
const timeFromUrl = () => {
  const raw =
    typeof location === "undefined" ? null : new URLSearchParams(location.search).get("at");
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d : undefined;
};

export const Scene = ({ detail, district }: { detail: CityDetail; district: PublicDistrict }) => {
  const [quality, setQuality] = useState<"high" | "low">("high");
  const [pinnedTime] = useState(timeFromUrl);
  const reducedMotion =
    typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const residents = detail.residents.filter((r) =>
    detail.places.some((p) => p.id === r.homePlaceId && p.districtId === district.id),
  );
  const places = detail.places.filter((p) => p.districtId === district.id);
  const geometry = useDistrictGeometry(district);
  const mapReady = !district.geometry || geometry.isSuccess || geometry.isError;

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 2]}
      camera={{ fov: 50, near: 0.2, far: 5000, position: [0, 6, 12] }}
      gl={{ antialias: false, toneMapping: NoToneMapping, powerPreference: "high-performance" }}
      aria-hidden="true"
    >
      {params().has("debug") ? <DebugHandle /> : null}
      <PerformanceMonitor
        onDecline={() => setQuality("low")}
        onIncline={() => setQuality("high")}
      />
      <AdaptiveDpr pixelated={false} />
      <fogExp2 attach="fog" args={["#c9d3dc", 0.0009]} />
      <SunSky lat={district.origin.lat} lon={district.origin.lon} timeOverride={pinnedTime} />
      {mapReady ? (
        <District
          cityId={detail.city.id}
          district={district}
          places={places}
          geometry={geometry.data}
        />
      ) : null}
      <Residents residents={residents} cityId={detail.city.id} />
      <RemotePlayers />
      <SelfPlayer bounds={boundsFor(district, geometry.data)} />
      {params().get("fx") === "0" ? null : (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          {quality === "high" && !reducedMotion ? (
            <N8AO halfRes aoRadius={2.5} intensity={2.2} distanceFalloff={1} />
          ) : null}
          <Bloom mipmapBlur intensity={0.35} luminanceThreshold={0.9} />
          <ToneMapping mode={ToneMappingMode.AGX} />
          <SMAA />
        </EffectComposer>
      )}
    </Canvas>
  );
};
