import { useNavigate } from 'react-router-dom';

/**
 * Onboarding tour — steps and progress storage.
 *
 * The tour walks a new user across pages. Progress is the index of the
 * current page in TOUR_PAGES, kept in localStorage so it survives navigation
 * and reloads. No stored index = no tour running.
 */

const STORAGE_KEY = 'flybeta_tour_page';
const RESUME_AT_END_KEY = 'flybeta_tour_resume_at_end';
const START_EVENT = 'flybeta:tour-start';

// Prefer whichever target is actually on screen (e.g. nav links on desktop,
// the ☰ button on phones). Returns undefined to fall back to a centered popover.
const firstVisible = (...selectors) => () => selectors
  .map((selector) => document.querySelector(selector))
  .find((el) => el && el.getBoundingClientRect().width > 0) || undefined;

export const TOUR_PAGES = [
  {
    path: '/tracks',
    steps: [
      {
        popover: {
          title: '🚀 Welcome to FlyBeta!',
          description: "Let's take a quick tour of everything you can do here. You can skip anytime and replay it later from your Dashboard.",
        },
      },
      {
        element: firstVisible('#tour-nav-links', '#tour-menu-button'),
        popover: {
          title: '🧭 Getting Around',
          description: '<b>Tracks</b> for structured learning, <b>Labs</b> for AI project tools, <b>Vision</b> for video learning, and your <b>Dashboard</b>. On phones, they all live behind the ☰ menu.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-xp',
        popover: {
          title: '🔥 Streaks, Coins & XP',
          description: 'Learn on consecutive days to grow your 🔥 streak — miss a day and you can restore it with coins. Lessons and boss quizzes also earn XP and coins; XP raises your rank, from Novice all the way to Legend.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-customize',
        popover: {
          title: '🎨 Make It Yours',
          description: 'Toggle dark mode and pick from 5 themes, from Neo-Brutalism to Anime.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-tracks',
        popover: {
          title: '📚 Pick a Track',
          description: 'AI &amp; ML, Cloud Computing and Data Science — all open from day one, each with 10 levels from beginner to capstone. Let\'s look inside one.',
          side: 'top',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/track/ai',
    steps: [
      {
        element: '#tour-first-level',
        popover: {
          title: '🗺️ The Roadmap',
          description: 'Every track is a ladder of 10 levels. Level 1 is open; the rest stay 🔒 locked until you clear the level before them.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-first-level-lessons',
        popover: {
          title: '📖 Lessons',
          description: '<b>Mandatory</b> lessons count toward clearing the level; <b>Bonus</b> lessons are extra XP. Finished lessons get a green ✓, and the level badge turns green once the level is cleared.',
          side: 'top',
          align: 'start',
        },
      },
      {
        popover: {
          title: '🏆 How to Clear a Level',
          description: '<b>Levels 1–9:</b> work through the lessons, then beat the <b>Boss Quiz</b> on the last one — 60% to pass, +50 XP. Failed? Just retry.<br><b>Level 10:</b> the capstone — push a project to GitHub; scoring 60+ from the AI evaluator completes the track, with +500 XP and a certificate 🎓.<br><br>Clearing a level sends you back to your roadmap with the next level unlocked.',
        },
      },
    ],
  },
  {
    path: '/track/ai/level/1/lesson/1',
    steps: [
      {
        element: '#tour-lesson-list',
        popover: {
          title: '📋 Lesson List',
          description: 'Jump between the lessons of this level. On phones, tap the counter to open the list.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-lesson-content',
        popover: {
          title: '🧠 Learn by Doing',
          description: 'Lessons mix short explanations, code snippets and flip cards — tap a card to reveal the answer.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-complete-btn',
        popover: {
          title: '✅ Complete & Continue',
          description: 'Done reading? Hit this to bank the lesson\'s XP and coins and move to the next one. On a level\'s last lesson it becomes <b>Complete Level</b> — and on boss levels, the Boss Quiz appears here instead.',
          side: 'top',
          align: 'end',
        },
      },
    ],
  },
  {
    path: '/labs/architect',
    steps: [
      {
        element: '#tour-labs-nav',
        popover: {
          title: '🧪 AI Labs',
          description: 'Two AI tools for builders: <b>Blueprint Lab</b> and <b>Code Drishti</b>.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-blueprint',
        popover: {
          title: '⚙️ Blueprint Lab',
          description: 'Describe a project idea and get a step-by-step build plan with tasks and time estimates. <b>Code Drishti</b>, the next tab, reviews code you paste and ranks issues by severity.',
          side: 'top',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/vision',
    steps: [
      {
        element: '#tour-vision-tabs',
        popover: {
          title: '🎬 Vision',
          description: '<b>Channels</b> is a curated feed of the best videos for each track. <b>Synapse</b> turns any YouTube link into a quick AI-generated quiz, so you can check what you learned.',
          side: 'bottom',
          align: 'start',
        },
      },
    ],
  },
  {
    path: '/dashboard',
    steps: [
      {
        element: '#tour-identity',
        popover: {
          title: '🪪 Your Profile',
          description: 'Your name, avatar, bio and stats. Tap <b>Edit</b> to personalise it.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-heatmap',
        popover: {
          title: '📅 Activity Heatmap',
          description: 'Every square is a day. Lessons, boss quizzes and capstones light it up — keep the squares coming to grow your 🔥 streak.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-rank',
        popover: {
          title: '📈 Rank Progression',
          description: 'How much XP you need to reach the next rank.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-track-progress',
        popover: {
          title: '🛤️ Track Progress',
          description: 'How far you\'ve climbed in each track.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-oracle',
        popover: {
          title: '🔮 The Oracle',
          description: 'Stuck on a concept? Your AI mentor is one tap away on every page.',
          side: 'left',
          align: 'end',
        },
      },
      {
        popover: {
          title: '🎉 You\'re Ready!',
          description: 'Head to <b>Tracks</b> and clear your first level. You can replay this tour anytime from your Dashboard.',
        },
      },
    ],
  },
];

export const TOTAL_STEPS = TOUR_PAGES.reduce((sum, page) => sum + page.steps.length, 0);

export function getStepOffset(pageIndex) {
  return TOUR_PAGES.slice(0, pageIndex).reduce((sum, page) => sum + page.steps.length, 0);
}

// ── Progress storage ────────────────────────────────────────────────────

export function getTourPageIndex() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === null ? null : parseInt(value, 10);
  } catch {
    return null;
  }
}

export function setTourPageIndex(index) {
  try {
    localStorage.setItem(STORAGE_KEY, String(index));
  } catch { /* storage unavailable — the tour just won't persist */ }
}

export function endTour() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(RESUME_AT_END_KEY);
  } catch { /* nothing to clear */ }
}

/** Going Back from a page's first step resumes the previous page at its last step. */
export function markResumeAtEnd() {
  try {
    sessionStorage.setItem(RESUME_AT_END_KEY, '1');
  } catch { /* falls back to the page's first step */ }
}

export function consumeResumeAtEnd() {
  try {
    const value = sessionStorage.getItem(RESUME_AT_END_KEY) === '1';
    sessionStorage.removeItem(RESUME_AT_END_KEY);
    return value;
  } catch {
    return false;
  }
}

export function onTourStart(handler) {
  window.addEventListener(START_EVENT, handler);
  return () => window.removeEventListener(START_EVENT, handler);
}

/** Returns a function that (re)starts the tour from its first page. */
export function useStartTour() {
  const navigate = useNavigate();
  return () => {
    setTourPageIndex(0);
    window.dispatchEvent(new Event(START_EVENT));
    navigate(TOUR_PAGES[0].path);
  };
}
