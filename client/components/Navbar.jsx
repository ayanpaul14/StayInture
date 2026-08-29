"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";

export default function Navbar() {
  const { user, ready, logout, switchRole } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleToggleRole() {
    setMenuOpen(false);
    if (!user) return router.push("/login");
    const nextRole = user.activeRole === "host" ? "customer" : "host";
    try {
      await switchRole(nextRole);
      if (nextRole === "host") router.push("/host/dashboard");
      else router.push("/explore");
    } catch (err) {
      router.push("/host/new");
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <span className="h-7 w-7 rounded-lg bg-teal-600" />
          <span className="font-head text-lg font-bold">StayInture</span>
        </Link>

        <nav className="hidden gap-5 text-sm text-ink/70 md:flex">
          <Link href="/explore" className="hover:text-teal-600">
            Explore
          </Link>
          {user && (
            <Link href="/trips" className="hover:text-teal-600">
              My Trips
            </Link>
          )}
          {user && (
            <Link href="/messages" className="hover:text-teal-600">
              Messages
            </Link>
          )}
          {user?.isHost && (
            <Link href="/host/reservations" className="hover:text-teal-600">
              Reservations
            </Link>
          )}
          {user?.isHost && (
            <Link href="/host/dashboard" className="hover:text-teal-600">
              Host dashboard
            </Link>
          )}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {ready && user ? (
            <>
              <button
                onClick={handleToggleRole}
                className="rounded-full bg-coral-50 px-3 py-1.5 text-xs font-semibold text-coral-600 transition hover:bg-coral-100"
              >
                {user.activeRole === "host" ? "Switch to customer" : "Switch to host"}
              </button>
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="text-xs text-ink/60 hover:text-ink"
              >
                Log out
              </button>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                <Avatar name={user.name} email={user.email} size={32} />
              </Link>
            </>
          ) : (
            ready && (
              <>
                <Link
                  href="/signup"
                  className="text-xs font-semibold text-ink/70 hover:text-teal-600"
                >
                  Sign up
                </Link>
                <Link
                  href="/login"
                  className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                >
                  Log in
                </Link>
              </>
            )
          )}
        </div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5 md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-black/5 bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            <Link href="/explore" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
              Explore
            </Link>
            {user && (
              <Link href="/trips" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
                My Trips
              </Link>
            )}
            {user && (
              <Link href="/profile" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            )}
            {user && (
              <Link href="/messages" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
                Messages
              </Link>
            )}
            {user?.isHost && (
              <Link href="/host/reservations" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
                Reservations
              </Link>
            )}
            {user?.isHost && (
              <Link href="/host/dashboard" className="py-1 text-ink/80" onClick={() => setMenuOpen(false)}>
                Host dashboard
              </Link>
            )}
          </nav>

          <div className="mt-4 flex flex-col gap-2 border-t border-black/5 pt-4">
            {ready && user ? (
              <>
                <button
                  onClick={handleToggleRole}
                  className="rounded-full bg-coral-50 px-4 py-2 text-xs font-semibold text-coral-600"
                >
                  {user.activeRole === "host" ? "Switch to customer" : "Switch to host"}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    router.push("/");
                  }}
                  className="text-left text-xs text-ink/60"
                >
                  Log out
                </button>
              </>
            ) : (
              ready && (
                <>
                  <Link
                    href="/signup"
                    className="rounded-full border border-black/10 px-4 py-2 text-center text-xs font-semibold text-ink/80"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full bg-teal-600 px-4 py-2 text-center text-xs font-semibold text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}