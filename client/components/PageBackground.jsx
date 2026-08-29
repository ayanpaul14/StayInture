"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
    >
      {/* 1. Base wallpaper image */}
      <motion.div
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full"
      >
        <Image
          src="/images/bungalow_2.jpg"
          alt=""
          fill
          priority
          quality={95}
          className="object-cover object-center brightness-[0.80] contrast-[1.05] saturate-[1.15]"
        />
      </motion.div>

      {/* 2. Deep cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-950/40 via-slate-900/20 to-slate-950/55" />

      {/* 3. Radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_40%,rgba(0,0,0,0.28)_100%)]" />

      {/* 4. Warm golden ambient light */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2.2, ease: "easeOut", delay: 0.4 }}
        className="absolute -top-10 -left-10 w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 30% 30%, rgba(251,191,36,0.22) 0%, rgba(234,179,8,0.10) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* 5. Cool teal/cyan glow - right side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 2.4, ease: "easeOut", delay: 0.6 }}
        className="absolute top-0 right-0 w-[520px] h-[480px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 70% 20%, rgba(20,184,166,0.26) 0%, rgba(6,182,212,0.12) 45%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* 6. Purple/indigo mid-screen accent */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3, ease: "easeOut", delay: 0.8 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[700px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.07) 50%, transparent 75%)",
          filter: "blur(80px)",
        }}
      />

      {/* 7. God-ray center highlight */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0.7 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ duration: 2.8, ease: "easeOut", delay: 0.5 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[60vh] pointer-events-none origin-top"
        style={{
          background: "linear-gradient(to bottom, rgba(251,191,36,0.14) 0%, rgba(20,184,166,0.06) 40%, transparent 80%)",
          filter: "blur(40px)",
        }}
      />

      {/* 8. Animated floating teal orb */}
      <motion.div
        animate={{ y: [0, -22, 0], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[18%] left-[12%] w-60 h-60 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(20,184,166,0.28) 0%, rgba(20,184,166,0.08) 55%, transparent 75%)",
          filter: "blur(48px)",
        }}
      />

      {/* 9. Animated floating golden orb */}
      <motion.div
        animate={{ y: [0, 18, 0], opacity: [0.45, 0.70, 0.45] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[10%] right-[10%] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(251,191,36,0.22) 0%, rgba(234,179,8,0.08) 55%, transparent 75%)",
          filter: "blur(56px)",
        }}
      />

      {/* 10. Horizon light band */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: "42%",
          height: "120px",
          background: "linear-gradient(to right, transparent 0%, rgba(20,184,166,0.09) 25%, rgba(251,191,36,0.11) 50%, rgba(20,184,166,0.09) 75%, transparent 100%)",
          filter: "blur(30px)",
        }}
      />

      {/* 11. Bottom grounding shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-950/70 to-transparent" />
    </div>
  );
}
