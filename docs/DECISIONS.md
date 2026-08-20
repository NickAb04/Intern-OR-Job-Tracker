# DECISIONS.md

## 2026-08-11 — Supabase over separate Postgres + Auth0
Bundling DB/Auth/Storage under one free account reduces moving parts for a solo build.
Tradeoff accepted: free-tier project pauses after 7 days idle.

## 2026-08-11 — Archive over hard delete as the primary action
Data volume is small enough that "less DB bloat" doesn't outweigh reversibility.
Hard delete kept only as a rare, confirmed-only escape hatch from the Archived view.

## 2026-08-11 — Days elapsed measured from latest status change, not date applied
Chosen so the number reflects "how long since anything happened" rather than
just tenure since submission.

## 2026-08-11 — Pin placement is click-to-place, no geocoding in v1
Map is fully self-contained — user clicks on the map to place a pin.
No geocoding dependency, API key, or external service needed.

## 2026-08-11 — Multi-user with RLS from day one
Each account's applications are private, enforced at the database level via
Supabase Row Level Security, not just hidden in the UI.

## 2026-08-11 — Stats dashboard deferred to post-MVP
Build after the core map/sidebar/table workflow is solid (roadmap phase 8).

## 2026-08-11 — All §6 feature additions approved
job_posting_url, notes field, table page, clustering, CSV export, toasts, tooltips.

## 2026-08-11 — Big-scope items explicitly excluded
Email reminders, resume attachments, browser extension — not in scope for this project.

## 2026-08-11 — Same-company reapplications are separate pins
Not threaded under one pin — each application to the same company gets its own pin.

## 2026-08-11 — 8-status system finalized
KIV, Applied, Interview, Offer, Accepted, Rejected, Ghosted, Withdrawn.
Each with hover tooltip (~1.5s delay) and tap-popover fallback on touch.

## 2026-08-11 — Clean/minimal design tone
Recruiter-facing aesthetic, not flashy.

## 2026-08-11 — Cross-platform dev environment
Pop!_OS 24.04 + Windows 11 — Volta + pnpm, hosted Supabase only (no local Docker),
normalized line endings via .gitattributes.

## 2026-08-11 — Geographic scope: Malaysia
Map defaults to KL/Klang Valley. Any future geocoding stays Malaysia-scoped.

## 2026-08-14 — MapLibre GL v6 uses named exports only
maplibre-gl v6 dropped the default export. Import as `import { Map, Popup, ... } from "maplibre-gl"`.
Also requires `@types/geojson` for `GeoJSON.FeatureCollection` type.
`attributionControl` no longer accepts `true` — omit it (defaults to showing attribution).

## 2026-08-14 — OpenFreeMap: positron (light) + dark styles, no API key
Free vector tiles from openfreemap.org. Styles switch with theme via `map.setStyle()`.
Source/layers must be re-added after `style.load` since setStyle destroys them.

## 2026-08-21 — MapLibre must be dynamically imported in Next.js
MapLibre GL JS accesses `window`/`document` at import time. Even with `"use client"`,
Next.js SSR-renders the component before hydration. Use `await import("maplibre-gl")`
inside `useEffect`; only `import type` is safe at the top level.
The map container also needs `position: absolute; inset: 0` (not `h-full`) for a
guaranteed pixel height at MapLibre's synchronous initialization time.
