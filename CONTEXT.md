# FLYBETA — Project Context

## Overview
FlyBeta is a gamified, level-based learning platform for Data Science, AI, and Cloud Computing.
Decoupled architecture: Django DRF backend + React/Vite frontend (Tailwind CSS v4).

## Current Phase
**Phase 11 — Complete**: User Dashboard (Profile API, Rank Progression, Theme Persistence).

### What's Done
- Django project scaffold (`flybeta` config) in `/backend`
- 3 Django apps: `accounts`, `learn`, `api`
- All models: `UserProfile`, `Domain`, `Level`, `Lesson` (+ `illustration_url`), `DomainProgress`, `LevelProgress`
- UserProfile auto-creation via post_save signal
- Admin registrations with filters, inlines, and search
- SQLite database created and migrated
- DRF read-only API at `/api/v1/` (domains, levels, lessons)
- Content pipeline: `python manage.py load_level_content` (JSON → DB, supports `illustration_url`)
- **Full curriculum**: 3 tracks × 10 levels = 30 JSON content files loaded into DB
- React + Vite + Tailwind v4 frontend in `/frontend`
- Design system: All DESIGN.md tokens mapped to CSS custom properties
- 3 pages: Track Selection, Track Roadmap, Lesson Runner
- 5 components: Navbar, Layout, TrackCard, LevelNode, MarkdownRenderer
- **Interactive components**: `FlipCard` (3D Neo-Brutalist flip card, click-to-flip)
- **MarkdownRenderer upgrade**: `rehype-raw` plugin for custom HTML tag parsing (`<flipcard>` → `<FlipCard/>`)
- API service layer with Axios + Vite proxy
- Stitch prototypes preserved at `/design/stitch-reference/`
- Mock auth with dev user (`python manage.py create_dev_user`)
- `GET /api/v1/users/me/` — user gamification stats endpoint
- `POST /api/v1/lessons/{id}/complete/` — XP/coins award, streak logic, level completion
- `UserContext` — live gamification state in Navbar, reward flash on lesson complete
- `ThemeContext` — 5 themes with CSS variable swapping, localStorage persistence
- **Phase 4a**: Project Architect (Blueprint Lab) UI & mock endpoint (`POST /api/v1/ai/architect/`)
- **Phase 4b**: Code Reviewer (Code Drishti) UI & mock endpoint (`POST /api/v1/ai/reviewer/`)
- **Phase 4c**: Full curriculum expansion (Levels 1–7 for all 3 tracks)
- **Phase 4d**: Multi-theme system (5 themes with character images, backgrounds, overlays)
- **Phase 5**: Vision Suite UI Scaffold (Oracle Widget, Channel Feed, Synapse Engine, Video Detail 60/40 Split)
- **Phase 6**: Real AI API integration (Gemini 2.5 Flash for Oracle, Synapse, Architect, Code Review)
- **Phase 7 (Completed)**: Beginner Curriculum Upgrade 
  - Complete rewrite of 30 levels across all 3 tracks with strong metaphors.
  - Interactive `<FlipCard/>` components embedded in all lessons.
  - `LevelBossQuiz` gatekeeper (60% pass rate) implemented for all 30 levels.
  - Track Roadmap UI updated to enforce level locking based on user progress.
  - `pass_quiz` API endpoint added to unlock levels and award XP.
- **Phase 8 (Completed)**: The AI Evaluator (Level 10 Capstone)
  - Created `CapstoneSubmission` model and `CapstoneSubmissionViewSet` API.
  - Built GitHub service (`github_service.py`) to fetch repository contents via authenticated Github API.
  - Integrated Google Gemini API (`ai_evaluator.py`) using `gemini-pro` for automated code evaluation.
  - Developed `<CapstoneEvaluator/>` Neo-Brutalist frontend component with rich Markdown rendering and success/fail states.
  - Conditionally injected Capstone UI into `LessonRunnerPage` for Level 10.

