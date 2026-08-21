const BAKERY_LAT = Number(process.env.NEXT_PUBLIC_BAKERY_LAT) || -16.4230021665101;
const BAKERY_LNG = Number(process.env.NEXT_PUBLIC_BAKERY_LNG) || -71.51603377642644;

const PRICE_PER_KM = 3.5;
const MIN_FEE = 6;

export function getBakeryLocation(): { lat: number; lng: number } {
  return { lat: BAKERY_LAT, lng: BAKERY_LNG };
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function calculateDeliveryFee(distanceKm: number): number {
  return Math.max(
    Math.round(distanceKm * PRICE_PER_KM * 100) / 100,
    MIN_FEE
  );
}

export function getDistanceAndFee(
  destLat: number,
  destLng: number
): { distance: number; fee: number } {
  const bakery = getBakeryLocation();
  const distance = haversineDistance(
    bakery.lat,
    bakery.lng,
    destLat,
    destLng
  );
  const fee = calculateDeliveryFee(distance);
  return { distance, fee };
}
