import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';

// Same control sizing as the app navbar, so the two feel like one product
const SHADOW = { boxShadow: '2px 2px 0px 0px var(--color-ink)' };
const PRIMARY_BUTTON = 'h-9 flex items-center px-3 md:px-5 border-2 border-ink bg-ink text-canvas font-bold uppercase tracking-wider text-xs md:text-sm no-underline whitespace-nowrap cursor-pointer hover:bg-primary hover:text-white transition-colors';

export default function LandingNavbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  const [authView, setAuthView] = useState(null); // 'login' | 'register' | null

  return (
    <nav className="sticky top-0 z-30 bg-canvas/95 backdrop-blur-sm border-b-2 border-ink">
      <div className="max-w-7xl mx-auto h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-4">
        <Logo to="/" />

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={toggleDarkMode}
            className="h-9 w-9 flex items-center justify-center border-2 border-ink bg-surface text-ink cursor-pointer hover:bg-canvas transition-colors"
            style={SHADOW}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {user ? (
            <Link to="/dashboard" className={PRIMARY_BUTTON} style={SHADOW}>
              Dashboard →
            </Link>
          ) : (
            <>
              <button
                onClick={() => setAuthView('login')}
                className="hidden sm:flex h-9 items-center px-3 text-ink font-bold uppercase tracking-wider text-sm cursor-pointer hover:text-primary transition-colors"
              >
                Log in
              </button>
              <button onClick={() => setAuthView('register')} className={PRIMARY_BUTTON} style={SHADOW}>
                Get started
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal isOpen={!!authView} initialView={authView || 'login'} onClose={() => setAuthView(null)} />
    </nav>
  );
}