- **Phase 7 (Completed)**: Production DB & Curriculum Expansion
  - Migrated to Supabase PostgreSQL (Mumbai) on port 443.
  - Recovered rich lesson content JSONs from git history (commit `ef902a2`).
  - Updated `load_level_content.py` to wipe data before seeding.
  - Successfully seeded 3 Domains, 30 Levels, and 98 Lessons.
- **Phase 8 (Completed)**: AI Services Restoration
  - Fixed `403 Forbidden` errors on AI endpoints with `@authentication_classes([])`.
  - Upgraded Oracle, Architect, and Code Review services to `gemini-3.6-flash`.
  - Added traceback logging for resilient error handling.
- **Phase 9 (Completed)**: WebP Asset Optimization
  - Converted 24 heavy PNG/JPEG theme assets (56.5MB) to WebP (4.9MB) via Pillow batch script (91% savings).
  - Fixed EXIF orientation issues in the Anime theme background via `exif_transpose`.
  - Updated `Layout.jsx` and `TrackCard.jsx` to reference `.webp`.
- **Phase 10 (Completed)**: JWT Authentication, Email Delivery & Freemium Gating
  - Custom `CustomUser` model (replaces default User) with `name`, `username` (unique), `email` (unique).
  - `StudentProfile` (1:1 with `CustomUser`) merges gamification fields: `xp`, `coins`, `streak`, `last_active_date`, `total_xp`, `current_rank`, `theme_preference`.
  - `post_save` signal auto-creates `StudentProfile` on every new user registration.
  - JWT via `djangorestframework-simplejwt`: Register, Login (token pair), Refresh, Logout (blacklist), `/users/me/`.
  - Password Reset flow: request (async SMTP thread) + confirm (UID/token validation).
  - SMTP configured via environment variables; email dispatched in a `threading.Thread(daemon=True)` for zero-latency API responses.
  - Frontend `AuthContext` replaces old `UserContext` — manages access/refresh JWTs in `localStorage`, decodes user state, and emits `flybeta:logout` on refresh failure.
  - `api.js` Axios interceptors: inject `Bearer` token on every request; auto-refresh on `401` and retry the original request.
  - `AuthModal.jsx`: Register / Login / Forgot Password in a single modal with `customMessage` and `initialView` props for programmatic triggers.
  - `ResetPasswordConfirmPage.jsx`: Standalone route at `/reset-password/:uid/:token` for password confirmation.
  - Freemium gating: Level 1 free for guests; Level 2+ and Capstone evaluator intercept unauthenticated access and pop the `AuthModal`.
  - Both Navbars (`Navbar`, `LandingNavbar`) are auth-aware, rendering real user stats when logged in.
- **Phase 11 (Completed)**: User Dashboard + Profile Editing
  - `RANK_LADDER` constant on `StudentProfile` — 8-tier XP-based ranking (Novice 0 → Legend 40,000).
  - `compute_rank()`, `next_rank`, `xp_to_next_rank`, `rank_progress_pct` model helpers.
  - `VALID_THEMES` set on `StudentProfile` — server-side theme validation.
  - `avatar` (ImageField) and `bio` (TextField, 160 char) fields on `StudentProfile`.
  - `UserProfileSerializer` — full dashboard payload with identity, gamification, rank progress, avatar, bio, and theme.
  - `UserProfileView` (GET + PATCH) at `/api/v1/users/profile/` — supports multipart file uploads for avatar; accepts name, bio, avatar, theme_preference (all optional).
  - `DashboardPage.jsx` — Hero identity card (with avatar), XP/rank progress bar, track progress bars, theme selector grid, and bio display.
  - `EditProfileModal.jsx` — Neo-Brutalist modal for editing name, bio, and uploading avatar with image preview.
  - Auth-only "Dashboard" nav link in `Navbar.jsx`.
  - Theme selector syncs `ThemeContext` (instant) + backend persistence (async PATCH).
  - Username and display name casing fix — inline `textTransform: 'none'` overrides on `heading-lg` and `label-mono`.
  - `MEDIA_URL` / `MEDIA_ROOT` configured in `settings.py`; `/media` served in development; Vite proxies `/media` to Django.
  - **Phase 11c**: XP State Sync — squashed `get_dev_user` in DRF views, enforced `IsAuthenticated`, fixed `total_xp` math, unified `AuthContext` to fetch from `/users/profile/` (rich payload), and removed redundant local state in `DashboardPage.jsx` so Navbar and Dashboard sync instantly.

