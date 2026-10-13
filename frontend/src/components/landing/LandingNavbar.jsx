import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import Logo from '../ui/Logo';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../auth/AuthModal';
import { useState } from 'react';

export default function LandingNavbar() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="relative z-20 flex items-center justify-between gap-3 w-full px-4 md:px-8 py-4">
      {/* Left: Logo */}
      <Logo to="/" />

      {/* Center: Marketing Links */}
      <div className="hidden md:flex items-center gap-8 font-semibold text-ink">
        <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          Home
        </a>
        <a href="#about-us" onClick={(e) => scrollToSection(e, 'about-us')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          About Us
        </a>
        <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          How it Works
        </a>
        <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="no-underline text-ink hover:text-[#EAB308] transition-colors uppercase tracking-wider text-sm cursor-pointer">
          Contact
        </a>
      </div>

      {/* Right: Get Started & Toggle */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleDarkMode}
          className="bg-transparent border-2 border-ink text-ink p-2 hover:bg-canvas transition-colors cursor-pointer"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {user ? (
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/tracks"
              className="hidden md:flex items-center gap-2 bg-canvas px-4 py-2 border-2 border-ink hover:bg-border-light transition-colors no-underline text-ink label-mono"
            >
              <span>⚡</span>
              <span>{user.xp || user.total_xp || 0} XP</span>
            </Link>
            <button
              onClick={logout}
              className="hidden md:inline text-sm font-bold uppercase tracking-wider text-red-600 hover:text-red-700 underline bg-transparent border-none cursor-pointer"
            >
              Logout
            </button>
            <Link
              to="/tracks"
              className="bg-black text-white px-3 md:px-6 py-2 md:py-2.5 font-bold hover:bg-[var(--color-primary)] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-xs md:text-sm no-underline whitespace-nowrap"
            >
              Dashboard
            </Link>
          </div>
        ) : (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="bg-black text-white px-3 md:px-6 py-2 md:py-2.5 font-bold hover:bg-[#EAB308] hover:text-black border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wider text-xs md:text-sm cursor-pointer whitespace-nowrap"
          >
            GET STARTED
          </button>
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </nav>
  );
}
