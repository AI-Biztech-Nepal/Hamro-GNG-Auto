# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Local buyers around Kathmandu (Boudha / Nayabasti and nearby), mostly on phones over mid-range connections, shopping for a used bike or scooter. Many are first-time or budget buyers who need to trust the showroom and the bike's condition before visiting. Secondary: people wanting to sell, exchange, or service a two-wheeler.

## Product Purpose
G&G Auto is a used two-wheeler showroom. The site lets visitors browse available stock, open a vehicle's detail page, and contact the showroom (call / WhatsApp). Success is a visitor opening a specific bike and then enquiring or visiting.

## Positioning
Every bike passes a 40-point inspection, carries genuine paperwork, and is fixed-price (no haggling). Physical showroom in Nayabasti, Boudha.

## Capabilities and Constraints
- Stack: existing Next.js (App Router) + Tailwind + shadcn/ui; inventory from a backend via `src/lib/inventory-api.ts`.
- Vehicle record has `status` (available/sold), `has_photos`, `featured?`, `image_urls`, brand, model, year, cc, price.
- Vehicles without photos are kept off the homepage.
- Contact: click-to-call and WhatsApp (`src/lib/constants.ts`).
- Sibling flows: sell, exchange, book service.

## Brand Commitments
Name "G&G Auto" / "Hamro G&G Auto". Existing logo at `public/logo.png`. Current site uses ink-black, white, and a red accent (`--brand`), with Poppins headings and Montserrat body.

## Evidence on Hand
Real vehicle photos and records from the live inventory. No testimonials or review data on hand; none to be fabricated.

## Product Principles
- Real bikes, real photos, fixed prices: the stock is the proof.
- Mobile-first for local buyers; fast on mid-range connections.
- Every path leads to a specific vehicle or a direct contact.
