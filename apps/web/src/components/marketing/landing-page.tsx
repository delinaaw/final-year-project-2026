import { CtaSection } from "@/components/marketing/cta-section";
import { EveryoneSection } from "@/components/marketing/everyone-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { VoiceIllustration } from "@/components/marketing/voice-illustration";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <VoiceIllustration />
      <HowItWorks />
      <FeaturesSection />
      <EveryoneSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
