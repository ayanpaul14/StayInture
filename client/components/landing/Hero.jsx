"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from "framer-motion";
import MagneticButton from "./MagneticButton";
import TypewriterSearch from "./TypewriterSearch";

// 3D ring uses WebGL - load client-only, never during SSR
const CardRing3D = dynamic(() => import("./CardRing3D"), { ssr: false, loading: () => null });

const headline = "Find a place to call home.";

export default function Hero() {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // cursor position, used for spotlight glow (desktop only - no-op on touch)
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
    const rect = sectionRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <motion.section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{ scale: heroScale, opacity: heroOpacity }}
      className="relative overflow-hidden bg-teal-900 px-5 pb-16 pt-14 text-white sm:pb-24 sm:pt-20 lg:pb-32 lg:pt-24"
    >
      <div className="xid-grain" />

      {/* cursor spotlight - desktop only, harmless no-op on touch */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute hidden h-[420px] w-[420px] rounded-full md:block"
        style={{
          left: useTransform(springX, (v) => `calc(${(v + 0.5) * 100}% - 210px)`),
          top: useTransform(springY, (v) => `calc(${(v + 0.5) * 100}% - 210px)`),
          background:
            "radial-gradient(circle, rgba(159,225,203,0.18) 0%, rgba(159,225,203,0) 70%)",
        }}
      />
{/* drifting gradient blobs */}
      <motion.div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-teal-800 sm:h-96 sm:w-96"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -14, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-coral-600/75 sm:h-64 sm:w-64"
        animate={{ x: [0, 22, -14, 0], y: [0, -16, 12, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-8 left-[18%] hidden h-40 w-40 rounded-full bg-teal-600 sm:block sm:h-52 sm:w-52"
        animate={{ x: [0, 18, -10, 0], y: [0, -12, 8, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute left-[8%] top-[28%] hidden h-24 w-24 rounded-full bg-teal-400/70 sm:block"
        animate={{ x: [0, -14, 10, 0], y: [0, 10, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        {/* text column */}
        <div className="flex flex-col items-start">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-teal-100"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-coral-400" />
            Flat &middot; Bungalow &middot; PG — near you
          </motion.span>

          <h1 className="max-w-xl font-head text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {headline.split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
            <br />
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 * (headline.split(" ").length + 1) }}
              className="inline-block text-coral-400"
            >
              Or list yours.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-4 max-w-md text-sm text-teal-100 sm:text-base"
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
              className="inline-block rounded-full bg-coral-400 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-coral-600"
            >
              Explore nearby places
            </MagneticButton>
            <MagneticButton
              href="/host/new"
              className="inline-block rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              List your property
            </MagneticButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="mt-8 flex gap-6 text-sm text-teal-100 sm:mt-10 sm:gap-8"
          >
            <Stat value="3" label="categories" />
            <Stat value="1–3km" label="smart radius search" />
            <Stat value="1" label="account, two roles" />
          </motion.div>
        </div>

        {/* 3D ring column - shorter + fewer cards on mobile for perf */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full"
        >
          <CardRing3D
            count={isMobile ? 5 : 7}
            radius={isMobile ? 2.6 : 3.2}
            height={isMobile ? 240 : 380}
            interactive={!isMobile}
          />
        </motion.div>
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