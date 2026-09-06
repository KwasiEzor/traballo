import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { geocodeAddress } from "@/lib/geo/geocode";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("STADIA_MAPS_API_KEY", "test-key");
  fetchMock.mockReset();
});
afterEach(() => vi.unstubAllEnvs());

function ok(coordinates: [number, number] | null) {
  return {
    ok: true,
    json: async () => ({
      features: coordinates ? [{ geometry: { coordinates } }] : [],
    }),
  };
}

describe("geocodeAddress", () => {
  it("returns {lat,lng} from the first feature (GeoJSON is [lng,lat])", async () => {
    fetchMock.mockResolvedValue(ok([2.3522, 48.8566]));
    const res = await geocodeAddress("10 rue de Rivoli, Paris");
    expect(res).toEqual({ lat: 48.8566, lng: 2.3522 });
  });

  it("sends the API key and a FR/BE/LU country bias", async () => {
    fetchMock.mockResolvedValue(ok([4.35, 50.85]));
    await geocodeAddress("Grand-Place, Bruxelles");
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get("api_key")).toBe("test-key");
    expect(url.searchParams.get("boundary.country")).toBe("FR,BE,LU");
    expect(url.searchParams.get("text")).toBe("Grand-Place, Bruxelles");
  });

  it("returns null for an empty address without calling the API", async () => {
    expect(await geocodeAddress("  ")).toBeNull();
    expect(await geocodeAddress(null)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null when the key is missing", async () => {
    vi.stubEnv("STADIA_MAPS_API_KEY", "");
    expect(await geocodeAddress("somewhere")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null on a non-ok response", async () => {
    fetchMock.mockResolvedValue({ ok: false, json: async () => ({}) });
    expect(await geocodeAddress("x")).toBeNull();
  });

  it("returns null when there are no results", async () => {
    fetchMock.mockResolvedValue(ok(null));
    expect(await geocodeAddress("nowhere at all")).toBeNull();
  });

  it("returns null on out-of-range coordinates", async () => {
    fetchMock.mockResolvedValue(ok([999, 999]));
    expect(await geocodeAddress("x")).toBeNull();
  });

  it("returns null when fetch throws (timeout / network)", async () => {
    fetchMock.mockRejectedValue(new Error("timeout"));
    expect(await geocodeAddress("x")).toBeNull();
  });
});
