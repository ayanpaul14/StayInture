"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSendOtp(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.sendOtp(email);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyOtp(email, code);
      login(res.token, res.user);
      router.push("/explore");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-5 py-12">
      <div className="mb-6 flex justify-center">
        <span className="h-14 w-14 rounded-2xl bg-teal-500 shadow-[0_0_32px_rgba(20,184,166,0.6)]" />
      </div>
      <h1 className="text-center font-head text-2xl font-bold text-white">Welcome back</h1>
      <p className="mb-6 text-center text-sm text-white/60">
        Log in with your email
      </p>

      <div className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 p-6 shadow-2xl">
        {step === "email" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-white/70">Email address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-teal-400 focus:bg-white/15 backdrop-blur"
            />
            <button
              disabled={loading}
              className="mt-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <p className="text-xs text-white/50">
              OTP sent to {email} — check your inbox (and spam folder)
            </p>
            <label className="text-sm font-medium text-white/70">Enter OTP</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/40 tracking-widest outline-none focus:border-teal-400 focus:bg-white/15 backdrop-blur"
            />
            <button
              disabled={loading}
              className="mt-1 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs text-white/50 hover:text-white"
            >
              Wrong email? Go back
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-xs text-coral-600">{error}</p>}
      </div>

      <p className="mt-4 text-center text-xs text-white/50">
        New to StayInture?{" "}
        <Link href="/signup" className="font-semibold text-teal-400 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}