import Hero from "../components/landing/Hero";
import CategoryShowcase from "../components/landing/CategoryShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import CTASection from "../components/landing/CTASection";
import Global3DBackground from "../components/landing/Global3DBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* PERSISTENT 3D CANVAS BACKGROUND (Z-0) */}
      <Global3DBackground />

      {/* LANDING SECTIONS FLOATING TRANSPARENTLY OVER THE 3D BACKGROUND (Z-10) */}
      <div className="relative z-10">
        <Hero />
        <CategoryShowcase />
        <HowItWorks />
        <CTASection />
      </div>
    </div>
  );
}