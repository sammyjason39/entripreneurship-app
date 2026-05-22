/** BINUS @ Dago — EnTripreneurship Journey map (Leaflet image overlay). */

export const EVENT_CENTER = {
  lat: -6.8703202,
  lng: 107.6335508,
} as const;

/** Geographic bounds aligned to the journey map image. Tune LAT/LNG span if pins drift. */
const LAT_HALF = 0.0055;
const LNG_HALF = 0.0055;

export const EVENT_MAP_BOUNDS: [[number, number], [number, number]] = [
  [EVENT_CENTER.lat - LAT_HALF, EVENT_CENTER.lng - LNG_HALF],
  [EVENT_CENTER.lat + LAT_HALF, EVENT_CENTER.lng + LNG_HALF],
];

export const EVENT_MAP_IMAGE_URL = '/map/entrip-journey.jpeg';

/** Convert station map_x / map_y (0–100%, image space) to WGS84. */
export function stationPercentToLatLng(mapX: number, mapY: number): [number, number] {
  const [[south, west], [north, east]] = EVENT_MAP_BOUNDS;
  const lat = north - (mapY / 100) * (north - south);
  const lng = west + (mapX / 100) * (east - west);
  return [lat, lng];
}

export function isInsideEventBounds(lat: number, lng: number): boolean {
  const [[south, west], [north, east]] = EVENT_MAP_BOUNDS;
  return lat >= south && lat <= north && lng >= west && lng <= east;
}
