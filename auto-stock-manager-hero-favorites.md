# Hero "favourite" photo button for Auto-Stock-Manager

## Why

The public website (Hamro-GNG-Auto) has a full-width hero slideshow on the
homepage. Today it picks photos automatically (4:3, 1600x1200, well exposed).
Staff should be able to choose the hero photos themselves: a star ("favourite")
button on each vehicle photo, **maximum 5 photos across the whole site**.

The website side is already done. It reads `hero_photo_urls` from
`GET /api/public/settings`. When that list is non-empty the hero shows exactly
those photos, in order, each linking to its vehicle. When it is empty or
missing the website falls back to its automatic selection, so nothing breaks
until this ships.

## Contract the website expects

`GET /api/public/settings` gains one field:

```json
{ "hero_photo_urls": [
  "https://api.hamroauto.com.np/api/public/vehicles/<vehicle_id>/photos/<photo_id>",
  "..."
] }
```

- 0 to 5 entries, in display order (oldest favourite first is fine).
- Each URL must be byte-identical to an entry in that vehicle's `image_urls`
  from `GET /api/public/vehicles` (the website matches on the exact string).
- Photos of sold / unavailable vehicles are ignored by the website, but also
  drop them from the list server-side so they don't use up one of the 5 slots.

## Backend (`backend/server.py`)

1. Store a favourite flag per photo, e.g. `is_hero BOOLEAN DEFAULT false` and
   `hero_position INTEGER NULL` on the photos table (or a small `hero_photos`
   table keyed by photo id).
2. `PUT /vehicles/{vehicle_id}/photos/{photo_id}/hero` with `{ "hero": true|false }`
   (admin-authenticated like the other photo routes).
   - `hero: true` when 5 are already starred: respond `409` with
     `{ "detail": "Hero is full (5). Remove one first." }`. Do not silently drop another.
   - Otherwise set the flag and give it the next `hero_position`.
   - `hero: false` clears the flag and closes the gap in positions.
3. Deleting a photo or marking a vehicle sold/removing it clears its hero flag.
4. `GET /api/public/settings` adds `hero_photo_urls` (ordered by `hero_position`,
   only photos of currently available vehicles).
5. Include `is_hero` on each photo in the admin vehicle payload so the UI can
   show the state. Keep the public vehicles payload unchanged.
6. Public settings is cached by the website for 60s; if the website exposes
   `POST /api/revalidate` for the `storefront-data` tag, call it after a change
   so the hero updates immediately (same as other storefront edits).

## Frontend (`frontend/src/pages/VehicleDetail.jsx`, photo grid ~lines 661-721)

- Add a star icon button in the corner of every photo tile, next to the
  existing delete control. Filled star = in hero, outline = not.
- Click toggles via the new endpoint with an optimistic update; on `409`
  revert and show the message from `detail` (a toast is fine).
- Show a small counter somewhere in the admin vehicle list header or the photo
  section: "Hero photos: 3 / 5" (get the count from a settings/admin call).
- Disable the outline star (with tooltip "Hero is full (5)") when 5 are used,
  so staff see the limit before they hit it.
- Hint under the grid: "Star photos to feature them on the homepage slideshow.
  Use bright, well-framed 4:3 shots."
- Optional: a "Homepage hero" panel in admin settings listing the 5 starred
  photos with up/down reorder (writes `hero_position`).

## Acceptance

- Starring 5 photos then a 6th returns 409 and the UI explains why.
- Unstarring frees a slot immediately.
- With 3 starred photos the website hero shows exactly those 3, in order.
- With none starred the website hero behaves as it does today.
- Deleting a starred photo or marking its vehicle sold removes it from
  `hero_photo_urls`.
