# CRM
# AI CRM

A lightweight AI-first CRM for logging HCP interactions with a React frontend and FastAPI backend. This repository includes a full local development setup, mock AI assistant functionality, and REST API endpoints for interaction management.

## Project structure

- `frontend/` — React + Vite application
- `backend/` — FastAPI backend service
- `.gitignore` — ignores local dependencies and environment files
- `README.md` — project documentation

## Features

- React frontend with Redux Toolkit state management
- FastAPI backend with interaction create, list, update and AI helper endpoints
- Mock AI assistant for summary generation and chat extraction
- Local development setup with frontend/backend separation

## Prerequisites

- Node.js 20+ and npm
- Python 3.11+ (or compatible Python 3.12/3.14)
- Git

## Setup

### 1. Clone the repository

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd AI
```

### 2. Install frontend dependencies

```powershell
npm install --prefix frontend
```

### 3. Install backend dependencies

```powershell
python -m venv backend\venv
.\backend\venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
```

## Run the application

### Start the backend

```powershell
python -m uvicorn backend.main:app --reload
```

The backend will run at:

- `http://127.0.0.1:8000`

### Start the frontend

```powershell
npm run frontend:dev
```

The frontend will run at:

- `http://localhost:5173/`

### Full stack workflow

1. Start the backend server.
2. Start the frontend server.
3. Open `http://localhost:5173/` in your browser.

## Environment configuration

### Frontend

The frontend reads the backend API URL from `VITE_API_URL`.
Create `frontend/.env` from `frontend/.env.example` if you need to override the backend URL.

Example `frontend/.env`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000
```

### Backend

No backend `.env` file is required by default.
If you add custom settings later, place them in `backend/.env` and update the backend code accordingly.

## API reference

### GET /interactions

Returns the list of saved CRM interactions.

Response example:

```json
{
  "interactions": [
    {
      "id": 1,
      "hcp_name": "Dr. Meera Shah",
      "interaction_type": "Meeting",
      "date": "2026-07-14",
      "time": "15:00",
      "attendees": "Sales rep, MSL",
      "topics_discussed": "...",
      "outcomes": "...",
      "follow_up_actions": "...",
      "materials_shared": [],
      "samples_distributed": [],
      "sentiment": "Neutral",
      "ai_summary": "...",
      "ai_follow_ups": ["..."],
      "ai_next_best_action": "..."
    }
  ]
}
```

### POST /interactions

Create a new interaction.

Request body example:

```json
{
  "hcp_name": "Dr. Meera Shah",
  "interaction_type": "Meeting",
  "date": "2026-07-14",
  "time": "15:00",
  "attendees": "Sales rep, MSL",
  "topics_discussed": "Discussed product efficacy",
  "outcomes": "HCP requested study data",
  "follow_up_actions": "Send clinical brochure",
  "materials_shared": ["Product efficacy brochure"],
  "samples_distributed": ["Starter sample"],
  "sentiment": "Positive"
}
```

### PUT /interactions/{id}

Update an existing interaction by ID.

### POST /ai/hcp-assist

Request AI suggestions for the current interaction payload.

### POST /ai/extract-interaction

Send a free-form note to extract structured interaction fields and AI guidance.

## Notes

- The backend currently uses in-memory storage only. Data will reset when the server restarts.
- The AI assistant endpoints are currently mocked for demo purposes.
- If you want production behavior, add a persistent database and real AI integrations.

## Recommended GitHub files

- `.gitignore` — already included
- `frontend/.env.example` — included for local API configuration

## Optional improvements

- Add tests for frontend and backend
- Add database persistence (SQLite, PostgreSQL, etc.)
- Add CI/CD workflow for GitHub Actions
- Add authentication if needed for a real CRM

## License

This project is provided under the MIT License.
