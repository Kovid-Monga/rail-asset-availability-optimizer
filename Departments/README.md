# BDMS Department Portal (TMS / TDMS / SMMS)

The **BDMS (Block Distribution Management System) Department Portal** is a unified single web application enabling railway departments (**TMS** - Track Management, **TDMS** - Traction Distribution, and **SMMS** - Signal & Telecom) to manage, create, save drafts, edit, and submit maintenance block requests backed by a PostgreSQL database and a FastAPI backend service.

---

## Architecture Overview

```
React Frontend (Vite)
       │
       ▼ (HTTP / REST)
FastAPI Backend (Port 8000)
       │
       ▼ (SQLAlchemy / psycopg2)
PostgreSQL (Database: BDMS)
       │
       ▼
maintenance_requests table
```

- **Single Codebase, 3 Department Views**: Selected using a simple dropdown (TMS, TDMS, SMMS).
- **Persistent State**: Department selection persists across views via local storage.
- **Strict Isolation**: The frontend never connects directly to PostgreSQL; all operations route through FastAPI.

---

## Tech Stack

- **Frontend**: React 18, Vite, Vanilla CSS (Design system with `#D85A30` railway accent color).
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, Uvicorn.
- **Database**: PostgreSQL (`BDMS`).

---

## Database Specification

- **Database Name**: `BDMS`
- **Table Name**: `maintenance_requests`

### Schema DDL (`database/schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS maintenance_requests (
    need_id             SERIAL PRIMARY KEY,
    department          VARCHAR(10) NOT NULL,
    block_start         VARCHAR(100) NOT NULL,
    block_end           VARCHAR(100) NOT NULL,
    line                VARCHAR(50),
    work_location       VARCHAR(100),
    reason_code         VARCHAR(20),
    reason_description  TEXT,
    asset_impact        VARCHAR(20),
    duration_min        INTEGER NOT NULL,
    due_date            DATE NOT NULL,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Enumerated Values
- **Departments**: `TMS`, `TDMS`, `SMMS`
- **Department-Specific Reason Codes**:
  - **TMS**: `ETMW`, `ERRL`, `ETMR`, `OTHR`
  - **TDMS**: `TPWR`, `TOHE`, `TREP`, `OTHR`
  - **SMMS**: `SSIG`, `STEL`, `SREP`, `OTHR`
- **Asset Impact**: `High`, `Medium`, `Low`
- **Status Lifecycle**: `DRAFT` ➔ `SUBMITTED`

---

## Project Structure

```
Departments/
├── database/
│   └── schema.sql              # Database schema DDL
├── backend/
│   ├── requirements.txt        # Python backend dependencies
│   ├── .env.example            # Environment template
│   ├── .env                    # Local configuration (DATABASE_URL)
│   └── app/
│       ├── main.py             # FastAPI entrypoint & CORS
│       ├── database/
│       │   ├── connection.py   # SQLAlchemy PostgreSQL engine
│       │   └── seed.py         # Test seed data for TMS/TDMS/SMMS
│       ├── models/
│       │   └── request.py      # SQLAlchemy ORM model
│       ├── schemas/
│       │   └── request.py      # Pydantic validation schemas
│       └── routes/
│           └── requests.py     # REST API route handlers
├── frontend/
│   ├── package.json            # React & Vite dependencies
│   ├── vite.config.js          # Vite config
│   ├── index.html              # HTML shell
│   └── src/
│       ├── main.jsx            # React root mount
│       ├── App.jsx             # Shell, department state & routing
│       ├── index.css           # Styling system (#D85A30 accent)
│       ├── services/
│       │   └── api.js          # Fetch client for backend endpoints
│       ├── components/
│       │   ├── Topbar.jsx      # Top navigation & Department dropdown
│       │   ├── Sidebar.jsx     # Sidebar navigation
│       │   └── StatusBadge.jsx # DRAFT / SUBMITTED pill badges
│       └── pages/
│           ├── Dashboard.jsx   # Metrics cards & recent requests
│           ├── MyRequests.jsx  # Department-filtered table
│           ├── NewRequest.jsx  # Form with Save Draft & Submit
│           └── RequestDetails.jsx # Read/Edit & Submit view
└── README.md
```

---

## Setup & Running the Application

### 1. PostgreSQL Configuration
Ensure your PostgreSQL server is running and the database `BDMS` exists.
In `Departments/backend/.env`, set your connection URL:
```env
DATABASE_URL=postgresql://postgres:<YOUR_PASSWORD>@localhost:5432/BDMS
PORT=8000
HOST=127.0.0.1
```

### 2. Backend Setup (FastAPI)
Open a terminal in `Departments/backend`:
```powershell
# Create and activate virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Seed sample requests (optional, also seeds automatically on first run if empty)
python -m app.database.seed

# Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API docs will be available at: `http://127.0.0.1:8000/docs`.

### 3. Frontend Setup (React)
Open a terminal in `Departments/frontend`:
```powershell
# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
The Department Portal will be running at: `http://localhost:5173`.

---

## REST API Reference

| Method | Path | Description | Query / Body Parameters |
|---|---|---|---|
| `GET` | `/requests` | List requests | `?department=TMS|TDMS|SMMS`, `?status=DRAFT|SUBMITTED` |
| `GET` | `/requests/stats` | KPI statistics | `?department=TMS|TDMS|SMMS` |
| `GET` | `/requests/{need_id}` | Get request details | `need_id` (integer) |
| `POST` | `/requests` | Create new request | JSON body (`status: 'DRAFT'` or `'SUBMITTED'`) |
| `PUT` | `/requests/{need_id}` | Update existing request | JSON body with updated fields |
| `DELETE` | `/requests/{need_id}` | Delete a draft request | `need_id` (DRAFT only) |
| `POST` | `/requests/{need_id}/submit` | Transition draft to submitted | `need_id` (integer) |
| `GET` | `/health` | Service health status | — |
