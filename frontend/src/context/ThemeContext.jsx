import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ── Theme Definitions ───────────────────────────────────────────────────
// Each theme is a map of CSS custom property → value.
// Only override the tokens that change; the rest stay as defined in index.css.

const THEMES = {
  'neo-brutalism': {
    label: 'Neo-Brutalism',
    icon: '🏗️',
    vars: {
      // Base theme — these match index.css defaults, listed for explicitness
      '--color-ink': '#111111',
      '--color-canvas': '#F9F8F6',
      '--color-surface': '#FFFFFF',
      '--color-primary': '#E52E2E',
      '--color-primary-dark': '#C41E1E',
      '--color-muted': '#6B7280',
      '--color-border': '#111111',
      '--color-border-light': '#E5E2E1',
      '--shadow-brutal': '6px 6px 0px 0px #111111',
      '--shadow-brutal-sm': '4px 4px 0px 0px #111111',
      '--shadow-brutal-lg': '10px 10px 0px 0px #111111',
      '--font-heading': '"Anton", "Impact", sans-serif',
    },
    darkVars: {
      '--color-ink': '#F9F8F6',
      '--color-canvas': '#111111',
      '--color-surface': '#1F1F1F',
      '--color-primary': '#E52E2E',
      '--color-primary-dark': '#C41E1E',
      '--color-muted': '#9CA3AF',
      '--color-border': '#F9F8F6',
      '--color-border-light': '#333333',
      '--shadow-brutal': '6px 6px 0px 0px #F9F8F6',
      '--shadow-brutal-sm': '4px 4px 0px 0px #F9F8F6',
      '--shadow-brutal-lg': '10px 10px 0px 0px #F9F8F6',
      '--font-heading': '"Anton", "Impact", sans-serif',
    }
  },
  'doraemon': {
    label: 'Doraemon',
    icon: '🤖',
    vars: {
      '--color-ink': '#1a365d',
      '--color-canvas': '#ebf8ff',
      '--color-surface': '#FFFFFF',
      '--color-primary': '#3182ce',
      '--color-primary-dark': '#2b6cb0',
      '--color-muted': '#718096',
      '--color-border': '#2b6cb0',
      '--color-border-light': '#bee3f8',
      '--shadow-brutal': '5px 5px 0px 0px #2b6cb0',
      '--shadow-brutal-sm': '3px 3px 0px 0px #2b6cb0',
      '--shadow-brutal-lg': '8px 8px 0px 0px #2b6cb0',
      '--font-heading': '"Anton", "Impact", sans-serif',
    },
    darkVars: {
      '--color-ink': '#ebf8ff',
      '--color-canvas': '#0F172A',
      '--color-surface': '#1E293B',
      '--color-primary': '#3182ce',
      '--color-primary-dark': '#2b6cb0',
      '--color-muted': '#94a3b8',
      '--color-border': '#ebf8ff',
      '--color-border-light': '#334155',
      '--shadow-brutal': '5px 5px 0px 0px #ebf8ff',
      '--shadow-brutal-sm': '3px 3px 0px 0px #ebf8ff',
      '--shadow-brutal-lg': '8px 8px 0px 0px #ebf8ff',
      '--font-heading': '"Anton", "Impact", sans-serif',
    }
  },
  'shinchan': {
    label: 'Shinchan',
    icon: '🖍️',
    vars: {
      '--color-ink': '#1c1917',
      '--color-canvas': '#FFFBEB',
      '--color-surface': '#FFFFFF',
      '--color-primary': '#FDE047',
      '--color-primary-dark': '#FACC15',
      '--color-muted': '#78716C',
      '--color-border': '#DC2626',
      '--color-border-light': '#FECACA',
      '--shadow-brutal': '6px 6px 0px 0px #DC2626',
      '--shadow-brutal-sm': '4px 4px 0px 0px #DC2626',
      '--shadow-brutal-lg': '10px 10px 0px 0px #DC2626',
      '--font-heading': '"Anton", "Impact", sans-serif',
    },
    darkVars: {
      '--color-ink': '#FFFBEB',
      '--color-canvas': '#1c1917',
      '--color-surface': '#292524',
      '--color-primary': '#FDE047',
      '--color-primary-dark': '#FACC15',
      '--color-muted': '#A8A29E',
      '--color-border': '#DC2626',
      '--color-border-light': '#7F1D1D',
      '--shadow-brutal': '6px 6px 0px 0px #DC2626',
      '--shadow-brutal-sm': '4px 4px 0px 0px #DC2626',
      '--shadow-brutal-lg': '10px 10px 0px 0px #DC2626',
      '--font-heading': '"Anton", "Impact", sans-serif',
    }
  },
  'princess': {
    label: 'Princess',
    icon: '👑',
    vars: {
      '--color-ink': '#3B0764',
      '--color-canvas': '#FDF4FF',
      '--color-surface': '#FFFFFF',
      '--color-primary': '#A21CAF',
      '--color-primary-dark': '#86198F',
      '--color-muted': '#9CA3AF',
      '--color-border': '#A21CAF',
      '--color-border-light': '#FDE68A',
      '--shadow-brutal': '6px 6px 0px 0px #A21CAF',
      '--shadow-brutal-sm': '4px 4px 0px 0px #A21CAF',
      '--shadow-brutal-lg': '10px 10px 0px 0px #A21CAF',
      '--font-heading': '"Anton", "Impact", sans-serif',
    },
    darkVars: {
      '--color-ink': '#FDF4FF',
      '--color-canvas': '#2e1022',
      '--color-surface': '#441935',
      '--color-primary': '#c026d3',
      '--color-primary-dark': '#a21caf',
      '--color-muted': '#e879f9',
      '--color-border': '#FDF4FF',
      '--color-border-light': '#831843',
      '--shadow-brutal': '6px 6px 0px 0px #FDF4FF',
      '--shadow-brutal-sm': '4px 4px 0px 0px #FDF4FF',
      '--shadow-brutal-lg': '10px 10px 0px 0px #FDF4FF',
      '--font-heading': '"Anton", "Impact", sans-serif',
    }
  },
  'anime': {
    label: 'Anime',
    icon: '⚔️',
    vars: {
      '--color-ink': '#0F172A',
      '--color-canvas': '#FFF7ED',
      '--color-surface': '#FFFFFF',
      '--color-primary': '#F97316',
      '--color-primary-dark': '#EA580C',
      '--color-muted': '#64748B',
      '--color-border': '#0F172A',
      '--color-border-light': '#E2E8F0',
      '--shadow-brutal': '6px 6px 0px 0px #0F172A',
      '--shadow-brutal-sm': '4px 4px 0px 0px #0F172A',
      '--shadow-brutal-lg': '10px 10px 0px 0px #0F172A',
      '--font-heading': '"Anton", "Impact", sans-serif',
    },
    darkVars: {
      '--color-ink': '#FFF7ED',
      '--color-canvas': '#0F172A',
      '--color-surface': '#1E293B',
      '--color-primary': '#F97316',
      '--color-primary-dark': '#EA580C',
      '--color-muted': '#94A3B8',
      '--color-border': '#F97316',
      '--color-border-light': '#334155',
      '--shadow-brutal': '6px 6px 0px 0px #F97316',
      '--shadow-brutal-sm': '4px 4px 0px 0px #F97316',
      '--shadow-brutal-lg': '10px 10px 0px 0px #F97316',
      '--font-heading': '"Anton", "Impact", sans-serif',
    }
  },
};

