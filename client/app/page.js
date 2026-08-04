import Hero from "../components/landing/Hero";
import CategoryShowcase from "../components/landing/CategoryShowcase";
import HowItWorks from "../components/landing/HowItWorks";
import CTASection from "../components/landing/CTASection";

export default function LandingPage() {
  return (
    <div>
      <Hero />
      <CategoryShowcase />
      <HowItWorks />
      <CTASection />
    </div>
  );
}