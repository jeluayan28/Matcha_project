import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Benefits } from "@/components/sections/benefits";
import { BrandStory } from "@/components/sections/brand-story";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { Hero } from "@/components/sections/hero";
import { Newsletter } from "@/components/sections/newsletter";
import { WhyMatcha } from "@/components/sections/why-matcha";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Benefits />
        <FeaturedProducts />
        <WhyMatcha />
        <BrandStory />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
