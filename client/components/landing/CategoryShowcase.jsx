"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

const categories = [
  {
    key: "flat",
    label: "Flat / Apartment",
    desc: "Modern city living, fully furnished & ready to move in.",
    tone: "bg-teal-500/20 text-teal-200 border-teal-400/30",
    image: "/images/apartment.jpg",
    specs: "1–3 BHK · Smart Security",
  },
  {
    key: "bungalow",
    label: "Bungalow / Villa",
    desc: "Spacious private lawns, double-height lounge & luxury pool.",
    tone: "bg-coral-500/20 text-coral-300 border-coral-400/30",
    image: "/images/bungalow.jpg",
    specs: "Private Lawn · Pool & BBQ",
  },
  {
    key: "pg",
    label: "Shared PG",
    desc: "Co-living spaces with study desks, meals & fast WiFi.",
    tone: "bg-amber-500/20 text-amber-300 border-amber-400/30",
    image: "/images/pg.jpg",
    specs: "Single Bed · Meals Included",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="bg-teal-950 text-white border-t border-white/10 py-20 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 rounded-full bg-teal-800/30 blur-3xl" />
      
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Curated Stay Types
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="font-head text-2xl sm:text-3xl font-bold text-white mt-1"
            >
              Three ways to find your place
            </motion.h2>
          </div>
          <p className="text-xs sm:text-sm text-teal-200 max-w-sm">
            Discover verified flats, bungalows, and PG accommodations around your 1–3km radius.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3" style={{ perspective: 1000 }}>
          {categories.map((c, i) => (
            <TiltCard key={c.key} category={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TiltCard({ category: c, index: i }) {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  function handleMouseMove(e) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 12);
    rotateX.set(-py * 12);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: i * 0.12 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      className="rounded-2xl bg-teal-900/40 border border-white/15 p-6 shadow-2xl backdrop-blur-xl transition-colors hover:border-coral-400/40 hover:bg-teal-900/60 will-change-transform flex flex-col justify-between"
    >
      <div>
        <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${c.tone}`}>
          {c.label}
        </span>

        <div
          className="relative mt-4 h-36 w-full overflow-hidden rounded-xl border border-white/10 group"
          style={{ transform: "translateZ(20px)" }}
        >
          <Image
            src={c.image}
            alt={c.label}
            fill
            sizes="(max-width: 640px) 90vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/80 via-transparent to-transparent" />
          <span className="absolute bottom-2 left-2 text-[11px] font-medium text-teal-200 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {c.specs}
          </span>
        </div>

        <p className="mt-4 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
          {c.desc}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-coral-300 font-semibold">
        <span>Explore Category</span>
        <span>&rarr;</span>
      </div>
    </motion.div>
  );
}