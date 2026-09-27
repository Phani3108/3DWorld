/** Visual character per city for the procedural stand-in (until real map data is compiled). */
export type CityStyle = {
  ground: string;
  road: string;
  sidewalk: string;
  facades: string[];
  roofs: string[];
  floors: [number, number];
  /** Share of lots that become towers (floors × 4–10). */
  towers: number;
  floorHeight: number;
};

const OLD_CITY: CityStyle = {
  ground: "#9c8b72",
  road: "#3b3a38",
  sidewalk: "#a39a8b",
  facades: ["#e8dcc4", "#d9c7a5", "#cdb893", "#efe7d6", "#c9a77c", "#b9c4b2", "#d6b8a8", "#e4d3a8"],
  roofs: ["#8a7f70", "#a0968a", "#6f6a62"],
  floors: [2, 5],
  towers: 0.02,
  floorHeight: 3.2,
};

export const CITY_STYLE: Record<string, CityStyle> = {
  hyderabad: OLD_CITY,
  bengaluru: {
    ...OLD_CITY,
    ground: "#7f8a66",
    facades: ["#e7e2d8", "#d8d2c4", "#c9b79c", "#b7c2c9", "#e0cfa9"],
    floors: [3, 7],
    towers: 0.06,
  },
  mumbai: {
    ...OLD_CITY,
    ground: "#8b867a",
    facades: ["#efe9dc", "#e3d7bf", "#d9c3a0", "#c9d2d6", "#e8d6c0"],
    floors: [4, 8],
    towers: 0.08,
  },
  dubai: {
    ground: "#c9b48f",
    road: "#3a3a3d",
    sidewalk: "#cfc3ad",
    facades: ["#e9dfcb", "#dccbab", "#c9b58f", "#b3c1c8", "#d5d8da"],
    roofs: ["#b8ab93", "#9d937f"],
    floors: [3, 8],
    towers: 0.12,
    floorHeight: 3.4,
  },
  newyork: {
    ground: "#77736c",
    road: "#2f3032",
    sidewalk: "#9c9993",
    facades: ["#8a6f5a", "#a8a39a", "#6d6a66", "#b8b2a6", "#5f6b73", "#9a8c7d"],
    roofs: ["#555250", "#6b6763"],
    floors: [6, 20],
    towers: 0.3,
    floorHeight: 3.6,
  },
  singapore: {
    ground: "#7e8b6f",
    road: "#333436",
    sidewalk: "#b3b0a8",
    facades: ["#dfe3e2", "#c8d4d8", "#e7dccb", "#b9c9c2", "#f0ebe1"],
    roofs: ["#8f9493", "#a3a5a2"],
    floors: [5, 16],
    towers: 0.3,
    floorHeight: 3.6,
  },
  sydney: {
    ground: "#8c8a78",
    road: "#333335",
    sidewalk: "#b9b2a2",
    facades: ["#d8c3a0", "#c9ad85", "#e6dccb", "#a9b3b8", "#bfa88e"],
    roofs: ["#7d766b", "#8f877a"],
    floors: [3, 10],
    towers: 0.15,
    floorHeight: 3.4,
  },
};

export const styleFor = (cityId: string) => CITY_STYLE[cityId] ?? OLD_CITY;
