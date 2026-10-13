import { lazy, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import OracleWidget from './OracleWidget';
import PageLoader from './PageLoader';
import StreakRestoreCard from '../StreakRestoreCard';
import { useAuth } from '../../context/AuthContext';

// driver.js only downloads once someone is inside the app
const TourGuide = lazy(() => import('../tour/TourGuide'));
import { useTheme } from '../../context/ThemeContext';

// ── Per-theme background images ──────────────────────────────────────────
const THEME_BACKGROUNDS = {
  'doraemon': '/doremon-theme/doremon_flybeta.webp',
  'shinchan':      '/shinchan-theme/shinchan-theme-bg.webp',
  'princess':      '/disney-princess-thene/bg-theme.webp',
  'anime':         '/anime-theme/anime-theme.webp',
};

export default function Layout() {
  const { themeKey, isDarkMode } = useTheme();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const bgImage = THEME_BACKGROUNDS[themeKey];
  const hasThemedBg = !!bgImage;

  return (
    <div
      className={`min-h-screen ${hasThemedBg ? '' : 'grid-bg'}`}
      style={
        hasThemedBg
          ? {
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {/* Readability overlay — only rendered for themed backgrounds */}
      {hasThemedBg && (
        <div
          className="fixed inset-0 transition-colors"
          style={{ 
            background: isDarkMode ? '#111111' : '#F9F8F6', 
            opacity: isDarkMode ? 0.85 : 0.8, 
            zIndex: 0 
          }}
        />
      )}

      {/* All content sits above the overlay */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />
        <main className="max-w-[1440px] mx-auto px-4 md:px-12 pt-24 md:pt-28 pb-28 md:pb-16">
          {/* The Dashboard shows its own, larger restore card */}
          {user?.streak_restore && pathname !== '/dashboard' && <StreakRestoreCard variant="banner" />}
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
        <OracleWidget />
        <Suspense fallback={null}>
          <TourGuide />
        </Suspense>
      </div>
    </div>
  );
}
