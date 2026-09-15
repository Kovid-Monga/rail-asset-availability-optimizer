# RailBlock OS — Railway Operations Control Center (Frontend)

Frontend for the **AI-Powered Automatic Railway Block Planning & Asset Availability Optimization System**.

This repo contains **only the frontend**. The priority model, compatibility model, dataset,
optimization engine and backend API are built by other team members. Nothing here decides
priority, compatibility or a schedule — the UI **consumes** those decisions and makes them
readable, explainable and approvable by a human planner.

---

## 1. Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

The app boots in **mock mode**, so it runs with zero backend.

---

## 2. Switch mock → real backend (one file, no component changes)

`.env`

```bash
VITE_DATA_SOURCE=live                    # mock | live
VITE_API_BASE_URL=http://localhost:8000  # your backend
VITE_ENABLE_LIVE_SIMULATION=true         # simulated live events (mock mode only)
```

That is the entire integration switch. The mechanism:

```
src/api/mockApi.ts ─┐
                    ├─→  RailApi (src/api/index.ts)  →  hooks  →  pages  →  components
src/api/liveApi.ts ─┘
```

`RailApi` is a TypeScript interface. `mockApi` and `liveApi` both implement it, and
`src/api/index.ts` picks one based on `VITE_DATA_SOURCE`. Components never import
`mockData` and never call `fetch`.

Endpoint paths live in **one** file — `src/api/endpoints.ts`. If the backend team uses
different routes, edit that file only.

---

## 3. Data flow

```
API layer  →  Hook  →  Page  →  Reusable components
(src/api)     (src/hooks)  (src/pages)   (src/components, src/charts, src/3d)
```

- `src/api/client.ts` — base URL, `ApiError`, `http.get/post`, offline-friendly messages.
- `src/hooks/useApi.ts` — `useTasks`, `useSchedule`, `useDashboard`, `useRecommendations`,
  `useNetwork`, `useIncidents`. Each returns `{ data, loading, error, lastUpdated, refetch }`.
- `src/components/ui.tsx` → `<AsyncBoundary>` renders Loading / Error / Empty / Success for
  every backend-driven surface, so no page invents its own states.
- `src/store/AppContext.tsx` — cross-page state: selected task, selected block, focused
  section, role, demo mode. This is what links the Gantt ↔ map ↔ task list ↔ drawer.

---

## 4. Files

```
src/
  api/       client.ts  endpoints.ts  index.ts  liveApi.ts  mockApi.ts
  types/     index.ts            all backend response contracts
  data/      mockData.ts         the ONLY fake data in the app
  hooks/     useApi.ts  useLiveUpdates.ts
  store/     AppContext.tsx
  utils/     display.ts          colors/labels/geometry only — no business logic
  components/
    Sidebar  Header  KPIGrid  PriorityBadge  TaskCard  TaskDetailDrawer
    PriorityExplanation  CompatibilityPanel  GanttChart  AIRecommendation
    ApprovalPanel  NetworkMap  SystemFlow  IncidentForm  LiveFeed  DemoMode  ui
  charts/    Charts.tsx          delay trend, availability, backlog
  3d/        Railway3DScene.tsx  lazy-loaded isometric hero (R3F)
  pages/     Dashboard  MaintenanceTasks  BlockSchedule  NetworkMapPage  GanttPlanner
             AIRecommendations  WhatIfSimulation  Incidents  Reports  Settings
  App.tsx  main.tsx  index.css
```

---

## 5. Expected API contract

Full typing is in `src/types/index.ts`; realistic examples are in `src/data/mockData.ts`.

**`GET /api/tasks`** → `MaintenanceTask[]`

