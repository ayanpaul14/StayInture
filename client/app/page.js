import Hero from "../components/landing/Hero";
import CategoryShowcase from "../components/landing/CategoryShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import CTASection from "../components/landing/CTASection";
import Global3DBackground from "../components/landing/Global3DBackground";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-teal-950 text-white">
      {/* PERSISTENT FIXED 3D CANVAS BACKGROUND */}
      <Global3DBackground />

      {/* LANDING SECTIONS FLOATING TRANSPARENTLY OVER THE 3D BACKGROUND */}
      <Hero />
      <CategoryShowcase />
      <HowItWorks />
      <CTASection />
    </div>
  );
}