### What's Next
- **Phase 12**: TBD


## Curriculum
| Track | Levels | Lessons | Content Directory |
|-------|--------|---------|-------------------|
| Cloud Computing | 10 (Foundations → Capstone) | ~40 | `backend/content/cloud/` |
| AI & Machine Learning | 10 (Foundations → Capstone) | ~40 | `backend/content/ai/` |
| Data Science | 10 (Foundations → Capstone) | ~40 | `backend/content/data/` |

## Theme System
5 registered themes in `ThemeContext.jsx`, switchable via navbar dropdown:

| Theme | Key | Primary | Borders/Shadows | Character Images | Background |
|-------|-----|---------|-----------------|------------------|------------|
| 🏗️ Neo-Brutalism | `neo-brutalism` | Crimson `#E52E2E` | Black `#111111` | Lucide icons | Grid pattern |
| 🤖 Doraemon Blue | `doraemon-blue` | Blue `#3182ce` | Blue `#2b6cb0` | Doraemon, Shizuka, Nobita | `doremon_flybeta.webp` |
| 🖍️ Shinchan | `shinchan` | Yellow `#FDE047` | Red `#DC2626` | Shinchan, Bo-chan, Meni | `shinchan-theme-bg.webp` |
| 👑 Princess | `princess` | Magenta `#A21CAF` | Purple `#A21CAF` | Rapunzel, Mulan, Belle | `bg-theme.webp` |
| ⚔️ Anime | `anime` | Orange `#F97316` | Ink Black `#0F172A` | Zoro, Luffy, Nami | `anime-theme.webp` |

**Architecture:**
- `THEME_IMAGES` map in `TrackCard.jsx` — per-theme domain→character mapping
- `THEME_BACKGROUNDS` map in `Layout.jsx` — per-theme background image paths
- 80% opacity cream overlay (`#F9F8F6`) for all themed backgrounds (readability)
- Content sits at `z-10` above the fixed background overlay
- Neo-Brutalism (default) uses no background image — just the `grid-bg` pattern

## Frontend
Located at `/frontend/`. React + Vite + Tailwind v4.
Design reference prototypes at `/design/stitch-reference/`.

## Design System
Neo-Brutalism / Retro-Tech / Blueprint aesthetic.
See `DESIGN.md` for full design tokens (colors, typography, elevation, micro-interactions).

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Django 5.2 + DRF 3.18 + PostgreSQL (Supabase) |
| Auth | `djangorestframework-simplejwt` — `CustomUser` + `StudentProfile` |
| Email | Django SMTP backend (Gmail App Passwords) + `threading.Thread` async dispatch |
| Frontend | React (Vite) + Tailwind CSS v4 |
| Communication | JSON over REST API (proxied in dev via Vite) |
| State | `AuthContext` (JWT + user identity), `ThemeContext` (CSS var swapping) |

## How to Run

### Backend
```bash
cd backend && source venv/bin/activate
python manage.py runserver    # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm run dev                   # http://localhost:5173
```

Both must run simultaneously. Vite proxies `/api` → Django backend.

## Key Asset Directories
```
frontend/public/
├── doremon-theme/        # Doraemon character WebPs + background
├── shinchan-theme/       # Shinchan character WebPs + background
├── disney-princess-thene/ # Princess character WebPs + background
└── anime-theme/          # Anime character WebPs + background
```

