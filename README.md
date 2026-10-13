# FlyBeta 🚀

**FlyBeta** is a gamified, hands-on tech learning platform designed to take users from zero to hero through structured tracks, interactive labs, and AI-powered evaluation. Say goodbye to passive video watching and hello to active, project-based learning.

Built with a striking Neo-Brutalist design system, FlyBeta makes learning programming languages, cloud architecture, and data engineering engaging and visually stunning.

## Features

- **Structured Tracks & Roadmaps**: Follow beautifully designed, step-by-step skill trees.
- **Interactive Labs**: Solve real-world coding problems.
- **AI-Powered Evaluation**: Get instant, intelligent feedback on your code and architecture using Google's Gemini AI.
- **Gamification**: Earn XP, collect coins, and maintain your daily streak as you level up your skills.
- **Neo-Brutalist Design**: A bold, high-contrast, energetic interface that stands out.
- **JWT-Based Authentication**: Full register / login / logout with access + refresh token rotation.
- **Asynchronous SMTP Email Delivery**: Password reset emails sent via Gmail SMTP in a background thread — zero UI blocking.
- **Freemium Access Control**: Level 1 is freely explorable by guests; Level 2+ and the AI Capstone evaluator are gated behind a sign-up prompt.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (v4)
- **Backend**: Django, Django REST Framework (DRF)
- **Database**: PostgreSQL via Supabase (Production), SQLite (Development)
- **Authentication**: JWT (djangorestframework-simplejwt) — `CustomUser` + `StudentProfile`
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash)
- **Email Delivery**: Django SMTP backend via Gmail App Passwords (async threaded dispatch)
- **Gamification State**: React Context API (`AuthContext`, `ThemeContext`)

## Local Setup

### 1. Backend Setup (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up your environment variables
cp .env.example .env
# Edit .env with your credentials:
#
# Core
# GEMINI_API_KEY=your_key_here
# GITHUB_TOKEN=your_token_here
# DATABASE_URL=your_postgres_connection_string
#
# SMTP Email Configuration (Required for password resets)
# EMAIL_HOST_USER=your_email@gmail.com
# EMAIL_HOST_PASSWORD=your_16_char_app_password
# (Generate an App Password at https://myaccount.google.com/apppasswords)

# Run migrations and start the server
python manage.py migrate
python manage.py runserver
```

The Django API will be available at `http://localhost:8000`.

### 2. Frontend Setup (React/Vite)

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The React application will be available at `http://localhost:5173`.

## Architecture

```
flybeta-project/
├── backend/          # Django REST Framework API, AI Evaluator, Models
├── frontend/         # React, Vite, Tailwind CSS application
├── docs/             # Technical documentation and context
└── README.md         # This file
```

---
*Built with 💚 for curious minds everywhere.*
