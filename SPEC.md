# FLYBETA — SYSTEM ARCHITECTURE & BUILD PLAN

## 1. PRODUCT VISION
FlyBeta is a gamified, level-based learning platform teaching Data Science, AI, and Cloud Computing.
- 10 levels per track. No cross-track prerequisites (all tracks unlocked from day one).
- Progression: Complete all mandatory lessons to unlock the next level. No exams or test gates.
- Gamification: XP, coins, streaks, badges (Motivational, not punitive).

## 2. TECH STACK (DECOUPLED ARCHITECTURE)
- **Backend:** Django + Django REST Framework (DRF) + SQLite (Dev) -> Postgres (Prod).
- **Frontend:** React (Vite) + Tailwind CSS + Lucide/Phosphor Icons.
- **Communication:** JSON over REST API (Token or JWT Authentication).

## 3. BACKEND APPS (Flat 3-App Structure)
Do not overcomplicate. Keep logic within these 3 apps:
1. `accounts`: Extended User, `UserProfile` (fields: xp [int], coins [int], streak [int], last_active_date).
2. `learn`: 
   - `Domain` (name, title, icon)
   - `Level` (domain FK, number 1-10, title, description)
   - `Lesson` (level FK, order, title, content_md, xp_reward, coins_reward, is_mandatory)
   - `DomainProgress` (user FK, domain FK, is_unlocked, current_level)
   - `LevelProgress` (user FK, level FK, is_completed, lessons_completed)
3. `api`: Centralized DRF ViewSets, Serializers, and AI integrations (Project Architect, Code Reviewer).

## 4. CONTENT PIPELINE
- Curriculum lives as JSON data files, NOT hardcoded in Python: `content/{domain}/level_{NN}.json`.
- Handled via a single Django management command: `python manage.py load_level_content` (uses update_or_create).

## 5. PHASED BUILD ORDER
- **Phase 1:** Django DRF Models, Auth, and JSON Loader command.
- **Phase 2:** React Vite Setup, Global UI Shell, Track/Lesson components (using imported Stitch UI code).
- **Phase 3:** Gamification logic (XP/Coin state updates) + Theme Switcher (CSS Variables).
- **Phase 4:** AI Features (Project Architect & Code Reviewer endpoints via AI API).