const THEME_KEYS = Object.keys(THEMES);
const STORAGE_KEY = 'flybeta-theme';
const DEFAULT_THEME = 'neo-brutalism';

// ── Context ─────────────────────────────────────────────────────────────

const ThemeContext = createContext(null);

function applyTheme(themeKey, isDark) {
  const theme = THEMES[themeKey];
  if (!theme) return;

  const root = document.documentElement;
  
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const varsToApply = isDark && theme.darkVars ? theme.darkVars : theme.vars;

  Object.entries(varsToApply).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
}

export function ThemeProvider({ children }) {
  const [themeKey, setThemeKey] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && THEMES[saved] ? saved : DEFAULT_THEME;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('flybeta_mode') === 'dark';
  });

  // Apply theme on mount and when it changes
  useEffect(() => {
    applyTheme(themeKey, isDarkMode);
    localStorage.setItem(STORAGE_KEY, themeKey);
    localStorage.setItem('flybeta_mode', isDarkMode ? 'dark' : 'light');
  }, [themeKey, isDarkMode]);

  const setTheme = useCallback((key) => {
    if (THEMES[key]) {
      setThemeKey(key);
    }
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeKey((prev) => {
      const idx = THEME_KEYS.indexOf(prev);
      return THEME_KEYS[(idx + 1) % THEME_KEYS.length];
    });
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{
      themeKey,
      theme: THEMES[themeKey],
      themes: THEMES,
      themeKeys: THEME_KEYS,
      setTheme,
      cycleTheme,
      isDarkMode,
      toggleDarkMode,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
