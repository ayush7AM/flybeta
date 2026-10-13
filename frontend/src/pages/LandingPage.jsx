import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import Marquee from '../components/landing/Marquee';
import ExploreSection from '../components/landing/ExploreSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen grid-bg">
      {/* Outside the hero so it stays pinned while scrolling */}
      <LandingNavbar />
      <main>
        <HeroSection />
        <Marquee />
        <ExploreSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </div>
  );
}
