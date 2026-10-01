import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import BrandLinesSection from "@/components/home/BrandLinesSection";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellers from "@/components/home/BestSellers";
import HowItWorks from "@/components/home/HowItWorks";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <BrandLinesSection />
        <Categories />
        <FeaturedProducts />
        <BestSellers />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
