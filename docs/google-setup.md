# Google setup: Sign-in and Reviews

Both features are already coded. They stay switched off until you add the keys below.

| Feature | Env vars | Without them |
|---|---|---|
| Google sign-in (`/account`, navbar photo) | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `AUTH_SECRET` | `/account` says "Google sign-in is not configured yet"; `/api/auth/google` returns 503 |
| Google reviews (About page) | `GOOGLE_PLACES_API_KEY` | The reviews section is simply not rendered |

Put them in `.env.local` for local work, and in the host's environment variables for production. Restart the server after changing them (`NEXT_PUBLIC_*` values are baked in at build time, so production needs a rebuild).

---

## 1. Google sign-in

### Google Cloud Console
1. Go to https://console.cloud.google.com and pick (or create) a project.
2. **APIs & Services > OAuth consent screen**: choose External, fill in app name ("Hamro G&G Auto"), support email and developer email. Scopes: the defaults (`email`, `profile`, `openid`) are enough. While the app is in "Testing" only listed test users can sign in; click **Publish app** when ready.
3. **APIs & Services > Credentials > Create credentials > OAuth client ID**:
   - Application type: **Web application**
   - Authorised JavaScript origins:
     - `http://localhost:9002`
     - `https://hamroauto.com.np` (and `https://www.hamroauto.com.np` if used)
   - No redirect URIs needed (this uses Google Identity Services, not a redirect flow).
4. Copy the **Client ID** (ends in `.apps.googleusercontent.com`).

### Env vars
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
AUTH_SECRET=<long random string>
```
Generate the secret with `openssl rand -base64 32` (or `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`). Keep it private. Changing it signs everyone out.

### How it works
- `/account` loads Google's button script. On sign-in, Google gives the browser an ID token.
- `POST /api/auth/google` ([route](../src/app/api/auth/google/route.ts)) checks the token with Google (`oauth2.googleapis.com/tokeninfo`), requires `aud` to equal your client ID and a verified email, then sets the `gg_session` cookie (httpOnly, SameSite=Lax, Secure in production, 30 days). The cookie is an HMAC-signed payload; logic in [src/lib/session.ts](../src/lib/session.ts).
- `GET /api/auth/me` returns the current user or `null`. `POST /api/auth/logout` clears the cookie.
- The navbar calls `/api/auth/me` and swaps the red person icon for the Google profile photo. `/account` fires a `gg-auth` window event after sign-in/out so it updates without a reload.

### Test it
1. Set the two env vars, restart `npm run dev`, open http://localhost:9002/account.
2. Click the Google button, sign in. You should see your photo and email, and the navbar icon becomes your photo.
3. Sign out, and the icon goes back to the red person.
4. Common failures: "origin not allowed" means the origin is missing in the Cloud Console (the port matters); sign-in "failed" toast means `AUTH_SECRET` is missing or the client ID does not match between build and server.

### Known limits
- Signing in does not yet pre-fill or save anything on the Sell / Exchange / Book Service forms; there is no user database.
- No token-replay check beyond Google's own verification.
- Rate limiting is in-memory (single server process only).

---

## 2. Google reviews on the About page

### Google Cloud Console
1. Same project: **APIs & Services > Library**, enable **Places API (New)**.
2. **Credentials > Create credentials > API key**. Then edit the key:
   - API restrictions: **Places API (New)** only.
   - Application restrictions: leave as "None" or restrict by server IP. Do not use an HTTP-referrer restriction, because the call is server-side and sends no referrer.
3. Billing must be enabled on the project. Place Details with the review fields is a paid SKU, but the page caches for 24h so usage is roughly one request per day per server instance.

### Env var
```
GOOGLE_PLACES_API_KEY=AIza...
```
Server-only. Never prefix it with `NEXT_PUBLIC_`.

### How it works
- [src/lib/google-reviews.ts](../src/lib/google-reviews.ts) calls `GET https://places.googleapis.com/v1/places/{GOOGLE_PLACE_ID}` with field mask `rating,userRatingCount,reviews`. The place ID is in [src/lib/constants.ts](../src/lib/constants.ts).
- Results are cached 24h (`revalidate: 86400`). Reviews under 4 stars or with no text are dropped.
- [src/app/about/page.tsx](../src/app/about/page.tsx) passes the data to `AboutClient`, which renders the dark floating-card section at the bottom. If the key is missing, the request fails, or there are no qualifying reviews, the section is omitted. No placeholder reviews are ever shown.

### Test it
1. Set the key, restart, open http://localhost:9002/about and scroll to the bottom.
2. Expect the rating line, one large lead review and up to two smaller ones.
3. If nothing shows, check the server console and run:
   ```
   curl -H "X-Goog-Api-Key: $GOOGLE_PLACES_API_KEY" -H "X-Goog-FieldMask: rating,userRatingCount,reviews" "https://places.googleapis.com/v1/places/ChIJcRmLdk4b6zkRI2pToermlUw"
   ```
   A 403 means the API is not enabled, billing is off, or the key restriction is wrong.

### Known limits
- Google returns at most 5 reviews per request, so the page shows at most 3 of your 4-5 star ones. "Read all reviews on Google" links to the full list.
- Google's terms require showing author attribution; the section does (name, photo, link out).
