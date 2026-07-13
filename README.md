# Hamro G&G Auto Enterprises

A premium second-hand bike and scooter resale platform in Kathmandu, Nepal.

## Features

- **Inventory Management**: Live inventory served by the Auto-Stock-Manager backend.
- **Service Booking**: Appointment scheduling for bike maintenance.
- **Price Evaluation**: Sell/Exchange modules with direct image upload support.
- **Premium UI**: Snappy transitions and responsive design.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Backend**: Auto-Stock-Manager (FastAPI + MongoDB) — serves inventory, site settings, and leads via its `/api/public/*` endpoints. Staff manage all of it (vehicles, site settings, leads) from that backend's own admin panel.
- **AI**: Google Genkit for automated vehicle descriptions and blog drafts.
- **Styling**: Tailwind CSS & ShadCN UI

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. (Optional) Set `NEXT_PUBLIC_INVENTORY_API_URL` if the backend isn't at its default URL.
4. Run the development server: `npm run dev`

## Deployment

Build with `npm run build` and run with `npm start` on any Node.js host (e.g. Hostinger's Node.js app hosting).
