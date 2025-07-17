import Header from "@/components/news-reader-home/Header";
import Hero from "@/components/news-reader-home/Hero";
import {HowItWorksCards , WhyUseCards } from "@/components/news-reader-home/Cards";
import FeaturedPublications from "@/components/news-reader-home/FeaturedPublications";
import Footer from "@/components/news-reader-home/Footer";


export default function HomePage() {
  return (
    <div>
      <Header />
      <Hero />
      <WhyUseCards />
      <HowItWorksCards />
      <FeaturedPublications />
      <Footer />
    </div>
  );
}
