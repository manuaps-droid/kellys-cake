import Navbar from "@/components/layout/Navbar";

import HeroSection from "@/features/customization/components/HeroSection";
import HowItWorksSection from "@/features/customization/components/HowItWorksSection";
import PersonalizationOptionsSection from "@/features/customization/components/PersonalizationOptionsSection";
import GallerySection from "@/features/customization/components/GallerySection";

export default function PersonalizarPage() {
  return (
    <>
      <Navbar />

      <main>
        <HeroSection />

        <HowItWorksSection />

        <PersonalizationOptionsSection />

        <GallerySection />
      </main>
    </>
  );
}