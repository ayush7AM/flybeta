# FlyBeta — Project Status & Handoff

> **Last updated:** 13 October 2026 · **Branch:** `master` (pushed to `github.com/ayush7AM/flybeta`) · **Backend tests:** 49 passing
>
> This is the single source of truth for picking the project up. `README.md`, `CONTEXT.md` and `WALKTHROUGH.md` are older and partly out of date — where they disagree with this file, trust this file.

---

## 1. TL;DR

FlyBeta is a gamified learning platform (AI & ML, Cloud Computing, Data Science) built with **Django REST Framework + React/Vite/Tailwind v4**.

| Area | Status |
|------|--------|
| Core learning loop (lessons → boss quiz → unlock → capstone → certificate) | ✅ Working and tested |
| Curriculum (3 tracks × 10 levels, 120 lessons, 27 boss quizzes) | ✅ Complete |
| Gamification (XP, coins, ranks, streaks + coin-paid restore, activity heatmap) | ✅ Working |
| Onboarding tutorial (multi-page guided tour) | ✅ Working |
| Mobile / responsive UI, dark mode, 5 themes | ✅ Working |
| AI features (Oracle, Labs, Synapse, capstone grading) | ⚠️ Code done, **needs `GEMINI_API_KEY`** — not tested end-to-end with a real key |
| Security hardening | ❌ Not production-ready — see [§11](#11-remaining-work-prioritised) |
| Deployment (Docker, CI, hosting) | ❌ Not started |

**If you only do one thing next:** work through [§11 → P0](#p0--must-fix-before-any-public-launch).

---

## 2. Quick Start (local development)

### Prerequisites
Python 3.12+ (3.14 tested), Node 20+ (24 tested), Git.

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate      macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                   # then fill in values (see below)
python manage.py migrate
python manage.py load_level_content    # loads/updates the curriculum from backend/content/
python manage.py create_dev_user       # optional: superuser "dev" / "flybeta123" — LOCAL ONLY
python manage.py runserver             # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env                   # optional (Sentry only)
npm run dev                            # http://localhost:5173  (proxies /api and /media to :8000)
```

### Claude Code / desktop app
`.claude/launch.json` defines two servers, `backend` and `frontend`, so both can be started from the app's preview tools.

### Environment variables

**`backend/.env`**

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | For AI features | Oracle, Blueprint Lab, Code Drishti, Synapse, capstone grading |
| `GITHUB_TOKEN` | Recommended | Raises GitHub API rate limits for capstone repo fetching |
| `DATABASE_URL` | Prod | e.g. Supabase Postgres. Defaults to `backend/db.sqlite3` |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (+ `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`) | For password reset | Gmail SMTP with an App Password by default |
| `TIME_ZONE` | No (default `Asia/Kolkata`) | Day boundary for streaks and the heatmap |
| `LOG_LEVEL` | No (default `INFO`) | Logging verbosity |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_TRACES_SAMPLE_RATE` | No | Error tracking — off unless the DSN is set |

**`frontend/.env`** — `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT` (optional; the Sentry SDK isn't even downloaded without a DSN).

### Run the tests
```bash
cd backend
python manage.py test api learn        # 49 tests
cd ../frontend
npm run build && npx oxlint            # build + lint (no frontend test suite yet)
```

---

## 3. Architecture

```
flybeta-master/
├── backend/                     Django 5.2 + DRF 3.18
│   ├── flybeta/                 settings, root urls (logging, Sentry, throttling configured in settings.py)
│   ├── accounts/                CustomUser, StudentProfile (XP, coins, rank, streaks, theme, avatar)
│   ├── learn/                   Domain → Level → Lesson, progress models, capstones, DailyActivity
│   │   ├── services/            github_service.py, ai_evaluator.py, activity.py
│   │   └── management/commands/ load_level_content.py
│   ├── api/                     all REST views/serializers/urls + ai_services.py (Gemini)
│   └── content/{ai,cloud,data}/level_NN.json   ← the curriculum (source of truth)
├── frontend/                    React 19 + Vite 8 + Tailwind v4 + react-router 7
│   └── src/
│       ├── pages/               one file per route (lazy-loaded)
│       ├── components/          layout/, landing/, interactive/, tour/, ui/, vision/, auth/
│       ├── context/             AuthContext (JWT + profile), ThemeContext (5 themes + dark mode)
│       ├── services/api.js      Axios instance with JWT injection + auto-refresh
│       └── monitoring.js        optional Sentry
├── design/stitch-reference/     original UI prototypes (reference only)
└── .claude/launch.json          dev servers for Claude Code
```

**Auth:** JWT (`djangorestframework-simplejwt`). Access + refresh tokens live in `localStorage` (`flybeta_access`, `flybeta_refresh`); `services/api.js` refreshes on 401.

**Data flow:** The frontend fetches a whole track with `GET /domains/<name>/` (cached in memory + `localStorage`, revalidated on every visit). The user profile from `GET /users/profile/` is the single source for XP, streak, progress and completed lessons; every mutating endpoint returns a fresh profile, which the UI writes into `AuthContext` via `updateUser()`.

---

## 4. How the Product Works (business rules)

### Progression
- Every track has **10 levels**. Level 1 is open; every other level is locked until the previous one is cleared.
- **Levels 1–9:** complete the lessons, then pass the **Boss Quiz** shown on the level's last lesson — 5 questions, **60% to pass**, graded **server-side** (answers are never sent to the browser). The first pass unlocks the next level and gives **+50 XP**.
- **Level 10:** the capstone. The learner submits a public GitHub repo to the AI evaluator; **score ≥ 60 passes**.
- Locks are enforced on the server too (completing a lesson or taking a quiz in a locked level returns 403).
- Guests can read Level 1 only (the freemium gate is frontend-only — see §10).
- After clearing a level the app returns to the **track roadmap** and scrolls to the newly unlocked level.

### Rewards
| Action | Reward |
|--------|--------|
| Lesson completed (first time) | Lesson's `xp_reward` + `coins_reward` (mostly 10–45 XP and 5–40 coins; the first Level 10 lesson gives 100 XP) |
| Boss quiz passed (first time) | +50 XP |
| Capstone passed (first time) | **+500 XP, +100 coins**, track marked complete, **certificate issued** |

**Ranks** (by total XP, `StudentProfile.RANK_LADDER`): Novice 0 → Apprentice 1,000 → Craftsman 3,000 → Specialist 6,000 → Expert 10,000 → Master 15,000 → Grandmaster 25,000 → Legend 40,000.

### Streaks
- Any lesson, quiz pass or capstone pass counts as activity for the day (`learn/services/activity.py → record_activity`).
- The streak shown is computed on read (`StudentProfile.current_streak`): a missed day reads as 0. `best_streak` is tracked.
- **Streak restore:** if a streak broke after missing **1–2 days**, within **7 days** of the last active day, the user can pay **50 coins per missed day** to bridge the gap. If they already started a new streak, the old and new ones are joined. Constants live on `StudentProfile` (`STREAK_RESTORE_*`). Offered on the Dashboard (card) and as a dismissible banner on other app pages.

### Activity heatmap
One `DailyActivity` row per user per active day (lessons, quizzes, capstones, XP). The Dashboard shows a GitHub-style year view. Activity before 13 Oct 2026 was never recorded, so older history is empty.

### Capstone & certificates
`POST /capstone/` fetches the repo (whole tree, skipping `node_modules`/venvs/lock files; max 40 files, 100 KB each, 200K chars total; notebooks reduced to cell sources), grades it with Gemini, and stores the result. GitHub/Gemini outages return 502 and are **not** recorded as a failing grade. Rate limit: **10 submissions/hour/user**. A pass creates a certificate (UUID) viewable publicly at `/certificate/<uuid>` — printable / save-as-PDF.

### Onboarding tour
On sign-up, a 20-step guided tour (driver.js) walks through Tracks → a roadmap → a lesson → Labs → Vision → Dashboard, explaining every feature and how to clear levels. Progress is kept in `localStorage` (`flybeta_tour_page`) so it survives navigation. Replay from the Dashboard header or the account menu. Steps live in `frontend/src/components/tour/tour.js`; elements are targeted by `id="tour-…"`.

---

## 5. API Reference (`/api/v1/`)

| Method & path | Auth | Purpose |
|---------------|------|---------|
| `POST auth/register/` · `POST auth/login/` · `POST auth/refresh/` | public | Sign up, JWT login, token refresh |
| `POST auth/password-reset/` · `POST auth/password-reset-confirm/` | public | Email reset flow |
| `GET domains/` | public | Track list — **lightweight** (no lesson bodies) |
| `GET domains/<name>/` | public | Full track: levels, lessons (Markdown), quiz questions without answers |
| `GET levels/` · `GET lessons/` | public | Raw listings |
| `POST lessons/<id>/complete/` | user | Complete a lesson → XP/coins, streak, level completion |
| `POST levels/<id>/pass_quiz/` | user | Body `{"answers": [i, …]}` → server grades; returns `passed, score, total, level_unlocked, user` |
| `GET users/profile/` · `PATCH users/profile/` | user | Full profile (incl. `domain_progress`, `completed_lesson_ids`, `streak_restore`); edit name/bio/avatar/theme |
| `GET users/me/` | user | Legacy stats endpoint |
| `GET users/activity/?days=N` | user | Heatmap data + streak stats |
| `POST users/streak/restore/` | user | Pay coins to restore a broken streak |
| `GET/POST capstone/` · `GET capstone/<id>/` | user | Own submissions only; immutable; POST is throttled |
| `GET certificates/<uuid>/` | public | Certificate verification |
| `POST ai/oracle/` · `ai/architect/` · `ai/reviewer/` · `ai/synapse/` | **public ⚠️** | Gemini-powered tools — see P0 |

---

## 6. Frontend Map

| Route | Page | Notes |
|-------|------|-------|
| `/` | LandingPage | Own sticky navbar; not inside the app Layout |
| `/tracks` | TrackSelectionPage | |
| `/track/:name` | TrackRoadmapPage | Level cards with ✓ completion ticks; accepts `location.state.focusLevel` |
| `/track/:name/level/:num/lesson/:order` | LessonRunnerPage | Markdown lessons, boss quiz on the last lesson, capstone on Level 10 |
| `/labs/architect`, `/labs/reviewer` | Blueprint Lab, Code Drishti | AI tools |
| `/vision`, `/vision/video/:id` | Vision | **Channel feed is mock data** (`data/mockVideos.js`) |
| `/dashboard` | DashboardPage | Profile tiles, streak restore, rank progress, heatmap, track progress, themes |
| `/certificate/:id` | CertificatePage | Public, printable |
| `/reset-password/:uid/:token` | ResetPasswordConfirmPage | |

Key shared pieces: `components/layout/Navbar.jsx` (streak button, display menu, account menu, mobile ☰ menu below 1024 px), `Layout.jsx` (app shell, Oracle, tour, streak banner), `ErrorBoundary.jsx`, `ScrollToTop.jsx`, `ActivityHeatmap.jsx`, `StreakRestoreCard.jsx`, `auth/AuthModal.jsx` (rendered through a portal).

**Theming:** 5 themes (`ThemeContext.jsx`) × light/dark, via CSS variables such as `--color-ink`, `--color-surface`, `--color-primary`. Prefer these tokens over hard-coded colours.

---

## 7. Curriculum & Content Pipeline

- Source of truth: `backend/content/<track>/level_NN.json` (`domain`, `level` incl. `quiz_data`, `lessons`).
- Load or update with `python manage.py load_level_content` (`--dry-run` to preview, `--domain cloud` for one track).
  - Rows are **updated in place** (matched by track slug, level number, lesson order), so user progress survives reloads.
  - Lessons/levels removed from the files are deleted; a missing track folder is **unpublished**, not deleted.
  - All-or-nothing: if any file fails, nothing is written. An empty content folder is refused.
- Lessons support Markdown plus `<flipcard front="…" back="…"></flipcard>`.
- **Current content:** every level has 3 mandatory lessons + 1 bonus (Level 1 has 4 + 1; Level 10 has 3 capstone lessons). Levels 1–9 each have a 5-question boss quiz. Level 10's `quiz_data` exists but is unused (the capstone replaces it).
- Keep the `domain` block **identical across all 10 files of a track** — the loader applies whichever file it reads last.

---

## 8. Work Completed (Oct 2026 session)

Everything below is merged into `master`.

**Fixes to the core loop**
- Lesson completion unlocks the next level; quiz unlock sent no auth token (fixed); quizzes graded server-side; answers hidden from the API; locks enforced server-side; data migration repaired stuck users.
- Content loader no longer wipes all user progress on reload; Windows encoding crash fixed.
- Capstone: auth fixed; switched from retired `gemini-pro`/deprecated SDK to `google-genai`; IDOR fixed (users see only their own submissions); final-level gate; rate limit; XSS-safe rendering of AI feedback; whole-repo fetching with limits; outages ≠ failing grade.

**New features**
- Capstone reward (+500 XP, +100 coins), track completion, public printable certificates.
- Streak fix (missed day = 0), best streak, coin-paid streak restore.
- Server-backed activity heatmap.
- Signup onboarding tour (modelled on the flybeta-sih project's TourGuide).
- Completion ticks on the roadmap; return to roadmap after clearing a level; scroll-to-top on navigation.

**Content**
- 21 new boss quizzes (Levels 1–7) + rewritten quizzes for Levels 8–10 (Data 8/9 were swapped).
- 22 new lessons for Levels 8–10; Cloud Level 8 changed from a duplicate "Serverless" to **CI/CD & Observability**.
- Track icons/colours normalised to AI = robot/purple, Data = chart/green.

**UI / UX**
- Full mobile pass; reorganised app navbar (streak button, display + account menus); landing page decluttered (sticky navbar, clearer hero and sections); dashboard cards redesigned; dark-mode contrast fixes (boss quiz, restore card).

**Platform**
- Logging configuration, optional Sentry (backend + frontend), React error boundary.
- Performance: track list ~287 KB → 19 KB; route-level code splitting (first load 741 KB → ~337 KB); logo 655 KB → 3 KB.
- Backend tests: 0 → 49.

---

## 9. Local Data Notes

- `backend/db.sqlite3` is local only (git-ignored).
- **`dev`** (from `create_dev_user`) has test progress, including a **capstone pass inserted directly into the DB** for Cloud (certificate `3d09adee-…`) — fake data for UI testing.
- **`test`** was created by the project owner for manual testing.
- To start clean: delete `db.sqlite3`, then `migrate` + `load_level_content`.

---

## 10. Gotchas (read before changing things)

1. **CSS cascade:** custom classes in `frontend/src/index.css` (`.brutalist-badge`, `.brutalist-btn`, `.brutalist-card`, `.label-mono`, `.heading-*` …) are *not* in a Tailwind layer, so they **override** Tailwind utilities on the same element (e.g. `hidden md:flex` on a `.brutalist-badge` won't hide it; `bg-…` on `.brutalist-card` is ignored). Put responsive classes on a wrapper element or use inline styles. Moving these classes into `@layer components` would fix it globally but changes the desktop look in ~15 places — do it as a deliberate refactor.
2. **Modals/overlays** must render via a portal (`createPortal(..., document.body)`), as `AuthModal` does: any ancestor with `transform`, `filter` or `backdrop-filter` (cards on hover, the landing navbar) traps `position: fixed`.
3. **Dark mode:** `--color-ink` turns light in dark mode. Never pair `text-ink` with a fixed light background (`bg-gold-light`, `bg-green-400`, …) — use a fixed dark colour there.
4. **Lessons are identified by `(level, order)`.** Reordering lessons in JSON moves users' completion records with the position.
5. **Windows + Vite:** the dev server's watcher occasionally misses rapid consecutive edits. If a change doesn't appear, `touch` the file or restart `npm run dev`.
6. **Freemium gate is UI-only:** lesson content for all levels is readable via the public API.
7. **Tests:** `force_authenticate(user)` reuses the same user object, whose `profile` is cached — re-fetch the user after `.update()` calls (see `StreakAndActivityTests.set_streak`).
8. **Rate limits** use the default in-memory cache (per process). Production needs a shared cache (Redis).

---

## 11. Remaining Work (prioritised)

### P0 — must fix before any public launch
| # | Task | Where |
|---|------|-------|
| 1 | **Rotate the Django secret key** — the current one is hard-coded **and public on GitHub**. Load it from env. | `backend/flybeta/settings.py:28` |
| 2 | Stop tracking uploaded avatars: add `backend/media/` to `.gitignore` and `git rm --cached` them (4 personal images are on GitHub; removing them from history needs a rewrite + force-push). | `.gitignore` |
| 3 | AI endpoints are public with no rate limit → require auth + per-user throttles (copy the capstone's `ScopedRateThrottle` pattern). | `api/views.py` — Blueprint/CodeReview/Synapse/Oracle views |
| 4 | Production settings from env: `DEBUG`, `ALLOWED_HOSTS`, CORS allow-list, `SECURE_*` / HTTPS cookies (`manage.py check --deploy` lists them). | `settings.py` |
| 5 | Avatar upload accepts any file (an `.html` upload was served back) → validate image type and size. | `api/views.py → UserProfileView.patch` |
| 6 | Password reset: link hard-coded to `localhost:5173`; reveals whether an email exists; signup/reset skip Django password validators. | `accounts/serializers.py` |
| 7 | Logout doesn't revoke tokens: add `rest_framework_simplejwt.token_blacklist` + a logout endpoint; consider shorter refresh lifetime. | `settings.py`, `accounts/` |
| 8 | Name > 150 chars on profile PATCH → 500. Never run `create_dev_user` in prod; restrict `/admin/` and the DRF browsable-API login. | `api/views.py`, `flybeta/urls.py` |

### P1 — deployment
| # | Task |
|---|------|
| 9 | CI (GitHub Actions): `manage.py test`, `check --deploy`, `npm run build`, `oxlint`. |
| 10 | Production server setup: gunicorn, `STATIC_ROOT` + whitenoise (or CDN), Dockerfile/Procfile, a complete `.env.example`. |
| 11 | Media storage on S3 / Supabase Storage instead of local disk. |
| 12 | API base URL: the frontend calls relative `/api/v1/` (works only via the Vite proxy or a same-origin reverse proxy) — add `VITE_API_URL` or deploy behind one domain. |
| 13 | Redis for rate limiting; set `SENTRY_DSN`/`VITE_SENTRY_DSN`; configure SMTP. |
| 14 | Set `GEMINI_API_KEY` and **verify the model name `gemini-3.6-flash`** (used in `api/ai_services.py` and `learn/services/ai_evaluator.py`), then test Oracle, Labs, Synapse and a real capstone end-to-end. |

### P2 — product & quality
| # | Task |
|---|------|
| 15 | Run capstone grading as a background job (currently synchronous, 5–30 s inside the request). |
| 16 | Vision channel feed is mock data; at least one video is unavailable. |
| 17 | Frontend tests (none) — at least an end-to-end test of signup → tour → clear a level. |
| 18 | CSS layering refactor (Gotcha #1). |
| 19 | Update `README.md`, `CONTEXT.md` and `WALKTHROUGH.md` (outdated claims, e.g. "logout blacklist"). |
| 20 | Accessibility audit (contrast across 5 themes × dark mode, keyboard navigation). |
| 21 | Small cleanups: wrong track keys in `LessonRunnerPage` `TRACK_META` (`data-science`, `ai-ml` → `data`, `ai`); unused `themeKey` in `TrackRoadmapPage`; remaining lint warnings. |
| 22 | Ideas: completion ticks in the lesson sidebar, leaderboard, email verification, tour progress per account (currently per browser). |

---

## 12. Conventions

- **Backend:** business rules live on models (`StudentProfile` streak/rank helpers) or in `learn/services/`; views stay thin. Every state-changing endpoint returns the full `UserProfileSerializer` payload as `user` so the UI can refresh in one step. Add a test for every rule change (`api/tests.py`, `learn/tests.py`).
- **Frontend:** match the existing neo-brutalist style (thick `border-ink`, hard offset shadows, uppercase `label-mono`/`heading-*`). Use theme tokens (`bg-surface`, `text-ink`, `var(--color-primary)`) so all 5 themes and dark mode work. Check every UI change at 375 px and 1280 px, in light and dark mode.
- **Content:** edit the JSON, run `load_level_content --dry-run`, then load. Keep 5 questions per quiz, 4 options each, and vary the correct-answer position.
- **Git:** prefer `type(scope): summary` commit messages (used in most of the history); keep `master` green — run the tests before pushing.
