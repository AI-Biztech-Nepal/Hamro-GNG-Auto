import { GOOGLE_PLACE_ID } from '@/lib/constants';

export type GoogleReview = {
  author: string;
  photo?: string;
  rating: number;
  text: string;
  when: string;
  url?: string;
};
export type GoogleReviews = { rating: number; total: number; reviews: GoogleReview[] };

/**
 * Live reviews from the Places API (New). Needs GOOGLE_PLACES_API_KEY (server-only, restricted to the Places API).
 * Returns null on any failure or missing key so the About page simply omits the section.
 * shortcut: Google returns at most 5 reviews; link out to the full profile for the rest.
 */
export async function fetchGoogleReviews(): Promise<GoogleReviews | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${GOOGLE_PLACE_ID}`, {
      headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'rating,userRatingCount,reviews' },
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const reviews: GoogleReview[] = (d.reviews ?? [])
      .filter((r: any) => r.rating >= 4 && r.text?.text)
      .map((r: any) => ({
        author: r.authorAttribution?.displayName ?? 'Google user',
        photo: r.authorAttribution?.photoUri,
        rating: r.rating,
        text: r.text.text,
        when: r.relativePublishTimeDescription ?? '',
        url: r.googleMapsUri,
      }));
    return d.rating ? { rating: d.rating, total: d.userRatingCount ?? reviews.length, reviews } : null;
  } catch {
    return null;
  }
}
