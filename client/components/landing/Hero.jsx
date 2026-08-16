"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import MagneticButton from "./MagneticButton";
import TypewriterSearch from "./TypewriterSearch";

const headline = "Find a place to call home.";

export default function Hero() {
  const sectionRef = useRef(null);

  // cursor position, used for spotlight glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  // scroll-linked shrink/fade as the hero scrolls out of view
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.96]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.5]);

  function handleMouseMove(e) {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{ scale: heroScale, opacity: heroOpacity }}
      className="relative overflow-hidden bg-transparent px-5 pb-16 pt-14 text-white sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24 min-h-[640px] lg:min-h-[720px] flex items-center"
    >
      <div className="xid-grain pointer-events-none" />

      {/* cursor spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute hidden h-[420px] w-[420px] rounded-full md:block z-10"
        style={{
          left: useTransform(springX, (v) => `calc(${(v + 0.5) * 100}% - 210px)`),
          top: useTransform(springY, (v) => `calc(${(v + 0.5) * 100}% - 210px)`),
          background:
            "radial-gradient(circle, rgba(159,225,203,0.18) 0%, rgba(159,225,203,0) 70%)",
        }}
      />

      {/* FOREGROUND HERO CONTENT LAYER */}
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col items-start max-w-xl">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-teal-950/90 border border-white/20 px-3.5 py-1 text-xs font-semibold text-teal-100 backdrop-blur-xl shadow-lg"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-coral-400" />
            Flat &middot; Bungalow &middot; PG — near you
          </motion.span>

          <h1 className="font-head text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            {headline.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="mr-2 inline-block text-white"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * (headline.split(" ").length + 1) }}
              className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-300 font-extrabold drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
            >
              Or list yours.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-4 max-w-md text-sm font-medium text-white/90 sm:text-base drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed"
          >
            StayInture finds the closest Flat, Bungalow or PG around you — and if
            you've got a place of your own, you're one form away from listing it too.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="mt-6 w-full max-w-md"
          >
            <TypewriterSearch />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <MagneticButton
              href="/explore"
              className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/30"
            >
              Explore nearby places
            </MagneticButton>
            <MagneticButton
              href="/host/new"
              className="inline-block rounded-full bg-teal-950/80 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur-md transition hover:bg-white/20"
            >
              List your property
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mt-8 flex gap-6 text-sm text-teal-100 sm:mt-10 sm:gap-8 rounded-2xl bg-teal-950/60 border border-white/10 p-3 backdrop-blur-md"
          >
            <Stat value="3" label="categories" />
            <Stat value="1–3km" label="smart radius search" />
            <Stat value="1" label="account, two roles" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="font-head text-base font-bold text-white sm:text-lg">{value}</p>
      <p className="text-xs text-teal-200">{label}</p>
    </div>
  );
}