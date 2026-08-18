# PATCHLOG.md

## 2026-08-11 — Phase 1: Scaffold
- Initialized Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui (nova preset)
- Installed core dependencies: @supabase/supabase-js, @supabase/ssr, @tanstack/react-query, zustand, motion, next-themes, sonner, lucide-react, maplibre-gl, recharts
- Added shadcn components: button, input, select, dialog, dropdown-menu, tooltip, badge, table, popover, sheet, card, label, separator, avatar, tabs, textarea
- Created .env.local + .env.local.example
- Created .vscode/settings.json + extensions.json
- Pinned Node 22 via Volta in package.json
- Updated .gitattributes with eol=lf
- Seeded all docs/ and ai/ files per §8
- Files touched: package.json, .gitattributes, .env.local, .env.local.example, .vscode/*, AGENTS.md, docs/*, ai/*

## 2026-08-11 — Phase 2: Auth + Shell
- Supabase client setup (browser + server + middleware helpers)
- Next.js middleware for auth route protection
- Login + signup auth pages with email/password
- Auth callback route handler for OAuth/email confirmation
- App shell layout with auth guard, TopNav, providers (Query, Theme, Tooltip), Toaster
- Theme toggle (sun/moon), user avatar dropdown menu
- Placeholder pages for /map, /applications, /profile
- Root page redirect logic (auth → /map, unauth → /login)
- Zustand UI store (sidebar, floating list, pin mode state)
- Files touched: src/lib/supabase/*, src/middleware.ts, src/app/(auth)/*, src/app/auth/*, src/app/(app)/*, src/components/nav/*, src/components/providers/*, src/lib/stores/*

## 2026-08-13 — Phase 3: Data Layer
- Created SQL schema: Application + StatusHistory tables, enums (application_type, application_status, applied_via), indexes, triggers (auto updated_at, auto status history logging), full RLS policies
- TypeScript types mirroring database schema (src/lib/types.ts)
- Constants: status config (colors, labels, tooltips), application type labels, applied-via labels, map defaults (src/lib/constants.ts)
- Server Actions: createApplication, updateApplication, updateStatus, archiveApplication, restoreApplication, deleteApplication, getApplications, getApplication, getStatusHistory
- TanStack Query hooks with proper cache invalidation for all CRUD operations
- StatusBadge component (color-coded pill with hover tooltip)
- CreateApplicationDialog (full form: company, role, type, status, applied via, date, location, URL, notes)
- ApplicationsTable (search, status filter, column sorting, active/archived tabs, inline status changer, CSV export, archive/restore/delete with confirmation)
- Replaced placeholder applications page with full functional page
- Files touched: supabase/schema.sql, src/lib/types.ts, src/lib/constants.ts, src/lib/actions/applications.ts, src/lib/queries/use-applications.ts, src/components/applications/*, src/app/(app)/applications/page.tsx, ai/CONTEXT.md

## 2026-08-14 — Phase 4+5: Map Integration + Pin Creation
- MapLibre GL JS v6 integration with OpenFreeMap tiles (positron for light, dark for dark theme)
- MapView component: full-screen map with status-colored circle pins, cluster grouping with stepped colors/radii, hover popups (company+role), click-to-view sidebar, crosshair cursor for add-pin mode
- Fixed MapLibre v6 breaking change: no default export — switched to named imports (Map, NavigationControl, Popup, LngLatBounds, GeoJSONSource, ExpressionSpecification)
- Added @types/geojson for GeoJSON namespace types
- ApplicationSidebar: slide-in panel (Motion animated) showing full application detail, inline status changer, status history timeline, metadata, notes, archive action
- Pin creation flow: "Drop Pin" button toggles crosshair mode → click map → coordinates captured to Zustand store → CreateApplicationDialog opens with pre-filled lat/lng
- Updated CreateApplicationDialog: now supports both standalone trigger mode (applications table page) and controlled mode (map click, no trigger button)
- Extended UI store with pendingPin coordinates and createDialogOpen for map-click flow
- Added pinColor hex values to all 8 status configs for MapLibre circle paint expressions
- Added OpenFreeMap style URLs + cluster config to MAP_DEFAULTS constants
- MapPageClient: orchestrates MapView + sidebar + pin controls + create dialog
- Map popup dark-mode styles + maplibregl-map fill CSS added to globals.css
- Theme-aware style switching: map preserves center/zoom across light↔dark toggle, re-adds GeoJSON source/layers after style reload
- Files touched: src/components/map/map-view.tsx, src/components/map/map-page-client.tsx, src/components/sidebar/application-sidebar.tsx, src/components/applications/create-application-dialog.tsx, src/lib/stores/ui-store.ts, src/lib/constants.ts, src/app/(app)/map/page.tsx, src/app/globals.css, package.json

## 2026-08-14 — Phase 6+7: Floating List + Polish
- FloatingList component: collapsible overlay at bottom-left of map, compact application cards, real-time search, click-to-fly-to + open-sidebar
- Added onMapReady callback to MapView to expose map instance for flyTo from floating list
- Updated MapPageClient to wire FloatingList ↔ MapView flyTo
- Responsive TopNav: mobile hamburger menu (hidden on sm+), dropdown nav on mobile
- Comprehensive README.md: features, tech stack, setup instructions, project structure, environment variables
- Files touched: src/components/map/floating-list.tsx, src/components/map/map-view.tsx, src/components/map/map-page-client.tsx, src/components/nav/top-nav.tsx, README.md, ai/CONTEXT.md

## 2026-08-19 — Phase 8: Stats Dashboard
- StatsDashboard component with Recharts: 4 metric cards (total apps, response rate, acceptance rate, avg days since update), status breakdown donut chart, application timeline area chart, applied-via horizontal bar chart, application type progress bars, rejection insight card
- StatsPageClient wrapper + stats page at /stats
- Added "Stats" nav link with BarChart3 icon to TopNav (desktop + mobile)
- Empty state with prompt to add applications
- Custom chart tooltip component matching app theme
- Files touched: src/components/stats/stats-dashboard.tsx, src/components/stats/stats-page-client.tsx, src/app/(app)/stats/page.tsx, src/components/nav/top-nav.tsx

## 2026-08-19 — Phase 9: Ship
- Fixed .gitignore to allow .env.local.example to be tracked (was blocked by `.env*` glob)
- Created GitHub Actions keep-alive cron (.github/workflows/keep-alive.yml) — pings Supabase every 3 days to prevent free-tier idle pause
- Added Deployment section to README.md: Vercel deploy button, manual steps, Supabase auth config, keep-alive setup
- Files touched: .gitignore, .github/workflows/keep-alive.yml, README.md
