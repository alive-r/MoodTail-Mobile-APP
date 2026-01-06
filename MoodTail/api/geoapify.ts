export type GeoAddress = {
  formatted?: string;
  street?: string;
  houseNumber?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countryCode?: string;
  placeId?: string;
};

const API_BASE = 'https://api.geoapify.com/v1/geocode/reverse';

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<GeoAddress | null> {
  const apiKey = 'YOUR API';
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    apiKey,
    format: 'json',
  });

  const url = `${API_BASE}?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn('[geoapify] HTTP', res.status);
      return null;
    }
    const data = await res.json() as {
      results?: {
        formatted?: string;
        street?: string;
        housenumber?: string;
        suburb?: string;
        city?: string;
        county?: string;
        state?: string;
        postcode?: string;
        country?: string;
        country_code?: string;
        place_id?: string;
      }[]
    };

    const first = data?.results?.[0];
    if (!first) return null;

    return {
      formatted: first.formatted,
      street: first.street,
      houseNumber: first.housenumber,
      suburb: first.suburb,
      city: first.city,
      county: first.county,
      state: first.state,
      postcode: first.postcode,
      country: first.country,
      countryCode: first.country_code,
      placeId: first.place_id,
    };
  } catch (e) {
    console.error('[geoapify] reverseGeocode failed', e);
    return null;
  }
}