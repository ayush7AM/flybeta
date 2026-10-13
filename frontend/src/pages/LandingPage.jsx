import HeroSection from '../components/landing/HeroSection';
import Marquee from '../components/landing/Marquee';
import ExploreSection from '../components/landing/ExploreSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen grid-bg">
      <HeroSection />
      <Marquee />
      <ExploreSection />
      <HowItWorksSection />
      <Footer />
    </div>
  );
}
