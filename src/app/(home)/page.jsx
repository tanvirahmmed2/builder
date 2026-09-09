'use client';

import HeroSection from '@/components/marketing/HeroSection';
import MarketingStats from '@/components/marketing/MarketingStats';
import FeaturesGrid from '@/components/marketing/FeaturesGrid';
import PricingCards from '@/components/marketing/PricingCards';
import ReviewsShowcase from '@/components/marketing/ReviewsShowcase';

export default function HomePage() {
  return (
    <div className="space-y-24 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Marketing Data & Metrics */}
      <MarketingStats />

      {/* 3. Features & Modules Breakdown */}
      <FeaturesGrid />

      {/* 4. Pricing & Instant Tenant Purchase */}
      <PricingCards />

      {/* 5. Client Reviews & Social Proof */}
      <ReviewsShowcase />
    </div>
  );
}
