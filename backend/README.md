# FlyBeta Backend

Django REST Framework backend for the FlyBeta gamified learning platform.

## Quick Start

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Admin panel: http://localhost:8000/admin/
API root: http://localhost:8000/api/v1/

## Project Structure

```
backend/
├── flybeta/          # Django project config (settings, urls, wsgi)
├── accounts/         # UserProfile model (xp, coins, streak)
├── learn/            # Domain → Level → Lesson content models + progress tracking
├── api/              # DRF ViewSets, Serializers, URL router (Phase 2)
├── content/          # JSON curriculum files (loaded via management command)
├── manage.py
└── requirements.txt
```

## Apps

| App | Purpose |
|-----|---------|
| `accounts` | Extended User via `UserProfile` (OneToOne). Gamification state: XP, coins, streak. Auto-created via signal. |
| `learn` | Content models (`Domain`, `Level`, `Lesson`) and progress models (`DomainProgress`, `LevelProgress`). |
| `api` | Centralized DRF endpoint layer. ViewSets and Serializers (Phase 2). |

## Database

- **Dev:** SQLite (`db.sqlite3`)
- **Prod:** PostgreSQL (swap `ENGINE` in settings)

## Models (learn app)

- **Domain** — A learning track (Data Science, AI & ML, Cloud Computing)
- **Level** — 10 sequential levels per domain
- **Lesson** — Individual lessons with markdown content, XP/coin rewards
- **DomainProgress** — User's current level in each domain
- **LevelProgress** — Which lessons a user has completed in a level
