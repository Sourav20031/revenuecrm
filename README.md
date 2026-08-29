# StarVnt Revenue CRM — Sales Automation System (Sprint 1)

An internal CRM for StarVnt's sales team: capture leads, assign them to
salespeople, qualify them, move them through a sales pipeline, schedule
follow-ups, and see everything on a single timeline per lead. This is the
Sprint 1 demo build — it prioritizes a working, polished, end-to-end flow
over full feature coverage.

## What this project is

- A dark, premium, StarVnt-branded internal CRM (not a public-facing product).
- A demo built to show the core lead lifecycle working against a real database:
  **Dashboard → Leads → Add Lead → Lead Details → Assign → Qualify → Pipeline
  → Follow-up → Timeline**.
- Built to be deployable today: frontend to Vercel, backend to any Node host,
  data in MongoDB Atlas.

## Architecture

```
frontend/   React 18 + Vite + React Router + Tailwind CSS + Axios
backend/    Node.js + Express + Mongoose
database/   MongoDB (Atlas in production, local/in-memory for dev)
```

The frontend never talks to MongoDB directly — it only calls the backend's
REST API via `VITE_API_BASE_URL`. The backend never renders UI — it only
exposes JSON under `/api/v1`. Business logic (timeline events, audit
entries) lives in `backend/src/services`, not inside route handlers or React
components.

## Folder structure

```
frontend/
  src/
    components/   Reusable UI: Sidebar, Header, badges, Modal, Timeline...
    pages/        One file per route (Dashboard, Leads, LeadDetails, ...)
    layouts/      MainLayout (sidebar + header + content shell)
    services/     Axios calls only — api.js, leads.js, tasks.js, ...
    hooks/        useToast (notifications), useSession (dev-only user stub)
    utils/        constants.js, format.js, validation.js
    routes/       AppRoutes.jsx (React Router route table)
  vercel.json     SPA rewrite rule so client-side routes survive a refresh
  .env.example

backend/
  src/
    config/       db.js — MongoDB connection (isolated from the rest of the app)
    models/       Lead, TimelineEvent, Task, FollowUp, Proposal (Mongoose)
    controllers/  Request handlers — one per resource
    routes/       Express routers, mounted under /api/v1
    services/     timelineService.js, auditService.js
    middleware/   errorHandler.js (centralized error + 404 handling)
    utils/        apiResponse.js, asyncHandler.js, seed.js
    app.js        Express app (middleware, routes)
    server.js     Entry point — loads env, connects DB, starts listening
  .env.example
```

## Local setup

### Prerequisites
- Node.js 18+
- A MongoDB connection string (MongoDB Atlas recommended — see below)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env and set MONGODB_URI to your Atlas connection string
npm run seed   # optional: populates demo leads/tasks/follow-ups/proposals
npm run dev    # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# .env already defaults to http://localhost:5000 for local dev
npm run dev    # starts the app on http://localhost:5173
```

Open http://localhost:5173 — you should land on the Dashboard.

## MongoDB Atlas setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas.
2. Create a database user (Database Access) with a strong password.
3. Add your IP (or `0.0.0.0/0` for demo purposes only) under Network Access.
4. Copy the connection string from "Connect → Drivers" and paste it into
   `backend/.env` as `MONGODB_URI`, replacing `<username>`, `<password>` and
   the database name (e.g. `starvnt_crm`).
5. Run `npm run seed` from `backend/` to populate demo data, or just start
   the app and add leads through the UI — collections are created
   automatically on first write.

## Environment variables

**backend/.env** (see `backend/.env.example`)
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas (or any MongoDB) connection string |
| `PORT` | Port the API listens on (default `5000`) |
| `CORS_ORIGIN` | Comma-separated list of allowed frontend origins |
| `NODE_ENV` | `development` or `production` |

**frontend/.env** (see `frontend/.env.example`)
| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the deployed/local backend API (no trailing slash, no `/api/v1`) |

Neither `.env` file is committed — both are covered by `.gitignore`. No
localhost URLs, credentials, or secrets are hardcoded anywhere in the
source.

## Build command

```bash
cd frontend
npm run build   # outputs static assets to frontend/dist
```

## Deploying the frontend to Vercel

1. Push this repo to GitHub (or import it directly from your machine via the
   Vercel CLI).
2. In Vercel, create a new project and set **Root Directory** to `frontend`.
3. Framework preset: Vite. Build command: `npm run build`. Output directory:
   `dist` (Vercel usually detects these automatically).
4. Add an environment variable `VITE_API_BASE_URL` pointing at your deployed
   backend (e.g. `https://your-backend.onrender.com`).
