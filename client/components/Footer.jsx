import Link from "next/link";

const instagramUrl = "https://www.instagram.com/stayinture.in/";
const linkedinUrl = "#"; // 🔁 add your LinkedIn link here
const facebookUrl = "#"; // 🔁 add your Facebook link here
const xUrl = "#"; // 🔁 add your X (Twitter) link here

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Flats & Apartments", href: "/explore" },
      { label: "Bungalows", href: "/explore" },
      { label: "PG", href: "/explore" },
    ],
  },
  {
    title: "Host",
    links: [
      { label: "List your property", href: "/host/new" },
      { label: "Host dashboard", href: "/host/dashboard" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Messages", href: "/messages" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-teal-900 text-teal-100">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-lg bg-teal-400" />
              <span className="font-head text-lg font-bold text-white">
                StayInture
              </span>
            </Link>
            <p className="mt-3 max-w-[220px] text-xs text-teal-200">
              Find a Flat, Bungalow or PG near you — or list your own in
              minutes.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">
                {col.title}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-teal-100 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-teal-300 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} StayInture. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StayInture on Instagram"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
              </svg>
            </Link>

            <Link
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StayInture on LinkedIn"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </Link>

            <Link
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StayInture on Facebook"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </Link>

            <Link
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="StayInture on X"
              className="hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>

            <Link href="#" className="hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}