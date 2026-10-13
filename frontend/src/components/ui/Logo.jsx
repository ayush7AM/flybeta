import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.webp';
import { useTheme } from '../../context/ThemeContext';

export default function Logo({ to = '/', className = '', compact = false }) {
  const { isDarkMode } = useTheme();

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 no-underline ${className}`}
    >
      <img
        src={logoImg}
        alt="FlyBeta Logo"
        className="h-9 w-9 object-contain transition-all"
        style={{ 
          filter: isDarkMode ? 'invert(1)' : 'none',
          mixBlendMode: isDarkMode ? 'screen' : 'multiply'
        }}
      />
      <span className={`font-black text-xl sm:text-2xl tracking-tighter uppercase text-ink transition-colors ${compact ? 'hidden sm:inline' : ''}`}>
        FLYBETA
      </span>
    </Link>
  );
}
