import { Link, useLocation } from 'react-router-dom';

const LAB_TABS = [
  { label: '⚙ Blueprint Lab', path: '/labs/architect' },
  { label: '🔍 Code Drishti', path: '/labs/reviewer' },
];

export default function LabsSubNav() {
  const { pathname } = useLocation();

  return (
    <nav id="tour-labs-nav" className="flex gap-0 mb-10 border-2 border-ink w-fit"
         style={{ boxShadow: 'var(--shadow-brutal-sm)' }}>
      {LAB_TABS.map(({ label, path }) => {
        const isActive = pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`label-mono px-6 py-3 no-underline transition-colors border-r-2 border-ink last:border-r-0 ${
              isActive
                ? 'bg-primary text-white'
                : 'bg-surface text-ink hover:bg-canvas'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
