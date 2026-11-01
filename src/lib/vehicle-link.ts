import { SITE_URL } from '@/lib/constants';

/** The vehicle's own page on the website. Put in a WhatsApp message, it turns into a link card with the bike's photo, name and price. */
export const vehiclePageUrl = (id: string) => `${SITE_URL}/inventory/${id}`;

/** A vehicle page's address is /inventory/<uuid>; returns that id when `pathname` is one. */
export function vehicleIdFromPath(pathname: string): string {
  return pathname.match(/^\/inventory\/([0-9a-f-]{36})\/?$/i)?.[1] ?? '';
}
