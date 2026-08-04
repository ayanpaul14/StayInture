# XID Frontend

Next.js (App Router) + Tailwind frontend for XID, built in the **bento grid
modern** aesthetic with the teal-and-coral palette, wired to talk to the
`xid-backend` API.

## Setup

```bash
cd xid-frontend
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL should point at your running xid-backend, e.g.
# http://localhost:5000/api
npm run dev
```

Make sure `xid-backend` is running first (`npm run dev` in that project) —
this frontend does nothing useful without it.

## Pages

| Route | What it does |
|---|---|
| `/` | Home — bento grid of nearby listings, category chips, radius slider. Uses the browser's geolocation (falls back to Kolkata if denied). |
| `/login` | Phone OTP login/signup. In dev, the OTP is logged to the **backend** console, not actually texted. |
| `/property/[id]` | Property detail — gallery placeholder, info, "Contact host" form that creates a conversation. |
| `/host/new` | List a property — category-aware form (Flat/Bungalow/PG). Submitting this is what turns an account into a host account. |
| `/host/dashboard` | Host's "my listings" — stats + listing rows. |
| `/messages` | Conversation list + active thread, works for both customer and host sides of a chat, includes the "Book a visit" / confirm / decline flow. |

## Key building blocks

- **`context/AuthContext.jsx`** — holds the logged-in user + JWT in `localStorage`, exposes `login`, `logout`, `switchRole`.
- **`lib/api.js`** — one place all backend calls go through; add new endpoints here as you extend the backend.
- **`components/BentoGrid.jsx`** — the asymmetric grid layout (one large tile per every 5 listings, `grid-flow` fills in the rest). Adjust the `spanFor()` pattern to change the rhythm.
- **`components/PropertyCard.jsx`** — the reusable listing card; has a staggered fade/rise-in animation (`animate-riseIn` + per-card `animationDelay`) for the "attractive, animated" feel.

## Known placeholders to fill in before shipping

- **Photos** — cards currently render solid color blocks instead of real images (backend photo-upload route isn't wired up yet either — see `xid-backend` README).
- **Lat/lng entry** — the listing form asks for raw latitude/longitude. Replace with Google Places Autocomplete so hosts just type an address.
- **Map view** — the home page is list-only right now; a real map (Google Maps / Mapbox) showing pins would complete the "nearest location" experience described in the design deck.
