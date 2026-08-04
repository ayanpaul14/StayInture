"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";

const steps = [
  { n: "01", title: "Search nearby", desc: "Filter by category and a 1–3km radius around you.", image: "/images/search.jpg" },
  { n: "02", title: "Contact the host", desc: "Message directly, ask questions, no middlemen.", image: "/images/contact.jpg" },
  { n: "03", title: "Book a visit", desc: "Confirm a time that works for both sides.", image: "/images/visit.jpg" },
  { n: "04", title: "List your own", desc: "Same account — flip into host mode anytime.", image: "/images/list.jpg" },
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
    <section className="bg-teal-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-head text-2xl font-bold sm:text-3xl"
        >
          How it works
        </motion.h2>

        <div ref={containerRef} className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr]">
          {/* Sticky image panel — desktop only, ≥lg */}
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                className="relative h-40 w-full overflow-hidden rounded-xl"
              >
                <Image
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  fill
                  sizes="280px"
                  className="object-cover"
                />
              </motion.div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink/40">
                Step {steps[activeStep].n}
              </p>
              <p className="text-sm font-semibold text-ink">{steps[activeStep].title}</p>
            </div>
          </div>

          <div className="relative">
            <svg
              className="absolute left-[15px] top-2 hidden h-[calc(100%-1rem)] w-1 sm:block"
              width="4"
              viewBox="0 0 4 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="2" y1="0" x2="2" y2="100" stroke="#D8D6D0" strokeWidth="2" />
              <motion.line
                x1="2"
                y1="0"
                x2="2"
                y2="100"
                stroke="#0F6E56"
                strokeWidth="2"
                style={{ pathLength: lineProgress }}
              />
            </svg>

            <div className="flex flex-col gap-10">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.5 }}
                  animate={{ opacity: i === activeStep ? 1 : 0.5, scale: i === activeStep ? 1 : 0.98 }}
                  className="relative flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition sm:pl-14"
                >
                  <span
                    className={`absolute left-3 top-5 hidden h-4 w-4 rounded-full sm:block ${
                      i <= activeStep ? "bg-teal-600" : "bg-black/10"
                    }`}
                  />
                  {/* Per-step thumbnail — visible on mobile & tablet, replaced by the sticky panel at lg+ */}
                  <div className="relative h-16 w-16 flex-none overflow-hidden rounded-xl lg:hidden">
                    <Image src={s.image} alt={s.title} fill sizes="64px" className="object-cover" />
                  </div>
                  <div>
                    <span className="font-head text-3xl font-bold text-teal-100">{s.n}</span>
                    <h3 className="mt-2 text-sm font-semibold text-ink">{s.title}</h3>
                    <p className="mt-1 text-xs text-ink/60">{s.desc}</p>
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