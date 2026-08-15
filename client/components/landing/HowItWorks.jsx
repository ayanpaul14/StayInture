"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const steps = [
  { n: "01", title: "Search nearby", desc: "Filter by category (Flat, Bungalow, PG) and a 1–3km radius around you.", image: "/images/search.jpg" },
  { n: "02", title: "Contact the host", desc: "Message hosts directly, ask questions, zero middlemen.", image: "/images/contact.jpg" },
  { n: "03", title: "Book a visit", desc: "Confirm a visit time that works for both host and guest.", image: "/images/visit.jpg" },
  { n: "04", title: "List your own", desc: "One account — switch to host mode to list your property anytime.", image: "/images/list.jpg" },
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(v * steps.length)));
    setActiveStep(idx);
  });

  return (
    <section className="bg-teal-950/50 backdrop-blur-md text-white border-y border-white/10 py-20 relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-coral-300">
              Simple 4-Step Process
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
              className="font-head text-2xl sm:text-3xl font-bold text-white mt-1 drop-shadow-md"
            >
              How StayInture works
            </motion.h2>
          </div>
          <p className="text-xs sm:text-sm text-teal-200 max-w-sm drop-shadow">
            From smart radius search to direct host messaging and listing your own place.
          </p>
        </div>

        <div ref={containerRef} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          {/* Sticky image panel — desktop only, ≥lg */}
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl bg-teal-900/70 border border-white/20 p-6 shadow-2xl backdrop-blur-xl">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative h-44 w-full overflow-hidden rounded-xl border border-white/10"
              >
                <Image
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </motion.div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-coral-300">
                Step {steps[activeStep].n}
              </p>
              <p className="text-base font-bold text-white mt-0.5">{steps[activeStep].title}</p>
              <p className="text-xs text-teal-100/80 mt-1 leading-relaxed">{steps[activeStep].desc}</p>
            </div>
          </div>

          <div className="relative">
            {/* Animated Vertical Line */}
            <svg
              className="absolute left-[15px] top-2 hidden h-[calc(100%-1rem)] w-1 sm:block"
              width="4"
              viewBox="0 0 4 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="2" y1="0" x2="2" y2="100" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="100"
                stroke="#F87171"
                strokeWidth="2"
                style={{ pathLength: lineProgress }}
              />
            </svg>

            <div className="flex flex-col gap-8">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5 }}
                  animate={{ opacity: i === activeStep ? 1 : 0.6, scale: i === activeStep ? 1 : 0.98 }}
                  className="relative flex items-center gap-4 rounded-2xl bg-teal-900/50 border border-white/20 p-5 shadow-2xl backdrop-blur-xl transition hover:bg-teal-900/70 sm:pl-14"
                >
                  <span
                    className={`absolute left-3 top-6 hidden h-4 w-4 rounded-full border-2 border-white/40 sm:block ${
                      i <= activeStep ? "bg-coral-400 border-coral-300" : "bg-teal-950"
                    }`}
                  />
                  {/* Per-step thumbnail — visible on mobile & tablet */}
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl border border-white/10 lg:hidden">
                    <Image src={s.image} alt={s.title} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <span className="font-head text-3xl font-extrabold text-coral-400/80">{s.n}</span>
                    <h3 className="mt-1 text-base font-bold text-white">{s.title}</h3>
                    <p className="mt-1 text-xs text-teal-100/90 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}