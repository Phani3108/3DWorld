import { MeshStandardMaterial } from "three";

/** 0 = day, 1 = night. Written by the sky each frame; read by facade shaders. */
export const nightUniform = { value: 0 };

/**
 * Buildings get storeys, windows and shopfronts from world-space position,
 * so one instanced box per building still reads as architecture. Windows
 * light up at night in a stable per-window pattern.
 */
export const createFacadeMaterial = (floorHeight: number, vertexColors = false) => {
  const m = new MeshStandardMaterial({ roughness: 0.92, metalness: 0, vertexColors });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uNight = nightUniform;
    shader.uniforms.uFloor = { value: floorHeight };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vFacadePos;\nvarying vec3 vFacadeNormal;",
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 facadeWorld = vec4(transformed, 1.0);
        vec3 facadeN = objectNormal;
        #ifdef USE_INSTANCING
          facadeWorld = instanceMatrix * facadeWorld;
          facadeN = mat3(instanceMatrix) * facadeN;
        #endif
        vFacadePos = (modelMatrix * facadeWorld).xyz;
        vFacadeNormal = normalize(mat3(modelMatrix) * facadeN);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vFacadePos;
        varying vec3 vFacadeNormal;
        uniform float uNight;
        uniform float uFloor;
        float facadeHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float facadeLit = 0.0;
        if (abs(vFacadeNormal.y) < 0.5) {
          vec2 along = normalize(vec2(-vFacadeNormal.z, vFacadeNormal.x));
          vec2 f = vec2(dot(vFacadePos.xz, along), vFacadePos.y);
          if (f.y < uFloor * 0.85) {
            diffuseColor.rgb *= 0.72; // shopfront band
          } else {
            vec2 cell = f / vec2(3.0, uFloor);
            vec2 c = fract(cell);
            float win = step(0.2, c.x) * step(c.x, 0.8) * step(0.25, c.y) * step(c.y, 0.8);
            diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.07, 0.08, 0.1), win * 0.82);
            facadeLit = win * step(0.62, facadeHash(floor(cell) + floor(vFacadePos.xz / 40.0)));
          }
        } else if (vFacadeNormal.y > 0.5) {
          diffuseColor.rgb *= 0.78; // roof
        }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += facadeLit * uNight * vec3(1.0, 0.78, 0.45) * 1.6;`,
      );
  };
  return m;
};
