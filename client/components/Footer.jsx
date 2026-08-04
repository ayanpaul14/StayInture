import Link from "next/link";

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
          <div className="flex gap-4">
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