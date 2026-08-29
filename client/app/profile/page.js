"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";

export default function ProfilePage() {
  const { user, ready, logout, refreshMe } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ready) return;
    if (!user) return router.push("/login");
    setName(user.name || "");
    setPhone(user.phone || "");
  }, [ready, user, router]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.updateMe({ name, phone });
      await refreshMe();
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready || !user) {
    return <p className="mx-auto max-w-2xl px-5 py-16 text-center text-sm text-ink/50">Loading...</p>;
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      {/* identity header */}
      <div className="flex items-center gap-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
        <Avatar name={user.name} email={user.email} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-head text-xl font-bold text-white">
              {user.name || "Add your name"}
            </h1>
            {user.isHost && (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                Host
              </span>
            )}
          </div>
          <p className="truncate text-sm text-white/60">{user.email}</p>
          {user.ratingCount > 0 && (
            <p className="mt-1 text-xs text-ink/50">
              ★ {user.rating?.toFixed(1)} · {user.ratingCount} review{user.ratingCount === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>

      {/* editable account details */}
      <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Account details</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold text-teal-600 hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-ink/70">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-teal-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink/70">
              Phone <span className="font-normal text-ink/40">(optional)</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-teal-400"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-ink/70">
              Email
              <input
                value={user.email}
                disabled
                className="rounded-xl border border-black/10 bg-black/5 px-4 py-2.5 text-sm text-ink/50"
              />
              <span className="text-xs font-normal text-ink/40">
                Email can't be changed here since it's used to log in.
              </span>
            </label>

            {error && <p className="text-xs text-coral-600">{error}</p>}

            <div className="mt-1 flex gap-2">
              <button
                disabled={saving}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setName(user.name || "");
                  setPhone(user.phone || "");
                }}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-ink/60 hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <Row label="Name" value={user.name || "Not set"} />
            <Row label="Phone" value={user.phone || "Not set"} />
            <Row label="Email" value={user.email} />
          </div>
        )}

        {saved && <p className="mt-3 text-xs text-teal-600">Saved.</p>}
      </div>

      {/* role-aware quick links */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/messages"
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <p className="text-sm font-semibold text-ink">Messages</p>
          <p className="mt-1 text-xs text-ink/50">Chats with hosts and customers</p>
        </Link>

        {user.isHost ? (
          <Link
            href="/host/dashboard"
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-ink">Host dashboard</p>
            <p className="mt-1 text-xs text-ink/50">Manage your listings</p>
          </Link>
        ) : (
          <Link
            href="/host/new"
            className="rounded-2xl bg-coral-50 p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-semibold text-coral-600">Become a host</p>
            <p className="mt-1 text-xs text-coral-600/70">List your first property</p>
          </Link>
        )}
      </div>

      {/* account actions */}
      <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
        <h2 className="mb-1 text-sm font-semibold text-white">Account</h2>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="w-fit text-sm text-ink/60 hover:text-ink"
        >
          Log out
        </button>
        <button
          onClick={() => alert("Contact support to delete your account (not yet automated).")}
          className="w-fit text-sm text-coral-600 hover:underline"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-2 last:border-0">
      <span className="text-ink/50">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}