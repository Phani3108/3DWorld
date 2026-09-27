import { useLayoutEffect, useRef } from "react";
import { Color, type InstancedMesh, Matrix4, Quaternion, Vector3 } from "three";

const CANOPIES = ["#4f6b3a", "#5b7a3f", "#46613a", "#6a8446"];

/** Street and park trees from mapped points (flat x,z pairs): 2 draw calls for any count. */
export const Trees = ({ points }: { points: number[] }) => {
  const trunks = useRef<InstancedMesh>(null);
  const canopies = useRef<InstancedMesh>(null);
  const count = points.length / 2;

  useLayoutEffect(() => {
    const m = new Matrix4();
    const q = new Quaternion();
    const c = new Color();
    for (let i = 0; i < count; i++) {
      const x = points[i * 2]!;
      const z = points[i * 2 + 1]!;
      const r = Math.abs(Math.sin(x * 12.9898 + z * 78.233)) % 1; // stable per-tree variation
      const h = 5 + r * 7;
      q.setFromAxisAngle(new Vector3(0, 1, 0), r * Math.PI * 2);
      trunks.current?.setMatrixAt(
        i,
        m.compose(new Vector3(x, h * 0.3, z), q, new Vector3(1, h * 0.6, 1)),
      );
      const s = h * 0.34;
      canopies.current?.setMatrixAt(
        i,
        m.compose(new Vector3(x, h * 0.72, z), q, new Vector3(s, s * 0.9, s)),
      );
      canopies.current?.setColorAt(i, c.set(CANOPIES[Math.floor(r * CANOPIES.length)]!));
    }
    for (const mesh of [trunks.current, canopies.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [points, count]);

  if (count === 0) return null;
  return (
    <group>
      <instancedMesh ref={trunks} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1, 6]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={canopies} args={[undefined, undefined, count]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
    </group>
  );
};
