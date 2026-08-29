import Hero from "../components/landing/Hero";
import CategoryShowcase from "../components/landing/CategoryShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import CTASection from "../components/landing/CTASection";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* LANDING SECTIONS FLOATING OVER THE GLOBAL BACKGROUND (Z-10) */}
      <div className="relative z-10">
        <Hero />
        <CategoryShowcase />
        <HowItWorks />
        <CTASection />
      </div>
    </div>
  );
}