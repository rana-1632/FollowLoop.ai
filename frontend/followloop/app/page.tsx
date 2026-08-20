import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import LogoMarquee from "@/components/landing/LogoMarquee";
import Stats from "@/components/landing/Stats";
import FeatureGrid from "@/components/landing/FeatureGrid";
import HowItWorks from "@/components/landing/HowItWorks";
import CopilotDemo from "@/components/landing/CopilotDemo";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import CTASection from "@/components/landing/CTASection";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <Stats />
        <FeatureGrid />
        <HowItWorks />
        <CopilotDemo />
        <Testimonials />
        <Pricing />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
