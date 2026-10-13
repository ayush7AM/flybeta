import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useStartTour } from '../tour/tour';
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

// Right-hand controls share one height, a hard border and a small offset shadow.
// (Display is set per element so responsive hidden/flex classes never collide.)
const CONTROL = 'h-9 items-center border-2 border-ink';
const CONTROL_SHADOW = { boxShadow: '2px 2px 0px 0px var(--color-ink)' };
const DROPDOWN = 'absolute right-0 top-full mt-2 border-2 border-ink bg-surface z-50';

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeKey, themes, themeKeys, setTheme, isDarkMode, toggleDarkMode } = useTheme();
  const startTour = useStartTour();
  const [themeOpen, setThemeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const themeRef = useRef(null);
  const accountRef = useRef(null);
  const menuRef = useRef(null);

  const links = [...NAV_LINKS, ...(user ? AUTH_NAV_LINKS : [])];
  const isActivePath = (path) => (
    path === '/tracks'
      ? location.pathname === '/tracks' || location.pathname.startsWith('/track')
      : location.pathname.startsWith(path)
  );
  const displayName = user ? (user.name || user.username || '') : '';
  const initial = displayName.trim().charAt(0).toUpperCase() || '?';

  // Close any open popover on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close menus after navigating
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center gap-4 px-4 md:px-8 xl:px-12 h-16 md:h-20 bg-surface border-b-2 border-ink"
         style={{ boxShadow: 'var(--shadow-brutal)' }}>
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center gap-6 xl:gap-8 min-w-0">
        <Logo to="/tracks" compact />
        <div id="tour-nav-links" className="hidden lg:flex gap-1 xl:gap-2">
          {links.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`label-mono px-3 xl:px-4 py-2 no-underline border-2 transition-all whitespace-nowrap ${
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

      {/* Right: Stats · Display · Account */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        {/* Stats pill — streak & coins join XP on large screens */}
        {user && (
          <div id="tour-xp" className={`${CONTROL} flex divide-x-2 divide-ink overflow-hidden`} style={CONTROL_SHADOW}>
            <span className="hidden lg:flex items-center gap-1.5 h-full px-3 bg-flame-light text-flame label-mono font-bold" title="Daily streak">
              🔥 {user.streak || 0}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 h-full px-3 bg-gold-light text-gold label-mono font-bold" title="Coins">
              💰 {user.coins?.toLocaleString() || 0}
            </span>
            <span className="flex items-center gap-1.5 h-full px-3 bg-cobalt-light text-cobalt label-mono font-bold whitespace-nowrap" title="Experience points">
              ⚡ {user.total_xp?.toLocaleString() || 0} XP
            </span>
          </div>
        )}

        {/* Display: dark mode + theme */}
        <div id="tour-customize" className="relative" ref={themeRef}>
          <div className={`${CONTROL} flex bg-surface text-ink`} style={CONTROL_SHADOW}>
            <button
              onClick={toggleDarkMode}
              className="h-full px-2.5 flex items-center hover:bg-canvas transition-colors cursor-pointer"
              title="Toggle dark mode"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="h-full px-2.5 flex items-center gap-1.5 border-l-2 border-ink hover:bg-canvas transition-colors cursor-pointer"
              title="Switch theme"
              aria-label="Switch theme"
              aria-expanded={themeOpen}
            >
              <span aria-hidden="true">{themes[themeKey].icon}</span>
              <span className="hidden xl:inline label-mono whitespace-nowrap">{themes[themeKey].label}</span>
              <ChevronDown size={14} />
            </button>
          </div>

          {themeOpen && (
            <div className={DROPDOWN} style={{ boxShadow: 'var(--shadow-brutal-sm)', minWidth: '190px' }}>
              {themeKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => { setTheme(key); setThemeOpen(false); }}
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
            </div>
          )}
        </div>

        {/* Account (large screens — phones use the ☰ menu) */}
        {user ? (
          <div className="relative hidden lg:block" ref={accountRef}>
            <button
              onClick={() => setAccountOpen(!accountOpen)}
              className={`${CONTROL} flex gap-1.5 pl-1 pr-2 bg-surface text-ink cursor-pointer`}
              style={CONTROL_SHADOW}
              aria-label="Account menu"
              aria-expanded={accountOpen}
              title={displayName}
            >
              <span className="w-7 h-7 flex items-center justify-center border-2 border-ink bg-primary text-white font-black text-sm overflow-hidden">
                {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : initial}
              </span>
              <ChevronDown size={14} />
            </button>

            {accountOpen && (
              <div className={`${DROPDOWN} w-60`} style={{ boxShadow: 'var(--shadow-brutal-sm)' }}>
                <div className="px-4 py-3 border-b-2 border-ink">
                  <p className="font-bold m-0 truncate">{displayName}</p>
                  <p className="label-mono text-muted m-0 mt-1 truncate" style={{ textTransform: 'none' }}>@{user.username}</p>
                </div>
                <Link to="/dashboard" className="block px-4 py-3 label-mono no-underline text-ink hover:bg-canvas border-b border-border-light">
                  📊 Dashboard
                </Link>
                <button
                  onClick={() => { setAccountOpen(false); startTour(); }}
                  className="w-full text-left px-4 py-3 label-mono text-ink bg-surface hover:bg-canvas border-b border-border-light cursor-pointer"
                >
                  🎓 Replay tutorial
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 label-mono flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className={`${CONTROL} hidden lg:flex px-4 label-mono font-bold bg-ink text-canvas cursor-pointer whitespace-nowrap`}
            style={CONTROL_SHADOW}
          >
            Sign in
          </button>
        )}

        {/* Menu for phones & tablets (links are hidden in the bar below lg) */}
        <div className="lg:hidden" ref={menuRef}>
          <button
            id="tour-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-10 h-10 border-2 border-ink bg-surface text-ink cursor-pointer"
            style={CONTROL_SHADOW}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {menuOpen && (
            <div className="fixed left-0 right-0 top-16 md:top-20 border-b-2 border-ink bg-surface px-4 py-4 flex flex-col gap-2"
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
                      <span>{user.coins?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); startTour(); }}
                    className="label-mono px-4 py-3 text-left border-2 border-border-light bg-surface text-ink cursor-pointer"
                  >
                    🎓 Replay tutorial
                  </button>
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