```json
{
  "task_id": "MT-102",
  "department": "Engineering",
  "source_system": "TMS",
  "block_section": "A-B",
  "line": "UP Main",
  "work_location": "KM 142/6",
  "reason_code": "TRK-04",
  "reason_description": "Track geometry maintenance",
  "asset_impact": "High",
  "due_date": "2026-09-16",
  "traffic": "High",
  "duration_min": 45,
  "priority_score": 86,
  "priority": "Critical",
  "status": "Pending",
  "assigned_team": "ENG-Gang 4",
  "priority_explanation": {
    "score": 86,
    "category": "Critical",
    "derived_reason_severity": "Major",
    "model_version": "priority-v1.3",
    "factors": [
      { "label": "Asset Impact", "value": "High", "score": 30, "max": 30 },
      { "label": "Reason Severity", "value": "Major", "score": 18, "max": 25 },
      { "label": "Traffic", "value": "High", "score": 25, "max": 25 },
      { "label": "Due Date", "value": "3-7 days", "score": 13, "max": 20 }
    ],
    "reasoning": "High asset impact on a high-traffic section, due within a week."
  },
  "compatibility": {
    "compatible_task_ids": ["MT-108", "MT-117"],
    "confidence": 0.92,
    "reason": "Same track section and overlapping protection requirements.",
    "model_version": "compat-v0.9"
  }
}
```

**`GET /api/schedule`** → `ScheduleResponse` (`plan_date`, `optimization_run_id`,
`generated_at`, `engine_version`, `blocks[]`, `summary`), where each block is:

```json
{
  "block_id": "BLK-07",
  "block_section": "A-B",
  "line": "UP Main",
  "start_time": "10:30",
  "end_time": "12:15",
  "tasks": ["MT-102", "MT-108", "MT-117"],
  "assigned_team": "ENG-Gang 4",
  "estimated_delay_min": 4,
  "compatibility_score": 0.92,
  "status": "AI_RECOMMENDED",
  "requires_approval": true
}
```

Other endpoints: `GET /api/tasks/:id`, `GET /api/dashboard`, `GET /api/recommendations`,
`GET /api/network`, `GET|POST /api/incidents`, `POST /api/what-if`,
`POST /api/schedule/approve`, `POST /api/schedule/override`,
`POST /api/recommendations/:id/apply`.

The priority scoring rubric (Asset Impact 30 / Reason Severity 25 / Traffic 25 / Due Date 20;
Critical 80–100, Urgent 60–79, Moderate 35–59, Normal 0–34) is **displayed**, never computed
here. `priority_explanation.factors` is rendered exactly as the model returns it.

---

## 6. Human-in-the-loop

AI Recommendation → Planner Review → **Approve / Modify / Reject**.
Modify can change start, end, team, or drop a task from a block, and always requires a
reason. Overrides are recorded and shown on the block:

> AI suggested 06:45–09:10 → Planner changed 07:15–09:40 · Reason: Train movement conflict with 12951 UP

Every AI surface is labelled *AI Recommended · Planner approval required*. Nothing is
published to BDMS without a human decision.

---

## 7. Demo walkthrough (13 steps)

Click **Demo** in the header. It navigates and selects for you:

1. Overview → 2. Network status → 3. Maintenance tasks → 4. Select Critical MT-102 →
5. Priority explanation → 6. Compatible tasks → 7. Optimized block schedule →
8. Combined block BLK-07 on the Gantt → 9. AI recommendation → 10. Run what-if (E-F) →
11. Revised schedule → 12. Planner approves → 13. Final approved plan.

---

## 8. Roles

Switch role in the header or Settings (dev-only stand-in for auth claims):

| Role | Sees |
| --- | --- |
| Supervisor | Everything; approve + override |
| Maintenance Crew | Own team's tasks, map, incidents |
| Auditor | Read-only tasks, map, incidents, reports |
| Management | Division summary, schedule, reports, what-if |

---

## 9. Notes for the team

- Real-time is simulated in mock mode by `useLiveUpdates`. Swap the interval for a WebSocket
  or SSE subscription and the feed keeps working.
- 3D is deliberately one lazy-loaded scene on the Network Map; the schematic SVG map is the
  default and carries all operational meaning.
- Status is never encoded by color alone — every state also has an icon, label or pattern.
- Dependencies were not installed in the authoring environment, so run `npm install` and
  `npm run typecheck` once before your first demo.
