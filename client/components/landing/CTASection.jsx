"use client";

import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";

export default function CTASection() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-teal-900 px-8 py-14 text-center text-white sm:px-16"
      >
        <div className="xid-grain" />
        <motion.div
          className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-coral-600/60"
          animate={{ x: [0, 16, -8, 0], y: [0, -10, 8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-teal-800"
          animate={{ x: [0, -14, 10, 0], y: [0, 12, -8, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />

        <h2 className="relative font-head text-2xl font-bold sm:text-3xl">
          Ready to find your next place?
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-sm text-teal-100">
          Or list yours in a few minutes — same account, no separate signup.
        </p>
        <div className="relative mt-7 flex flex-wrap justify-center gap-3">
          <MagneticButton
            href="/explore"
            className="inline-block rounded-full bg-coral-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-600"
          >
            Start exploring
          </MagneticButton>
          <MagneticButton
            href="/login"
            className="inline-block rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
          >
            Log in
          </MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}