# FlyBeta — Future Implementations & Backlog

This document serves as a staging ground and backlog for features, enhancements, and technical debt that we plan to implement in future phases of FlyBeta.

## Phase 6: Real AI API Integration (Upcoming)

### Synapse Engine Backend Prompt
"We are beginning Phase 6: Real AI API Integration. Let's build the backend for the Synapse Engine.

Please execute the following backend implementation:

Dependencies: Install `youtube-transcript-api` and `google-generativeai` (if not already present) via pip, and update `requirements.txt`.

AI Service logic: In `api/ai_services.py`, create a new function `generate_video_quiz(video_id)`.

Use `YouTubeTranscriptApi.get_transcript(video_id)` to extract the raw text.

Pass this concatenated text to the Gemini API (using the fast `gemini-1.5-flash` model).

Instruct Gemini to generate a strict JSON response containing exactly 3 multiple-choice questions based on the video context.

The output schema must match: `[{"question": "...", "options": ["...", "...", "...", "..."], "correct_index": 0}]`.

API Endpoint: In `api/views.py`, create `SynapseExtractView` (POST `/api/v1/ai/synapse/`). It should accept a `video_url`, extract the `video_id` using regex, call `generate_video_quiz`, and return the JSON array.

Routing: Wire this new view into `api/urls.py`.

Ensure robust error handling (e.g., if a video has captions disabled, catch the exception and return a clean 400 error message so the frontend can display it)."

- [x] **The Oracle Backend (Current Task)**: Replace mock `setTimeout` responses with live Gemini API calls to create a global AI mentor. (Completed)
- [x] **Synapse Engine Backend**: Wire up the YouTube transcript extraction and Gemini API to generate real quizzes dynamically from the video context. (Completed)
- [x] **AI Mentor Proxies**: Implement the backend integration for the Project Architect (Blueprint Lab) and Code Reviewer (Code Drishti) endpoints. (Completed)

## Future Enhancements & Ideas
*(Add future feature ideas, UI/UX polish, and technical debt items here)*

### Gamification & User Progression
- [ ] Implement user authentication and JWT sessions.
- [ ] Connect XP, coins, and streaks to a real user profile database.
- [ ] Build out a global leaderboard or friends system.

### Frontend Polish
- [ ] Add sound effects for neo-brutalist interactions (e.g., button clicks, quiz completion).
- [ ] Enhance responsive design for mobile (currently optimized for desktop/tablet).

### Backend Optimization
- [ ] Migrate from SQLite to PostgreSQL for production readiness.
- [ ] Implement robust error handling and rate limiting for AI endpoints.
