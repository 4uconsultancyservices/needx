import { Hero } from '@/components/home/hero';
import { CategoryGrid } from '@/components/home/category-grid';
import { NeedSection } from '@/components/home/need-section';
import { ListingSection } from '@/components/home/listing-section';
import { HowItWorks } from '@/components/home/how-it-works';
import { TrustSection } from '@/components/home/trust-section';
import { ProviderCta } from '@/components/home/provider-cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <NeedSection />
      <ListingSection title="Popular listings" subtitle="Newly added, ready to book." href="/listings" />
      <HowItWorks />
      <TrustSection />
      <ProviderCta />
    </>
  );
}
