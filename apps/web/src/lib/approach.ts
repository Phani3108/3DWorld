import type { LocalPoint, PublicPlace } from "@3dworld/contracts";

type Frame = { toLocal: (p: { lat: number; lon: number }) => LocalPoint };

/** Where to walk to reach a place: the pavement outside its door if known, else its location. */
export const approachPoint = (place: PublicPlace, frame: Frame): LocalPoint => {
  if (!place.frontage) return frame.toLocal(place.location);
  const h = (place.frontage.yawDeg * Math.PI) / 180;
  const centre = frame.toLocal(place.frontage.location);
  return { x: centre.x + Math.sin(h) * 6, z: centre.z - Math.cos(h) * 6 };
};
