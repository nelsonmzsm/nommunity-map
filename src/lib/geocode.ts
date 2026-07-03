import "server-only";

export function isGeocodingConfigured(): boolean {
  return Boolean(process.env.GOOGLE_GEOCODING_API_KEY);
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.GOOGLE_GEOCODING_API_KEY;
  if (!key) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=jp&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.[0]?.geometry?.location) {
    console.warn("Geocoding failed:", address, data.status, data.error_message);
    return null;
  }

  const { lat, lng } = data.results[0].geometry.location;
  return { lat, lng };
}
