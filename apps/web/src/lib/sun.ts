/**
 * Solar position (NOAA spreadsheet algorithm; ~0.01° over 1950–2050).
 * Returns altitude above the horizon and azimuth clockwise from north, in radians.
 */
const RAD = Math.PI / 180;

export type SunPosition = { altitude: number; azimuth: number };

export const sunPosition = (date: Date, lat: number, lon: number): SunPosition => {
  const jd = date.getTime() / 86_400_000 + 2_440_587.5;
  const t = (jd - 2_451_545) / 36_525;

  const L0 = (280.46646 + t * (36_000.76983 + t * 0.0003032)) % 360;
  const M = 357.52911 + t * (35_999.05029 - 0.0001537 * t);
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  const C =
    Math.sin(M * RAD) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * t) +
    Math.sin(3 * M * RAD) * 0.000289;
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * t;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * RAD);
  const decl = Math.asin(Math.sin(eps * RAD) * Math.sin(lambda * RAD));

  const y = Math.tan((eps / 2) * RAD) ** 2;
  const eqTime =
    4 *
    (1 / RAD) *
    (y * Math.sin(2 * L0 * RAD) -
      2 * e * Math.sin(M * RAD) +
      4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
      0.5 * y * y * Math.sin(4 * L0 * RAD) -
      1.25 * e * e * Math.sin(2 * M * RAD));

  const utcMinutes =
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60 +
    date.getUTCMilliseconds() / 60_000;
  const trueSolarMinutes = (((utcMinutes + eqTime + 4 * lon) % 1440) + 1440) % 1440;
  const hourAngle = (trueSolarMinutes / 4 - 180) * RAD;

  const phi = lat * RAD;
  const cosZenith =
    Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(hourAngle);
  const zenith = Math.acos(Math.min(1, Math.max(-1, cosZenith)));
  const altitude = Math.PI / 2 - zenith;
  const azimuth = Math.atan2(
    Math.sin(hourAngle),
    Math.cos(hourAngle) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi),
  );
  return { altitude, azimuth: (azimuth + Math.PI + 2 * Math.PI) % (2 * Math.PI) };
};

/**
 * Unit vector toward the sun in the scene frame (x east, y up, z south).
 */
export const sunDirection = ({ altitude, azimuth }: SunPosition) => {
  const horizontal = Math.cos(altitude);
  return {
    x: horizontal * Math.sin(azimuth),
    y: Math.sin(altitude),
    z: -horizontal * Math.cos(azimuth),
  };
};

/** 0 at night → 1 in full daylight, easing through civil twilight (-6°..+6°). */
export const daylight = (altitude: number) => {
  const deg = altitude / RAD;
  return Math.min(1, Math.max(0, (deg + 6) / 12));
};
