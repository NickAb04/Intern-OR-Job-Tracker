# CONTEXT.md (last updated: 2026-08-19)

## Where things stand
- Auth: done — Supabase email/password login/signup, middleware route protection
- Data layer: done — Application + StatusHistory tables (schema.sql), Server Actions, TanStack Query hooks
- Applications table page: done — full CRUD, search, filter, sort, CSV export, archive/restore/delete
- Map: done — MapLibre GL JS + OpenFreeMap, status-colored pins, clustering, hover popups, theme switching
- Pin creation: done — click-to-place mode, coordinates captured, creation dialog with pre-filled lat/lng
- Sidebar: done — slide-in detail panel with status changer, history, metadata, archive
- Floating list: done — collapsible overlay on map, search, click-to-fly-to, synced data
- Stats dashboard: done — metric cards, status donut, timeline area chart, applied-via bar chart, type progress bars, rejection insight
- Nav: done — responsive top nav with mobile hamburger menu, 3 sections (Map, Applications, Stats)
- Deployment: ready — .gitignore fixed, keep-alive cron, README with deploy instructions
- Profile page: basic — shows user info, no editing yet

## Active blockers / open questions
- (none — all phases complete)

## Do not touch right now
- (nothing blocked)
