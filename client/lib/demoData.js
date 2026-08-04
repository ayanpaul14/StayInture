// Hardcoded fallback listings so the Explore page never looks empty or
// broken — shown whenever the real API returns zero results or errors out.
// These are NOT real database records and have no working property-detail
// page behind them (hence PropertyCard renders them as non-clickable when
// `demo` is true).

export const DEMO_PROPERTIES = [
  {
    _id: "demo-1",
    category: "flat",
    title: "Sunlit 2BHK near Salt Lake Sector V",
    city: "Kolkata",
    rentPerMonth: 18000,
  },
  {
    _id: "demo-2",
    category: "flat",
    title: "Cozy 1BHK, Newtown",
    city: "Kolkata",
    rentPerMonth: 12500,
  },
  {
    _id: "demo-3",
    category: "bungalow",
    title: "Garden Bungalow, Behala",
    city: "Kolkata",
    rentPerMonth: 32000,
  },
  {
    _id: "demo-4",
    category: "bungalow",
    title: "Heritage Bungalow, Ballygunge",
    city: "Kolkata",
    rentPerMonth: 45000,
  },
  {
    _id: "demo-5",
    category: "pg",
    title: "Co-ed PG, Sector V",
    city: "Kolkata",
    rentPerMonth: 8500,
  },
  {
    _id: "demo-6",
    category: "pg",
    title: "Girls PG, Salt Lake",
    city: "Kolkata",
    rentPerMonth: 9500,
  },
];