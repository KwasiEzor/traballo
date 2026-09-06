/**
 * Forward geocoding via Stadia Maps (Pelias). Turns a free-text address into
 * coordinates so the public site can show a map. Called on profile save.
 *
 * Best-effort: any failure returns null and the caller keeps whatever
 * coordinates it already had (or none).
 */

export type LatLng = { lat: number; lng: number };

const ENDPOINT = "https://api.stadiamaps.com/geocoding/v1/search";

export async function geocodeAddress(
  address: string | null | undefined
): Promise<LatLng | null> {
  const text = address?.trim();
  if (!text) return null;

  const key = process.env.STADIA_MAPS_API_KEY;
  if (!key) return null; // server-to-server needs a key (no domain auth)

  try {
    const url = new URL(ENDPOINT);
    url.searchParams.set("text", text);
    url.searchParams.set("size", "1");
    url.searchParams.set("api_key", key);
    // Bias toward the countries Traballo serves.
    url.searchParams.set("boundary.country", "FR,BE,LU");

    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      features?: { geometry?: { coordinates?: [number, number] } }[];
    };
    const coords = data.features?.[0]?.geometry?.coordinates;
    if (!coords || coords.length !== 2) return null;

    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}
