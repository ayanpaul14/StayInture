# XID Backend

Node.js + Express + MongoDB backend for XID — matches the tech stack and
screens from the design showcase. Single account model: any user can browse
as a customer, and becomes a host automatically the first time they list a
property.

## Setup

```bash
cd xid-backend
npm install
cp .env.example .env
# fill in MONGO_URI and JWT_SECRET at minimum
npm run dev
```

Requires a MongoDB Atlas cluster (or local MongoDB) — see `.env.example`.

## Folder structure

```
xid-backend/
  server.js                    # app entry point
  src/
    config/db.js                # MongoDB connection
    models/
      User.js                   # phone, isHost flag, activeRole (customer/host)
      Property.js                # listing, GeoJSON location, category-specific fields
      Conversation.js            # chat + visit/booking status between customer & host
    middleware/
      auth.js                    # protect (JWT check), requireHost
      errorHandler.js
    controllers/
      authController.js          # OTP send/verify, role switch
      propertyController.js      # listing CRUD
      searchController.js        # category + radius geo search
      conversationController.js  # chat + visit requests
    routes/
      authRoutes.js
      propertyRoutes.js
      searchRoutes.js
      conversationRoutes.js
    utils/
      generateToken.js
      otpStore.js                # dev-only in-memory OTP — swap for Redis + real SMS gateway
```

## API reference

### Auth
| Method | Route | Body | Notes |
|---|---|---|---|
| POST | `/api/auth/send-otp` | `{ phone }` | Logs OTP to console in dev — plug in MSG91/Twilio for real SMS |
| POST | `/api/auth/verify-otp` | `{ phone, code, name? }` | Creates user on first login, returns JWT |
| GET | `/api/auth/me` | — (auth) | Current logged-in user |
| PATCH | `/api/auth/switch-role` | `{ role }` (auth) | Toggle customer ⇄ host (host requires at least one listing) |

### Properties
| Method | Route | Notes |
|---|---|---|
| POST | `/api/properties` | (auth) Create a listing — first one flips `isHost` to true |
| GET | `/api/properties/:id` | Public — property detail page |
| PATCH | `/api/properties/:id` | (auth, owner only) Edit a listing |
| DELETE | `/api/properties/:id` | (auth, owner only) Delete a listing |
| GET | `/api/properties/mine` | (auth) Host dashboard "my listings" |

### Search
| Method | Route | Query params |
|---|---|---|
| GET | `/api/search` | `lat`, `lng` (required), `radiusKm` (default 2), `category`, `minRent`, `maxRent` |

Example: `/api/search?lat=22.58&lng=88.43&radiusKm=2&category=pg`

### Conversations (chat & booking)
| Method | Route | Notes |
|---|---|---|
| POST | `/api/conversations` | (auth) `{ propertyId, message }` — starts or continues a chat |
| GET | `/api/conversations` | (auth) All conversations for the logged-in user (as customer or host) |
| POST | `/api/conversations/:id/messages` | (auth) `{ message }` — send a message |
| PATCH | `/api/conversations/:id/visit` | (auth) `{ status, visitDate? }` — request/confirm/decline a visit |

## What's stubbed vs. production-ready

- **OTP delivery** — currently just logs to the console (`src/utils/otpStore.js`). Swap in MSG91/Twilio and Redis before going live.
- **Photo upload** — models expect Cloudinary URLs in `photos`, but the upload endpoint itself isn't wired up yet. Add a Multer + Cloudinary route when you're ready (mentioned in the tech stack doc).
- **Payments** — no Razorpay integration yet; add this once in-app booking payments are needed.

## Next to build

1. Wire the frontend's auth screens to `/api/auth/*`
2. Wire the search/home screen to `/api/search`
3. Add a photo-upload route (Multer -> Cloudinary -> save URL to `Property.photos`)
4. Add host verification (ID upload + manual review) before opening to real users
