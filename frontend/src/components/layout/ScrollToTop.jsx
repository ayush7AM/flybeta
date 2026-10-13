import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Start every new page (next lesson, next level, any link) at the top.
 * Browser Back/Forward (POP) is left alone so the user returns to where they were.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, navigationType]);

  return null;
}
