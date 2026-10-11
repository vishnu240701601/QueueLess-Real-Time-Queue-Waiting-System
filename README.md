# QueueLess – Real-Time Queue Waiting System

QueueLess is a modern, real-time digital queuing web application designed to eliminate physical waiting lines at college canteens, administrative offices, photocopy shops, and department service counters.

---

## 1. Technology Architecture

* **Frontend:** React.js + Vite (JavaScript, HTML5, Vanilla CSS Design System)
* **Frontend Hosting:** Netlify (with SPA history redirection via `client/netlify.toml`)
* **Backend:** Node.js + Express structured for Vercel Serverless (`/api`)
* **Backend Hosting:** Vercel (rewriting `/api/*` to `api/index.js`)
* **Database & Authentication:** Supabase PostgreSQL 15+ & Supabase Auth
* **Real-time Engine:** Supabase Realtime (CDC WebSocket subscriptions)

---

## 2. Project Directory Structure

```
QueueLess - Real-Time Queue Waiting System/
├── .env.example                       # Unified environment variable template
├── .gitignore                         # Standard git ignore definitions
├── vercel.json                        # Vercel serverless routing config
├── README.md                          # Project documentation
│
├── api/                               # Vercel serverless API entry point
│   └── index.js
│
├── server/                            # Backend Express codebase & SQL
│   ├── package.json
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── utils/
│   └── db/                            # Supabase SQL Migrations & Functions
│       ├── 01_schema.sql              # Tables, Enums, Constraints, Partial Indexes
│       ├── 02_rpc_functions.sql       # Atomic join_queue, call_next, lifecycle RPCs
│       ├── 03_rls_policies.sql        # Row Level Security & Realtime publication
│       └── 04_seed.sql                # Starter counters & role assignment recipes
│
└── client/                            # React + Vite Frontend
    ├── package.json
    ├── vite.config.js
    ├── netlify.toml
    ├── index.html
    └── src/
        ├── index.css
        ├── App.jsx
        ├── api/
        ├── context/
        ├── hooks/
        ├── components/
        └── pages/
```

---

## 3. Database Setup Instructions (Supabase)

To initialize your Supabase database:

1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Execute the SQL scripts in this exact order:
   - Run `server/db/01_schema.sql` (Creates enums, tables, and auth triggers).
   - Run `server/db/02_rpc_functions.sql` (Installs atomic PL/pgSQL queue functions).
   - Run `server/db/03_rls_policies.sql` (Configures Row Level Security and Realtime publication).
   - Run `server/db/04_seed.sql` (Inserts realistic demo counters).
4. Verify under **Database -> Tables** that `profiles`, `counters`, `counter_staff`, and `tokens` are populated and have RLS active.

---

## 4. Implementation Status & Roadmap

- [x] **Phase 1:** Technical Audit, Architecture & Database Design
- [x] **Phase 2:** Supabase Schema, Atomic RPC Functions, RLS Policies, and Project Skeleton
- [ ] **Phase 3:** React Frontend, Design System, Responsive Dashboards & Auth Flow
- [ ] **Phase 4:** Vercel Serverless Express API, JWT Middleware & Operations
- [ ] **Phase 5:** Real-time WebSockets & End-to-End Integration
- [ ] **Phase 6:** Testing, Concurrency Verification & Deployment
- [ ] **Phase 7:** Final Documentation & Walkthrough Demo
