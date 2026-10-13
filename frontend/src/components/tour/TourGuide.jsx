import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '../../context/AuthContext';
import {
  TOUR_PAGES, TOTAL_STEPS, getStepOffset, getTourPageIndex, setTourPageIndex, endTour, onTourStart,
  markResumeAtEnd, consumeResumeAtEnd,
} from './tour';

const ELEMENT_WAIT_MS = 4000;
const POLL_MS = 150;

const resolveElement = (element) => (typeof element === 'function' ? element() : document.querySelector(element));

/**
 * TourGuide — multi-page onboarding tour with global step numbering.
 *
 * Renders nothing; drives driver.js popovers for the current tour page and
 * hands off to the next page when that page's steps are done.
 */
export default function TourGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const driverRef = useRef(null);
  const [runId, setRunId] = useState(0);

  // Restart when the tour is (re)started while already on its first page
  useEffect(() => onTourStart(() => setRunId((id) => id + 1)), []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const currentPageIndex = getTourPageIndex();
    if (currentPageIndex === null) return;

    const tourPage = TOUR_PAGES[currentPageIndex];
    if (!tourPage) {
      endTour();
      return;
    }

    if (location.pathname !== tourPage.path) {
      // On a different tour page (out of order) — bring them to the right one.
      // Anywhere else, let them explore; the tour resumes when they come back.
      if (TOUR_PAGES.some((page) => page.path === location.pathname)) {
        navigate(tourPage.path);
      }
      return;
    }

    const stepOffset = getStepOffset(currentPageIndex);
    const isLastPage = currentPageIndex >= TOUR_PAGES.length - 1;
    let cancelled = false;
    let timer;

    const startDriver = () => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: '#111111',
        overlayOpacity: 0.75,
        stagePadding: 8,
        stageRadius: 0,
        popoverClass: 'flybeta-tour-popover',
        allowClose: false,               // Skip Tutorial is the only way out
        showButtons: ['next', 'previous'],
        disableActiveInteraction: true,  // highlighted UI is for looking, not clicking
        steps: tourPage.steps.map((step) => (
          step.element ? { ...step, element: resolveElement(step.element) || undefined } : step
        )),

        onPopoverRender: (popover, { state }) => {
          // ── Progress across the whole tour, not just this page ──
          const progressEl = popover.progress;
          if (progressEl) {
            progressEl.textContent = `${stepOffset + state.activeIndex + 1} OF ${TOTAL_STEPS}`;
          }

          // ── Button text ──
          const isLastStepOnPage = state.activeIndex === tourPage.steps.length - 1;
          if (popover.nextButton) {
            if (isLastPage && isLastStepOnPage) {
              popover.nextButton.textContent = 'Finish Tour 🚀';
            } else if (isLastStepOnPage) {
              popover.nextButton.textContent = 'Next Page →';
            } else {
              popover.nextButton.textContent = 'Next →';
            }
          }
          if (popover.previousButton) {
            popover.previousButton.textContent = '← Back';
            // driver.js disables Back on a page's first step; we can still go to the previous page
            if (state.activeIndex === 0 && currentPageIndex > 0) {
              popover.previousButton.disabled = false;
              popover.previousButton.classList.remove('driver-popover-btn-disabled');
            }
          }

          // ── Skip Tutorial link ──
          const footer = popover.footerButtons;
          if (footer && !footer.querySelector('.tour-skip-btn')) {
            const skipBtn = document.createElement('button');
            skipBtn.className = 'tour-skip-btn';
            skipBtn.textContent = 'Skip Tutorial';
            skipBtn.addEventListener('click', () => {
              endTour();
              driverObj.destroy();
            });
            footer.appendChild(skipBtn);
          }
        },

        onPrevClick: () => {
          // First step of a page → back to the previous page's tour
          if (driverObj.getActiveIndex() === 0 && currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            setTourPageIndex(prevIndex);
            markResumeAtEnd();
            driverObj.destroy();
            navigate(TOUR_PAGES[prevIndex].path);
          } else {
            driverObj.movePrevious();
          }
        },

        onDestroyStarted: () => {
          if (driverObj.isLastStep()) {
            const nextIndex = currentPageIndex + 1;
            if (nextIndex < TOUR_PAGES.length) {
              setTourPageIndex(nextIndex);
              driverObj.destroy();
              navigate(TOUR_PAGES[nextIndex].path);
            } else {
              endTour();
              driverObj.destroy();
            }
          } else {
            // Early dismiss — still mark complete
            endTour();
            driverObj.destroy();
          }
        },
      });

      driverRef.current = driverObj;
      driverObj.drive(consumeResumeAtEnd() ? tourPage.steps.length - 1 : 0);
    };

    // Pages load their data async — wait (briefly) for this page's targets to render
    const startedAt = Date.now();
    const waitForTargets = () => {
      if (cancelled) return;
      const ready = tourPage.steps.every((step) => !step.element || resolveElement(step.element));
      if (ready || Date.now() - startedAt > ELEMENT_WAIT_MS) {
        startDriver();
      } else {
        timer = setTimeout(waitForTargets, POLL_MS);
      }
    };
    timer = setTimeout(waitForTargets, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (driverRef.current) {
        try { driverRef.current.destroy(); } catch { /* already gone */ }
        driverRef.current = null;
      }
    };
  }, [location.pathname, isLoggedIn, runId, navigate]);

  return null;
}
