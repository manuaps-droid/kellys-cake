import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import {
  HeroSection,
  StatsBanner,
  StorySection,
  ValuesSection,
  TimelineSection,
  CTASection,
} from "./_components/AnimatedSections";

export default function NosotrosPage() {
  return (
    <div className="overflow-hidden bg-white">
      <Navbar />

      <HeroSection />
      <StatsBanner />
      <StorySection />
      <ValuesSection />
      <TimelineSection />
      <CTASection />

      <Footer />
    </div>
  );
}
