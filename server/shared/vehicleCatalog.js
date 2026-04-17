/**
 * Vehicle catalog — mode of travel each character can adopt.
 *
 * Each vehicle has a display label, an emoji, a speed multiplier (the client
 * uses this purely for path-animation timing — server is authoritative on
 * positions via findPath), and an optional coinPerTrip cost charged when
 * switching INTO the vehicle (rental model, simplest).
 *
 * Pure data. Adding a vehicle = add one entry.
 */

export const VEHICLES = {
  walk: {
    id: "walk",
    name: "Walk",
    emoji: "🚶",
    speedMul: 1,
    coinPerTrip: 0,
    description: "Default. Free. Good for short hops and chat.",
    sittable: false,
  },
  cycle: {
    id: "cycle",
    name: "Cycle",
    emoji: "🚲",
    speedMul: 1.8,
    coinPerTrip: 2,
    description: "Cheap and quick. Good for Bengaluru lanes and Amsterdam-ish neighborhoods.",
    sittable: true,
  },
  auto: {
    id: "auto",
    name: "Autorickshaw",
    emoji: "🛺",
    speedMul: 2.3,
    coinPerTrip: 5,
    description: "The Indian classic. Fast but bumpy.",
    sittable: true,
  },
  bike: {
    id: "bike",
    name: "Motorbike",
    emoji: "🏍️",
    speedMul: 3.0,
    coinPerTrip: 10,
    description: "Weave through traffic. Bring a helmet.",
    sittable: true,
  },
  car: {
    id: "car",
    name: "Car",
    emoji: "🚗",
    speedMul: 4.0,
    coinPerTrip: 20,
    description: "Comfortable. For longer crossings.",
    sittable: true,
  },
  // Plane is intentionally NOT here — the WorldMap portal handles
  // inter-city travel (teleport). Keeping in-city travel wheeled only.
};

/** @returns {object|null} */
export const getVehicle = (id) => VEHICLES[id] || null;

/** @returns {string[]} */
export const listVehicleIds = () => Object.keys(VEHICLES);

/** @returns {Array} public projection */
export const allVehiclesPublic = () => Object.values(VEHICLES);

/** Default vehicle everyone starts with (and what rejection falls back to). */
export const DEFAULT_VEHICLE_ID = "walk";
