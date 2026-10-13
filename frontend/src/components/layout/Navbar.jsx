import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import AuthModal from '../auth/AuthModal';

const NAV_LINKS = [
  { label: 'Tracks', path: '/tracks' },
  { label: 'Labs', path: '/labs' },
  { label: 'Vision', path: '/vision' },
];

const AUTH_NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
];

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeKey, themes, themeKeys, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const links = [...NAV_LINKS, ...(user ? AUTH_NAV_LINKS : [])];
  const isActivePath = (path) => (
    path === '/tracks'
      ? location.pathname === '/tracks' || location.pathname.startsWith('/track')
      : location.pathname.startsWith(path)
  );

  // Close dropdown / mobile menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close the mobile menu after navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-12 h-16 md:h-20 bg-surface border-b-2 border-ink"
         style={{ boxShadow: 'var(--shadow-brutal)' }}>
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-8">
        <Logo to="/tracks" compact />
        <div id="tour-nav-links" className="hidden md:flex gap-2">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`label-mono px-4 py-2 no-underline border-2 transition-all ${
                isActivePath(path)
                  ? 'bg-primary text-white border-ink'
                  : 'text-muted border-transparent hover:border-ink hover:bg-canvas'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Gamification Stats + Theme Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {user && (
          <>
            {/* Wrapper carries the breakpoint: .brutalist-badge sets display itself */}
            <div className="hidden md:flex items-center gap-3">
              <div className="brutalist-badge bg-flame-light text-flame" title="Daily Streak">
                <span>🔥</span>
                <span>{user.streak || 0}</span>
              </div>
              <div className="brutalist-badge bg-gold-light text-gold" title="Coins">
                <span>💰</span>
                <span>{user.coins || 0}</span>
              </div>
            </div>
            <div id="tour-xp" className="brutalist-badge bg-cobalt-light text-cobalt whitespace-nowrap" title="Experience Points">
              <span>⚡</span>
              <span>{user.total_xp?.toLocaleString() || 0} XP</span>
            </div>
          </>
        )}

        <div id="tour-customize" className="flex items-center gap-2 md:gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors p-2"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="brutalist-badge bg-canvas text-ink cursor-pointer hover:bg-border-light transition-colors"
            title="Switch Theme"
          >
            <span>{themes[themeKey].icon}</span>
            <span className="hidden md:inline">{themes[themeKey].label}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 border-2 border-ink bg-surface z-50"
                 style={{ boxShadow: 'var(--shadow-brutal-sm)', minWidth: '180px' }}>
              {themeKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => { setTheme(key); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 label-mono flex items-center gap-2 border-b border-border-light last:border-b-0 transition-colors cursor-pointer ${
                    key === themeKey
                      ? 'bg-primary text-white'
                      : 'bg-surface text-ink hover:bg-canvas'
                  }`}
                >
                  <span>{themes[key].icon}</span>
                  <span>{themes[key].label}</span>
                </button>
              ))}
              {user && (
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 label-mono flex items-center gap-2 border-t-2 border-ink bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
        </div>

        {/* Mobile menu (links are hidden in the bar below md) */}
        <div className="md:hidden" ref={menuRef}>
          <button
            id="tour-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-10 h-10 border-2 border-ink bg-surface text-ink cursor-pointer"
            style={{ boxShadow: '2px 2px 0px 0px var(--color-ink)' }}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {menuOpen && (
            <div className="fixed left-0 right-0 top-16 border-b-2 border-ink bg-surface px-4 py-4 flex flex-col gap-2"
                 style={{ boxShadow: 'var(--shadow-brutal)' }}>
              {links.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`label-mono px-4 py-3 no-underline border-2 ${
                    isActivePath(path)
                      ? 'bg-primary text-white border-ink'
                      : 'text-ink border-border-light'
                  }`}
                >
                  {label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="brutalist-badge bg-flame-light text-flame" title="Daily Streak">
                      <span>🔥</span>
                      <span>{user.streak || 0} day streak</span>
                    </div>
                    <div className="brutalist-badge bg-gold-light text-gold" title="Coins">
                      <span>💰</span>
                      <span>{user.coins || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="label-mono px-4 py-3 text-left border-2 border-ink bg-red-100 text-red-700 cursor-pointer"
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setMenuOpen(false); setShowAuthModal(true); }}
                  className="label-mono px-4 py-3 border-2 border-ink bg-ink text-canvas cursor-pointer"
                >
                  Sign in / Sign up
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </nav>
  );
}
