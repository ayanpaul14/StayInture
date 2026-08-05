# StayInture

**Find a place to call home. Or list yours.**

StayInture is a property rental and listing platform focused on **Flats/Apartments, Bungalows, and PGs**, built around a single core idea: one account, two roles. Every user can browse as a customer and switch into host mode to list a property, without a separate signup.

🔗 **Live app:** [stay-inture.vercel.app](https://stay-inture.vercel.app)

---

## Overview

StayInture solves a simple problem — finding a nearby place to live shouldn't require juggling five different apps for flats, PGs, and bungalows separately, and listing a property shouldn't require a different account than the one you browse with.

- **Search by location, not just city** — a 1–3km radius search around the user, backed by MongoDB geospatial queries and a live Google Maps view
- **One account, two roles** — any customer can become a host the moment they list their first property; no separate host signup
- **In-app chat and visit booking** — customers message hosts directly and request a visit; hosts confirm or decline, all tracked per conversation
- **Email-based OTP authentication** — no passwords to manage, sign in with a one-time code sent to your inbox

## Features

| Area | What it does |
|---|---|
| **Explore / Search** | Category filters (Flat, Bungalow, PG), radius slider, free-text search by city/title, List and Map view toggle |
| **Property listings** | Category-aware listing form — PG shows room-sharing/food options, Bungalow shows floor count, Flat stays simple |
| **Host dashboard** | Active listings, inquiry counts, per-listing activity, quick "new listing" access |
| **Messaging** | WhatsApp-style chat UI, per-property conversation threads, visit request → confirm/decline flow |
| **Profile** | Editable name/phone, avatar (auto-generated from initials), role-aware quick links |
| **Auth** | Email OTP sign up/log in (Nodemailer + Gmail SMTP), JWT-based sessions |
| **Landing page** | Animated hero with a 3D rotating property card ring (Three.js / React Three Fiber), scroll-driven "How it works" section |
| **Responsive design** | Fully adapted layouts for mobile, including a dedicated mobile chat view and collapsible navigation |

## Tech Stack

**Frontend** (`/client`)
- [Next.js 14](https://nextjs.org/) (App Router) + React
- [Tailwind CSS](https://tailwindcss.com/) — custom teal & gold design system
- [Framer Motion](https://www.framer.com/motion/) — scroll-linked and gesture animations
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) + Three.js — the 3D card ring on the landing page
- [@react-google-maps/api](https://www.npmjs.com/package/@react-google-maps/api) — map view and radius visualization

**Backend** (`/server`)
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) — including `2dsphere` geospatial indexing for radius search
- [JWT](https://jwt.io/) — auth tokens
- [Nodemailer](https://nodemailer.com/) — email OTP delivery via Gmail SMTP
- `express-async-errors` — centralized async error handling

**Deployment**
- Frontend deployed on [Vercel](https://vercel.com/)
- Backend deployed as a Node web service (Render or equivalent)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)

## Project Structure

```
StayInture/
├── client/                      # Next.js frontend
│   ├── app/
│   │   ├── page.js               # Animated landing page
│   │   ├── explore/               # Search, filters, list/map view
│   │   ├── login/, signup/        # Email OTP auth
│   │   ├── profile/               # Account settings
│   │   ├── property/[id]/         # Property detail + contact host
│   │   ├── host/new/              # List a property
│   │   ├── host/dashboard/        # Host's listings + stats
│   │   └── messages/              # Chat + visit booking
│   ├── components/                # Navbar, Footer, cards, map, chips, etc.
│   ├── components/landing/        # Hero, 3D ring, scroll sections
│   ├── context/AuthContext.jsx    # App-wide auth state
│   └── lib/api.js                 # Single source of truth for backend calls
│
└── server/                      # Express + MongoDB backend
    ├── src/
    │   ├── models/                # User, Property, Conversation
    │   ├── controllers/           # auth, property, search, conversation logic
    │   ├── routes/                 # REST endpoint definitions
    │   ├── middleware/             # JWT auth, error handling
    │   └── utils/                  # OTP store, email sender, token signing
    └── server.js                   # App entry point
```

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) (for OTP emails)
- A Google Maps API key with Maps JavaScript API enabled (for the map view)

### 1. Clone and install

```bash
git clone https://github.com/ayanpaul14/StayInture.git
cd StayInture
```

### 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `server/.env`:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string |
| `SMTP_HOST`, `SMTP_PORT` | Gmail SMTP settings (defaults provided) |
| `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` | Gmail address + App Password for sending OTP emails |

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd client
npm install
cp .env.local.example .env.local
```

Fill in `client/.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:5000/api` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps JavaScript API key |

```bash
npm run dev
```

Visit `http://localhost:3000`.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/send-otp` | Send a login/signup OTP to an email |
| `POST` | `/api/auth/verify-otp` | Verify OTP, creates account on first login |
| `GET` / `PATCH` | `/api/auth/me` | Get or update the logged-in user's profile |
| `PATCH` | `/api/auth/switch-role` | Toggle between customer and host mode |
| `POST` / `GET` | `/api/properties` | Create a listing / fetch by ID |
| `PATCH` / `DELETE` | `/api/properties/:id` | Update or remove a listing (owner only) |
| `GET` | `/api/properties/mine` | Host's own listings |
| `GET` | `/api/search` | Radius + category + text search |
| `POST` / `GET` | `/api/conversations` | Start/continue a chat, list all conversations |
| `POST` | `/api/conversations/:id/messages` | Send a message |
| `PATCH` | `/api/conversations/:id/visit` | Request, confirm, or decline a property visit |

## Roadmap

- [ ] Secure booking system with payment integration (Razorpay)
- [ ] Property photo upload (Cloudinary)
- [ ] Host and listing verification
- [ ] Push/email notifications for new messages and bookings
- [ ] Ratings and reviews

## License

This project is currently private and unlicensed for public use.

## Author

Built by the StayInture Team.