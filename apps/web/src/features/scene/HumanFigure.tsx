import type { Anim } from "@3dworld/contracts";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import type { Build } from "./look.ts";

/**
 * Stand-in human (≈1.6–1.8 m, real proportions) until the rigged realistic
 * bodies land. Gait is driven by distance travelled so feet don't skate.
 */
export const HumanFigure = ({
  build,
  anim,
  speed,
  talking = false,
}: {
  build: Build;
  anim: Anim;
  /** Ground speed in m/s (drives the gait). */
  speed: React.RefObject<number>;
  talking?: boolean;
}) => {
  const H = build.height;
  const dims = useMemo(() => {
    const leg = 0.47 * H;
    const torso = 0.3 * H;
    return {
      thigh: leg * 0.52,
      shin: leg * 0.48,
      hipY: leg,
      torso,
      upperArm: 0.17 * H,
      forearm: 0.15 * H,
      head: 0.062 * H,
      limb: 0.045 * H,
    };
  }, [H]);

  const refs = {
    body: useRef<Group>(null),
    lHip: useRef<Group>(null),
    rHip: useRef<Group>(null),
    lKnee: useRef<Group>(null),
    rKnee: useRef<Group>(null),
    lShoulder: useRef<Group>(null),
    rShoulder: useRef<Group>(null),
    lElbow: useRef<Group>(null),
    rElbow: useRef<Group>(null),
    head: useRef<Group>(null),
  };
  const phase = useRef(Math.random() * Math.PI * 2);

  useFrame((state, dt) => {
    const v = Math.min(speed.current ?? 0, 6);
    const moving = v > 0.15 || anim === "walk" || anim === "run";
    const stride = 1.3 * H * 0.47 * (v > 2.5 ? 1.5 : 1);
    phase.current += (moving ? v / stride : 0) * dt * Math.PI * 2 * build.pace;
    const s = Math.sin(phase.current);
    const amp = moving ? Math.min(1, v / 1.4) : 0;
    const t = state.clock.elapsedTime;
    const legSwing = 0.45 * amp;
    const armSwing = 0.35 * amp;

    refs.lHip.current?.rotation.set(s * legSwing, 0, 0);
    refs.rHip.current?.rotation.set(-s * legSwing, 0, 0);
    refs.lKnee.current?.rotation.set(Math.max(0, -Math.cos(phase.current)) * 0.7 * amp, 0, 0);
    refs.rKnee.current?.rotation.set(Math.max(0, Math.cos(phase.current)) * 0.7 * amp, 0, 0);

    const wave = anim === "wave";
    const gesture = talking ? Math.sin(t * 3.1) * 0.25 : 0;
    refs.lShoulder.current?.rotation.set(-s * armSwing + (talking ? -0.5 + gesture : 0), 0, 0.06);
    refs.rShoulder.current?.rotation.set(
      wave ? -2.6 : s * armSwing,
      0,
      wave ? -0.3 + Math.sin(t * 8) * 0.3 : -0.06,
    );
    refs.lElbow.current?.rotation.set(talking ? -0.9 : -0.15 - 0.3 * amp, 0, 0);
    refs.rElbow.current?.rotation.set(wave ? -0.4 : -0.15 - 0.3 * amp, 0, 0);

    const breathe = Math.sin(t * 1.6) * 0.004 * H;
    if (refs.body.current) {
      refs.body.current.position.y =
        dims.hipY + Math.abs(Math.cos(phase.current)) * 0.025 * amp + breathe;
      refs.body.current.rotation.x = build.stoop + 0.05 * amp;
    }
    if (refs.head.current) {
      refs.head.current.rotation.y = talking ? Math.sin(t * 1.3) * 0.15 : Math.sin(t * 0.3) * 0.2;
      refs.head.current.rotation.x = -build.stoop * 0.8;
    }
  });

  const limb = dims.limb;
  const skin = <meshStandardMaterial color={build.skin} roughness={0.55} />;
  const top = <meshStandardMaterial color={build.top} roughness={0.9} />;
  const bottom = <meshStandardMaterial color={build.bottom} roughness={0.9} />;
  const shoes = <meshStandardMaterial color={build.shoes} roughness={0.6} />;

  const leg = (
    side: 1 | -1,
    hip: React.RefObject<Group | null>,
    knee: React.RefObject<Group | null>,
  ) => (
    <group ref={hip} position={[side * build.hips * 0.3, 0, 0]}>
      <mesh position={[0, -dims.thigh / 2, 0]} castShadow>
        <capsuleGeometry args={[limb * 1.25, dims.thigh - limb * 2, 4, 10]} />
        {bottom}
      </mesh>
      <group ref={knee} position={[0, -dims.thigh, 0]}>
        <mesh position={[0, -dims.shin / 2, 0]} castShadow>
          <capsuleGeometry args={[limb, dims.shin - limb * 2, 4, 10]} />
          {bottom}
        </mesh>
        <mesh position={[0, -dims.shin + 0.035, 0.05]} castShadow>
          <boxGeometry args={[limb * 2.1, 0.07, 0.25]} />
          {shoes}
        </mesh>
      </group>
    </group>
  );

  const arm = (
    side: 1 | -1,
    shoulder: React.RefObject<Group | null>,
    elbow: React.RefObject<Group | null>,
  ) => (
    <group ref={shoulder} position={[side * build.shoulders * 0.5, dims.torso * 0.92, 0]}>
      <mesh position={[0, -dims.upperArm / 2, 0]} castShadow>
        <capsuleGeometry args={[limb * 0.95, dims.upperArm - limb * 1.8, 4, 10]} />
        {top}
      </mesh>
      <group ref={elbow} position={[0, -dims.upperArm, 0]}>
        <mesh position={[0, -dims.forearm / 2, 0]} castShadow>
          <capsuleGeometry args={[limb * 0.8, dims.forearm - limb * 1.6, 4, 10]} />
          {skin}
        </mesh>
        <mesh position={[0, -dims.forearm - 0.02, 0]} castShadow>
          <sphereGeometry args={[limb * 0.95, 12, 10]} />
          {skin}
        </mesh>
      </group>
    </group>
  );

  return (
    <group>
      <group ref={refs.body} position={[0, dims.hipY, 0]}>
        {leg(1, refs.lHip, refs.lKnee)}
        {leg(-1, refs.rHip, refs.rKnee)}
        <mesh position={[0, dims.torso * 0.5, 0]} castShadow>
          <capsuleGeometry args={[build.shoulders * 0.36, dims.torso * 0.62, 6, 14]} />
          {top}
        </mesh>
        {arm(1, refs.lShoulder, refs.lElbow)}
        {arm(-1, refs.rShoulder, refs.rElbow)}
        <group ref={refs.head} position={[0, dims.torso + dims.head * 0.9, 0]}>
          <mesh position={[0, -dims.head * 0.55, 0]} castShadow>
            <cylinderGeometry args={[limb * 0.9, limb, dims.head * 0.6, 12]} />
            {skin}
          </mesh>
          <mesh position={[0, dims.head * 0.35, 0]} castShadow scale={[0.9, 1.08, 0.98]}>
            <sphereGeometry args={[dims.head, 20, 16]} />
            {skin}
          </mesh>
          <mesh
            position={[0, dims.head * 0.55, -dims.head * 0.08]}
            scale={[0.96, build.hairLong ? 1.05 : 0.8, 1.02]}
          >
            <sphereGeometry
              args={[
                dims.head * 1.02,
                20,
                16,
                0,
                Math.PI * 2,
                0,
                build.hairLong ? Math.PI * 0.62 : Math.PI * 0.45,
              ]}
            />
            <meshStandardMaterial color={build.hair} roughness={0.5} />
          </mesh>
          {build.hairLong && (
            <mesh position={[0, -dims.head * 0.1, -dims.head * 0.55]} castShadow>
              <boxGeometry args={[dims.head * 1.7, dims.head * 1.8, dims.head * 0.5]} />
              <meshStandardMaterial color={build.hair} roughness={0.5} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};