5. Deploy. `frontend/vercel.json` rewrites all paths to `index.html`, so
   `/leads/:id`, `/pipeline`, `/tasks`, `/follow-ups`, etc. all work
   correctly on a hard refresh or direct link.

## Backend deployment requirement

Vercel serverless functions are not a good fit for a long-lived Express +
Mongoose app in this shape, so the backend should be deployed separately —
to a host such as Render, Railway, Fly.io, or a small VM:

1. Set `MONGODB_URI`, `PORT` (most hosts inject this automatically), and
   `CORS_ORIGIN` (set this to your Vercel frontend URL) as environment
   variables on the host.
2. Start command: `npm start` (runs `node src/server.js`).
3. Once deployed, update the frontend's `VITE_API_BASE_URL` to the backend's
   public URL and redeploy the frontend.

## API endpoints

All responses follow:
```json
{ "success": true, "data": {}, "message": "..." }
{ "success": false, "message": "...", "errors": [] }
```

| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/dashboard` | KPIs, funnel, recent leads, upcoming follow-ups, recent activity |
| POST | `/api/v1/leads` | Create a lead |
| GET | `/api/v1/leads` | List leads (search, filter, sort, pagination) |
| GET | `/api/v1/leads/:id` | Get one lead |
| PUT | `/api/v1/leads/:id` | Update a lead (assign, qualify, edit, add note) |
| DELETE | `/api/v1/leads/:id` | Delete a lead |
| PUT | `/api/v1/leads/:id/stage` | Change pipeline stage |
| GET | `/api/v1/leads/:id/timeline` | Timeline events for a lead |
| POST | `/api/v1/tasks` | Create a task |
| GET | `/api/v1/tasks` | List tasks |
| PUT | `/api/v1/tasks/:id` | Update a task |
| DELETE | `/api/v1/tasks/:id` | Delete a task |
| POST | `/api/v1/followups` | Schedule a follow-up |
| GET | `/api/v1/followups` | List follow-ups |
| PUT | `/api/v1/followups/:id` | Update a follow-up |
| DELETE | `/api/v1/followups/:id` | Delete a follow-up |
| POST | `/api/v1/proposals` | Track a proposal |
| GET | `/api/v1/proposals` | List proposals |
| PUT | `/api/v1/proposals/:id` | Update a proposal |
| GET | `/api/v1/audit-logs` | Recent audit trail (in-memory, Sprint 1 only) |

## Authentication

There is no production authentication in this sprint. The frontend uses a
clearly-marked development session stub (`frontend/src/hooks/useSession.jsx`)
that presents a fixed "Dev User" identity, and the backend attributes
actions to a fixed dev user string. This is intentional scaffolding for
StarVnt Core Identity / JWT integration in a later sprint — swapping it out
means replacing `useSession` and adding auth middleware on the backend
without touching the rest of the app.

## What is fully functional

- Lead CRUD (create, read, update, delete) against MongoDB, verified
  end-to-end with a real Mongoose connection.
- Lead assignment, qualification updates, pipeline stage changes, and notes
  — each writes a real document to MongoDB and appends a `TimelineEvent`.
- Pipeline Kanban view with stage changes persisted.
- Tasks and Follow-ups: create, list, filter, update status.
- Lead timeline: chronological, per-lead, backed by the `TimelineEvent`
  collection.
- Dashboard KPIs, funnel, recent leads, upcoming follow-ups, and recent
  activity — computed live from MongoDB via aggregation queries.
- Basic in-memory audit log for lead create/update/assign/stage/qualification
  events.
- Data persists across refreshes and server restarts (as long as
  `MONGODB_URI` points at a real database).

## What is demo-only

- Authentication (dev-user stub, not real StarVnt Core Identity/JWT).
- Audit log storage (in-memory, resets on backend restart — not a persisted
  collection).
- Notifications page (reads the same activity feed as the dashboard; no
  push/real-time notifications).
- Analytics page (win rate + stage distribution only; no deeper reporting).
- Proposals (tracking only — no quote generation, which belongs to the
  separate Core Commerce platform per the spec).
- Search bar in the header is visual only (Leads page has its own working
  search/filter/sort/pagination).

## What remains for Sprint 2+

- Real authentication via StarVnt Core Identity / JWT, replacing the dev
  session stub and adding backend auth middleware.
- Persisted audit log collection with filtering and export.
- Real-time notifications (websockets or polling) instead of a static feed.
- Drag-and-drop pipeline reordering (Sprint 1 uses a stage dropdown per
  card, called out as acceptable in the brief).
- Deeper analytics/reporting (conversion trends over time, per-salesperson
  performance).
- Role-based permissions once Core Identity roles are available.
