# 📍 JobTracker — Map Your Applications

A visual job & internship application tracker that renders every application as a pin on an interactive map. Built with Next.js 15, Supabase, and MapLibre GL JS.

## Features

- **Interactive Map** — Full-screen MapLibre GL map with OpenFreeMap tiles (free, no API key)
- **Status-Colored Pins** — 8 statuses (Applied, Interview, Offer, etc.) each with distinct colors
- **Pin Clustering** — Pins group automatically when zoomed out
- **Click-to-Place** — Drop a pin anywhere on the map to log a new application
- **Application Table** — Sortable, filterable, searchable table view with CSV export
- **Slide-in Sidebar** — Click any pin to see details, change status, view history
- **Floating List** — Collapsible overlay on the map showing all applications
- **Status History** — Automatic timeline of all status changes (via database triggers)
- **Dark Mode** — Full dark theme support including dark map tiles
- **Multi-User** — Supabase Auth + Row Level Security — each account is private
- **Archive/Delete** — Soft-delete as primary action, hard delete only from archive
- **Stats Dashboard** — Metric cards, status donut chart, application timeline, applied-via breakdown, rejection insights

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui (Base UI Nova) |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Map | MapLibre GL JS + OpenFreeMap |
| State | Zustand (UI) + TanStack Query (server) |
| Charts | Recharts |
| Animation | Motion (Framer Motion) |

## Getting Started

### Prerequisites

- [Volta](https://volta.sh) (pins Node 22)
- [pnpm](https://pnpm.io) v11+
- A [Supabase](https://supabase.com) project

### Setup

```bash
# Clone
git clone https://github.com/NickAb04/Intern-OR-Job-Tracker.git
cd Intern-OR-Job-Tracker

# Install dependencies (Volta auto-switches to Node 22)
pnpm install

# Create environment file
cp .env.local.example .env.local
# Fill in your Supabase URL and anon key

# Run the database schema
# Open Supabase Dashboard → SQL Editor → paste supabase/schema.sql → Run

# Start dev server
pnpm dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Project Structure

```
src/
├── app/
│   ├── (app)/           # Protected routes (map, applications, stats, profile)
│   ├── (auth)/          # Auth pages (login, signup)
│   └── auth/callback/   # OAuth/email confirmation handler
├── components/
│   ├── applications/    # StatusBadge, ApplicationsTable, CreateDialog
│   ├── map/             # MapView, FloatingList, MapPageClient
│   ├── nav/             # TopNav, ThemeToggle, UserMenu
│   ├── providers/       # QueryProvider, ThemeProvider
│   ├── sidebar/         # ApplicationSidebar
│   ├── stats/           # StatsDashboard, StatsPageClient
│   └── ui/              # shadcn/ui components
└── lib/
    ├── actions/         # Server Actions (CRUD)
    ├── queries/         # TanStack Query hooks
    ├── stores/          # Zustand stores
    ├── supabase/        # Supabase client (browser/server/middleware)
    ├── constants.ts     # Status colors, labels, map defaults
    └── types.ts         # TypeScript types
```

## Deployment

### Vercel (recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FNickAb04%2FIntern-OR-Job-Tracker&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY)

Or manually:
1. Push to GitHub
2. Import at [vercel.com/new](https://vercel.com/new)
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in environment variables
4. Deploy

### Post-deploy: Supabase Auth
1. In **Supabase Dashboard → Authentication → URL Configuration**:
   - Set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`)
   - Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**

### Keep-alive
A GitHub Actions cron (`.github/workflows/keep-alive.yml`) pings Supabase every 3 days to prevent the free-tier idle pause. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as **GitHub Secrets**.

## License

MIT
