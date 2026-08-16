"use client";

import { motion } from "framer-motion";
import MagneticButton from "./MagneticButton";

export default function CTASection() {
  return (
    <section className="bg-teal-950/60 backdrop-blur-md text-white py-20 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-teal-900/60 border border-white/20 px-8 py-14 text-center text-white shadow-2xl backdrop-blur-xl sm:px-16"
        >
          <div className="xid-grain" />
          <motion.div
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-blue-600/40 blur-2xl"
            animate={{ x: [0, 16, -8, 0], y: [0, -10, 8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-teal-800/40 blur-2xl"
            animate={{ x: [0, -14, 10, 0], y: [0, 12, -8, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          <h2 className="relative font-head text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
            Ready to find your next place?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-teal-100/90 drop-shadow">
            Or list yours in a few minutes — same account, no separate signup required.
          </p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <MagneticButton
              href="/explore"
              className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30"
            >
              Start exploring
            </MagneticButton>
            <MagneticButton
              href="/login"
              className="inline-block rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/20"
            >
              Log in
            </MagneticButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}