"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useSpring } from "framer-motion";

const categories = [
  { key: "flat", label: "Flat / Apartment", desc: "City living, ready to move in.", tone: "bg-teal-50 text-teal-800", image: "/images/apartment.jpg" },
  { key: "bungalow", label: "Bungalow", desc: "More space, more privacy.", tone: "bg-coral-50 text-coral-600", image: "/images/bungalow.jpg" },
  { key: "pg", label: "PG", desc: "Shared stays, students & professionals.", tone: "bg-teal-100 text-teal-900", image: "/images/pg.jpg" },
];

export default function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="font-head text-2xl font-bold sm:text-3xl"
      >
        Three ways to find a place
      </motion.h2>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3" style={{ perspective: 1000 }}>
        {categories.map((c, i) => (
          <TiltCard key={c.key} category={c} index={i} />
        ))}
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
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 14);
    rotateX.set(-py * 14);
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
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: i * 0.12 }}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformStyle: "preserve-3d",
      }}
      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 will-change-transform"
    >
      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${c.tone}`}>
        {c.label}
      </span>
      <div
        className="relative mt-4 h-28 overflow-hidden rounded-xl"
        style={{ transform: "translateZ(24px)" }}
      >
        <Image
          src={c.image}
          alt={c.label}
          fill
          sizes="(max-width: 640px) 90vw, 33vw"
          className="object-cover"
        />
      </div>
      <p className="mt-4 text-sm text-ink/60">{c.desc}</p>
    </motion.div>
  );
}