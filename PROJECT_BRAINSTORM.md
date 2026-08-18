# Internship/Job Application Tracker — Full Brainstorm & Build Plan

**Status: Finalized — ready for implementation.** All open questions from the brainstorming phase are resolved (see §11). This file is the source-of-truth spec — hand it directly to your coding agent alongside `AGENTS.md` (§8) to start building.

*Save this file. Once the repo exists, fold the relevant sections into the real `docs/` and `ai/` files described in §8 rather than treating this as permanent documentation.*

---

## 1. Product Summary

A multi-user, authenticated web app where each user drops a pin on a map for every job/internship they apply to. Clicking a pin opens a detail panel showing the application's type, status, history, and metadata. A draggable floating list gives a quick text overview without leaving the map. Supports light/dark mode and is deployed for free so you can link it from your portfolio site.

**Users:** multi-user — anyone can create an account; each account's applications are private to them (enforced at the database level via Row Level Security, not just hidden in the UI).

**Geographic scope:** built for Malaysia. The map defaults to a Malaysia-centered view, and any future location-lookup feature stays scoped to Malaysia rather than global — see §3.1 and §11.

---

## 2. Recommended Tech Stack — Approved

I optimized for three things simultaneously: **(a)** genuinely modern/industry-recognized choices that look good on a resume, **(b)** $0 cost at your scale, **(c)** low operational complexity for a solo dev. Free-tier terms checked as of Aug 2026 rather than assumed.

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript + React 19** | The default modern full-stack React choice; one framework covers frontend + backend (API routes/Server Actions), which keeps a solo project manageable. Extremely common in job postings. |
| Styling / UI kit | **Tailwind CSS + shadcn/ui** | shadcn gives you accessible, unstyled-but-polished components (dialogs, dropdowns, tables, tooltips) you own the code for — no black-box dependency. Pairs natively with Tailwind's dark-mode classes. |
| Dark/Light mode | **next-themes** | Tiny library, handles system-preference detection + persistence + no flash-of-wrong-theme. Standard pairing with shadcn. |
| Map engine | **MapLibre GL JS** | Open-source (BSD-licensed) fork of Mapbox GL from before Mapbox went closed-source. GPU-accelerated vector rendering, smooth zoom/pan, built-in clustering support. Loads from your own bundle — not billed per map load like Google Maps. |
| Map tiles | **OpenFreeMap** (primary) | Confirmed as of 2026: free, unlimited vector tiles built on OpenStreetMap data, MIT-licensed, no API key or signup required at all. Attribution is auto-added by MapLibre. MapTiler's free tier (~100k loads/month) is a drop-in fallback if ever needed. |
| Geocoding (optional, future) | **Nominatim** (OpenStreetMap) | Not used in v1 — pin placement is click-to-place (§3.1), so no geocoding dependency exists at all right now. If a "search to fly the map to a city" convenience is ever added, bias/restrict it to Malaysia (`countrycodes=my`) rather than global. |
| Backend | **Next.js Route Handlers + Server Actions** | No separate backend service needed. Server Actions are the current idiomatic way to handle form mutations in Next.js. |
| Database | **Supabase (Postgres)** | Confirmed free tier (2026): 500MB DB, 1GB file storage, 50k MAUs, unlimited API requests, 2 projects per org. Bundles DB + Auth + file storage under one free account. **Caveat:** free Supabase projects auto-pause after 7 days with zero traffic (cold-starts in ~30s on next request) — mitigation in §9. |
| DB client | **Supabase JS client + generated TypeScript types** (`supabase gen types typescript`) | Simplest path — no separate ORM to configure. Prisma is a fine swap-in later if you want that on your resume, but adds a layer over something Supabase already types for you. |
| Auth | **Supabase Auth** | Email/password + optional Google/GitHub OAuth on the same free project. Postgres **Row Level Security (RLS)** scopes every row to its owner at the database level — required from day one given the multi-user decision (§11). |
| Client data fetching/caching | **TanStack Query (React Query)** | The map view is a client-heavy interactive component; gives you caching + optimistic updates when flipping a pin's status without a full page reload. |
| Local UI state | **Zustand** | Sidebar open/closed, which pin is selected, the floating list's drag position — anything that isn't server data. |
| Animation / drag | **Motion (formerly Framer Motion)** | `drag` + `dragConstraints` for the floating list; also gives sidebar slide-in/out transitions essentially for free — reads well in a portfolio demo video. |
| Icons | **lucide-react** | Standard icon set for the shadcn ecosystem. |
| Charts (stats page, stretch) | **Recharts** | Standard React charting lib for the deferred dashboard (§6, §10 phase 8). |
| Hosting | **Vercel (Hobby plan)** | Confirmed free-forever for non-commercial personal projects (Aug 2026): 100GB bandwidth, ~1M function invocations/edge requests, auto HTTPS, free `.vercel.app` subdomain to link from your site. |
| Version control / CI | **GitHub + Vercel's git integration** | Push to `main` → auto-deploy. Public repo doubles as a portfolio link. |
| Optional: file uploads (avatar) | **Supabase Storage** | Included free (1GB) in the same project. |

**Net monthly cost: $0.** The only realistic future cost is Supabase Pro ($25/mo) if you ever need it to never sleep — not needed to start.

---

## 3. Development Environment & Cross-Platform Setup

You're developing across **Pop!_OS 24.04 (Linux)** and **Windows 11**, so a few defaults are chosen specifically to avoid cross-platform friction:

- **Node version manager: Volta.** Works identically on Linux and Windows (unlike `nvm`, which needs a separate Windows-specific port with slightly different behavior). Pin Node/npm versions in `package.json`'s `volta` field so both machines always use the exact same version without manual syncing.
- **Package manager: pnpm.** Fast, disk-efficient, solid native Windows support today. Plain `npm` is a zero-setup fallback if pnpm ever causes friction on one machine — either works with this stack.
- **Skip local Docker-based Supabase.** The Supabase CLI can run a full local Postgres+Auth stack via Docker, but Docker Desktop setup (especially the WSL2 backend on Windows) is its own source of cross-platform pain for little benefit at this scale. Recommendation: develop directly against your one free hosted Supabase project from both machines. You lose a fully local dev database, but avoid Docker setup entirely. Revisit only if you need to safely test destructive schema changes.
- **Line endings.** Add a `.gitattributes` file with `* text=auto eol=lf` so Git normalizes line endings to LF regardless of which OS committed the file — avoids noisy diffs when switching machines.
- **`package.json` scripts.** Keep them plain Node/Next.js CLI calls (`next dev`, `next build`, etc.) — these run identically in bash (Pop!_OS) and PowerShell (Windows) because they're Node binaries, not shell scripts. Avoid bash-only syntax (`rm -rf`, `export X=`); use `rimraf` and `cross-env` if you ever need OS-agnostic file deletion or env vars.
- **Editor.** VS Code works identically on both OSes. Commit `.vscode/settings.json` + a recommended-extensions list (ESLint, Prettier, Tailwind CSS IntelliSense) so both machines get the same setup automatically.
- **Env vars.** `.env.local` (Next.js's standard, gitignored) behaves identically on both OSes.

---

## 4. Core Feature Breakdown

### 4.1 Map view (main screen)
- Full-bleed MapLibre map behind the nav bar, OpenFreeMap "positron" or "liberty" style (light/dark-matched to your theme toggle).
- **Default viewport:** centered on Kuala Lumpur / Klang Valley (3.1390° N, 101.6869° E), zoom ~10, for a new user with no pins yet. Once a user has pins, fit the map bounds to their existing pins instead.
- **Adding a pin — click-to-place:** an "Add pin" mode/button puts the map into a placement state; the next click drops a pin at that exact spot and opens the creation form pre-filled with those coordinates. No geocoding dependency for v1 — the map is fully self-contained.
- **Pin creation form** (modal or side panel):
  1. Application type — `Internship / Full-time / Contract / Part-time` (select)
  2. Status — 8 options, each with a hover tooltip (see §4.4 for the full list + descriptions)
  3. Date applied (date picker)
  4. *Days elapsed* — **computed, not entered.** Calculated live as `today − most recent status-change date` (not the original application date — see §11).
  5. Company name + job role/title (text)
  6. Applied via — `Email / JobStreet / LinkedIn / Company website / Referral / Other`
  7. `job_posting_url` (optional link), `notes` (optional free text) — see §4.4/§6
- **Pins are color-coded by current status** — see the table in §4.4 for the exact mapping.
- **Clustering:** when zoomed out and multiple applications sit close together, MapLibre's built-in `cluster: true` GeoJSON source groups them into a numbered bubble that expands on click/zoom. Needed once you have >15–20 pins.

### 4.2 Sidebar (pin detail view)
Clicking a pin slides in a side panel (Motion slide transition) showing:
- Company name, role, application type, "applied via", job posting URL, notes — editable inline.
- **Status changer** — a dropdown/select with the same hover-tooltip descriptions as the creation form; changing it appends a new row to the history table rather than overwriting.
- **History table** — scrollable, reverse-chronological: `status | date | optional note`. Auto-seeded with one row ("Applied", date_applied) at creation.
- Days elapsed (live, since most recent status change).
- **Archive** (primary action) — removes the application from the default map/list/table view but keeps all data and history intact; reversible from an "Archived" filter/view.
- **Delete** (secondary, rare) — a true hard delete, reachable only from the Archived view with a confirmation prompt. Exists as an escape hatch for genuine mistakes (e.g. an accidental duplicate pin), not for routine cleanup — archiving is the everyday action.

### 4.3 Floating draggable list
- A small, semi-transparent card overlaid on the map (not a full sidebar), listing all applications as compact rows: `Company — Status badge`.
- Draggable anywhere on screen via Motion's `drag` (constrained to the viewport).
- Collapsible to a small pill/icon so it never permanently blocks the map.
- Clicking a row pans/flies the map to that pin and opens its sidebar.
- Search/filter box inside it once you have more than a handful of applications.

### 4.4 Status list (final — 8 statuses, each with a hover-tooltip description)

Tooltips appear after a ~1.5 second hover delay (shadcn/Radix `Tooltip`, `delayDuration={1500}`) wherever a status is shown — pins, badges, dropdown options, table rows. On touch devices, where hover doesn't exist, tapping a status badge shows the same description in a small popover instead, so the explanation isn't lost on mobile.

| Status | Color | Tooltip description |
|---|---|---|
| **KIV** | slate / grey | "Company has acknowledged your application but hasn't progressed or rejected it — you're on hold." |
| **Applied** | blue | "Application submitted; awaiting a response from the company." |
| **Interview** | amber | "You've been invited to interview (any round)." |
| **Offer** | violet/purple | "Company has extended a job offer, pending your decision." |
| **Accepted** | green | "You accepted the offer — process complete." |
| **Rejected** | red | "Company explicitly declined your application." |
| **Ghosted** | muted rose/stone | "No response for an extended period despite the process being ongoing." |
| **Withdrawn** | neutral grey (distinct shade from KIV) | "You pulled out of the process yourself." |

### 4.5 Standard site shell
- **Top nav bar:** app logo/name · Map (home) · Applications table page (§6) · theme toggle · avatar dropdown (Profile / Settings / Log out). Dashboard link added later once §10 phase 8 is built.
- **Auth:** Supabase Auth — email/password to start; Google/GitHub OAuth as a cheap add-on once basic auth works.
- **Profile page:** name, email, avatar, account deletion.
- **Light/dark mode:** toggle in the nav, persisted via `next-themes`, respects system preference by default.

---

## 5. Data Model

One application-per-pin, company as a plain text field rather than a normalized `Company` table (you may legitimately apply to the same company twice for different roles — confirmed as separate pins, §11 — which a pure company table would complicate).

```
User (managed by Supabase Auth)
├─ id, email, display_name, avatar_url, created_at

Application
├─ id (uuid)
├─ user_id (fk → auth.users, RLS-scoped)
├─ company_name (text)
├─ job_role (text)
├─ application_type (enum: internship | full_time | contract | part_time)
├─ current_status (enum: kiv | applied | interview | offer | accepted | rejected | ghosted | withdrawn)
├─ applied_via (enum: email | jobstreet | linkedin | company_website | referral | other)
├─ date_applied (date)
├─ latitude, longitude (float — pin location)
├─ location_label (text — human-readable, e.g. "Google Kuala Lumpur")
├─ job_posting_url (text, nullable)
├─ notes (text, nullable)
├─ archived (boolean, default false)
├─ created_at, updated_at (timestamps)

StatusHistory
├─ id (uuid)
├─ application_id (fk → Application)
├─ status (enum, same as above)
├─ changed_at (timestamp)          -- "days elapsed" is computed from the most recent row here
├─ note (text, nullable)
```

One row is inserted into `StatusHistory` automatically whenever `Application.current_status` changes (including the initial "applied" row at creation) — this is what powers both the scrollable history table and the "days elapsed" calculation.

---

## 6. Confirmed Feature Additions

These were originally flagged as suggestions beyond your spec — all approved and now in scope:

- **`job_posting_url`** — link back to the original listing.
- **`notes`** field — freeform text (interview prep, gut feelings, recruiter name).
- **Archive over hard delete** as the primary removal action (§4.2) — decided: with this little data volume the "less DB bloat" argument for hard-delete doesn't really apply, so archiving's reversibility wins. A rare hard-delete escape hatch still exists for genuine mistakes.
- **A dedicated `/applications` table page** — sortable/filterable spreadsheet-style view alongside the map, for scanning by status/date once you have many entries. Complements, doesn't replace, the floating list.
- **Pin clustering** (§4.1) — budgeted into the build now, not bolted on later.
- **CSV export** — one button, dumps applications to a spreadsheet.
- **Toast notifications** (e.g. `sonner`) for actions like "Status updated" / "Application archived".
- **Status hover tooltips** (§4.4).

**Explicitly excluded from this project** (bigger scope jump, not worth it here):
- Email/reminder notifications for follow-ups.
- Resume/file attachments per application.
- Browser extension for one-click "log this application."

**Deferred, not excluded** — build after the MVP works, not in the first pass:
- **Stats/dashboard page** — total applied, breakdown by status (pie chart), response rate, applications-over-time line chart. See roadmap §10, phase 8.

---

## 7. Architecture / Suggested Folder Structure

```
/app
  /(auth)/login, /(auth)/signup
  /(app)/map/page.tsx            -- main map view
  /(app)/applications/page.tsx   -- table view
  /(app)/dashboard/page.tsx      -- stats (built in phase 8, not v1)
  /(app)/profile/page.tsx
  /api/... (route handlers, if needed beyond Server Actions)
/components
  /map (MapLibre wrapper, PinLayer, ClusterLayer)
  /sidebar (ApplicationDetail, StatusHistoryTable, StatusChanger)
  /floating-list (DraggableList, ListItem)
  /ui (shadcn components, incl. StatusTooltip)
/lib
  /supabase (client + server clients, generated types)
  /geocode (stretch-only, not v1 — Nominatim wrapper for future "fly to city" search, Malaysia-biased)
  /queries (React Query hooks: useApplications, useUpdateStatus, ...)
/docs        -- see §8
/ai          -- see §8
```

---

## 8. AI Context Management Files

Since you'll likely be pair-building this with an AI coding assistant over many sessions, these files exist so the AI doesn't re-derive (or contradict) past decisions every time. Purpose + a starter skeleton for each:

### `AGENTS.md` — *How the AI should behave*
```markdown
# AGENTS.md

## Stack
Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase + MapLibre GL JS.
Package manager: pnpm. Node via Volta. Developed across Pop!_OS 24.04 and Windows 11 — keep
all scripts and tooling cross-platform (no bash-only syntax in package.json scripts).

## Conventions
- Server Actions for mutations; Route Handlers only when a Server Action doesn't fit.
- All DB access goes through /lib/supabase — never instantiate a client elsewhere.
- All new tables must have RLS policies before being used from the client.
- Use existing shadcn components before adding a new UI dependency.
- "Days elapsed" is always computed from the latest StatusHistory row, never date_applied.
- Archive is the default removal action; hard delete is a rare, confirmed-only escape hatch.

## Before making changes
- Check docs/DECISIONS.md before reversing a past architectural choice.
- Check ai/CONTEXT.md for current in-progress work before starting something new.

## After making changes
- Append an entry to ai/PATCHLOG.md (what changed, why, files touched).
- If a non-trivial decision was made, log it in ai/DISCUSSION.md or docs/DECISIONS.md.

## Never
- Never commit secrets/.env values.
- Never bypass RLS with the service-role key from client-side code.
```

### `docs/ARCHITECTURE.md` — *How the codebase works*
```markdown
# ARCHITECTURE.md

## High-level flow
Map page (client component) ↔ TanStack Query cache ↔ Server Actions ↔ Supabase (Postgres + RLS)

## Key modules
- /components/map — MapLibre instance, pin layer, cluster layer
- /components/sidebar — detail panel, driven by `selectedApplicationId` in Zustand store
- /components/floating-list — draggable overview, shares the same query cache as the map

## State ownership
- Server state (applications, history) → TanStack Query
- UI-only state (sidebar open, selected pin, list position) → Zustand
- Theme → next-themes

## Auth
Supabase Auth (email/password [+ OAuth]). RLS policies scope every table to auth.uid().
```

### `docs/REQUIREMENTS.md` — *What we're building*
This document (PROJECT_BRAINSTORM.md) §4–6 in full — copy them over as the initial source of truth for in-scope/out-of-scope.

### `docs/DESIGN.md` — *Visual/UI consistency*
```markdown
# DESIGN.md

## Theme
Clean / minimal, recruiter-facing aesthetic. Tailwind + shadcn "new-york" style.
Light/dark via next-themes, class strategy.

## Status color mapping (keep consistent everywhere: pins, badges, table rows, tooltips)
- KIV — slate/grey
- Applied — blue
- Interview — amber
- Offer — violet/purple
- Accepted — green
- Rejected — red
- Ghosted — muted rose/stone
- Withdrawn — neutral grey (distinct shade from KIV)

## Tooltips
shadcn/Radix Tooltip, delayDuration={1500}ms, used on every status badge/dropdown option.
Touch fallback: tap opens the same text in a small popover.

## Map style
OpenFreeMap "positron" (light) / a dark-matched style for dark mode.
Default viewport: Kuala Lumpur / Klang Valley, zoom ~10.

## Motion
Sidebar: slide-in from right, 200ms ease-out.
Floating list: draggable, spring physics, constrained to viewport.
```

### `docs/DECISIONS.md` — *Why things were built this way*
Seed with the rows from §11 of this document, formatted as dated entries, e.g.:
```markdown
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
```

### `ai/CONTEXT.md` — *Current state / important context*
```markdown
# CONTEXT.md (last updated: ...)

## Where things stand
- Auth: done / in progress / not started
- Map + pin creation: ...
- Sidebar: ...
- Floating list: ...

## Active blockers / open questions
- (none outstanding as of the brainstorm handoff — see docs/REQUIREMENTS.md)

## Do not touch right now
- (e.g. "status enum is being reworked, don't build features on top of it yet")
```

### `ai/PATCHLOG.md` — *What the AI changed*
```markdown
# PATCHLOG.md

## 2026-XX-XX
- Added: pin clustering on map view (components/map/ClusterLayer.tsx)
- Files touched: lib/supabase/types.ts, components/sidebar/StatusChanger.tsx
```

### `ai/DISCUSSION.md` — *Decisions/discussions that shouldn't be forgotten*
```markdown
# DISCUSSION.md

## Status list: 6 vs 8 statuses
Original spec had 6. Added Offer (distinct from Accepted, in case an offer is declined)
and Withdrawn (candidate pulled out). Decided 2026-08-11 — final list is 8, see docs/DESIGN.md.
```

---

## 9. Cost Summary

| Service | Free tier (confirmed Aug 2026) | Cost at your scale |
|---|---|---|
| Vercel Hobby | 100GB bandwidth, ~1M invocations/mo, non-commercial only | $0 |
| Supabase Free | 500MB DB, 1GB storage, 50k MAU, pauses after 7 days idle | $0 |
| OpenFreeMap | Unlimited vector tiles, no key | $0 |
| GitHub | Public repo | $0 |
| Nominatim (not used in v1) | Free if added later as a Malaysia-scoped stretch feature | $0 |

**Total: $0/month.** The one operational quirk worth planning for is Supabase's 7-day idle pause — for a portfolio link, add a free scheduled ping (e.g. a GitHub Actions cron hitting a lightweight API route every few days) so it's never cold when a recruiter clicks it.

---

## 10. Phased Build Roadmap

1. **Scaffold** — Next.js + Tailwind + shadcn init, GitHub repo, Vercel project linked, Supabase project created, `.gitattributes`/Volta/pnpm set up, seed the `docs/` and `ai/` files (§8).
2. **Auth + shell** — Supabase Auth wired up, RLS enabled from the start, protected routes, top nav, theme toggle, empty Profile page.
3. **Data layer without the map** — Application + StatusHistory tables, a plain form + table page to create/list/edit applications. Validates the data model (incl. the 8-status enum) before map complexity is layered on.
4. **Map integration** — MapLibre + OpenFreeMap, default Malaysia viewport, render existing applications as pins, click-to-view sidebar (read-only first).
5. **Pin creation flow** — click-to-place mode, creation form, status changer writing to StatusHistory, status tooltips.
6. **Floating draggable list** — synced to the same data as the map/table.
7. **Polish** — clustering, dark map style, toasts, CSV export, archive/delete flow, responsive/mobile pass (incl. tap-tooltip fallback).
8. **Stretch** — stats dashboard, resume attachments, OAuth providers, browser extension — only if you want to keep going after the MVP is solid.
9. **Ship** — polish README, add a demo GIF/video, link from your portfolio site.

---

## 11. Confirmed Decisions Log

The full record of every decision made during brainstorming, consolidated:

| # | Decision | Answer |
|---|---|---|
| 1 | Pin placement | Click exact spot on the map — no geocoding dependency in v1 |
| 2 | User model | Multi-user, private per account — Supabase Auth + RLS required from day one |
| 3 | Stats dashboard | Deferred — build after the MVP, roadmap phase 8 |
| 4 | §6 feature additions | All approved (job URL, notes, table page, clustering, CSV export, toasts, tooltips) |
| 5 | Big-scope items | Email reminders, resume attachments, browser extension — explicitly excluded from this project |
| 6 | Archive vs. delete | Archive is the primary action; hard delete is a rare, confirmed-only escape hatch reachable from the Archived view |
| 7 | Same-company reapplications | Separate pins, not threaded under one pin |
| 8 | Days-elapsed baseline | Since the most recent status change (not since date applied) |
| 9 | Status list | 8 statuses — KIV, Applied, Interview, Offer, Accepted, Rejected, Ghosted, Withdrawn — each with a hover tooltip (~1.5s delay), tap-popover fallback on touch |
| 10 | Design tone | Clean / minimal |
| 11 | Dev environment | Cross-platform: Pop!_OS 24.04 + Windows 11 — Volta + pnpm, hosted Supabase only (no local Docker), normalized line endings |
| 12 | Geographic scope | Malaysia — map defaults to Kuala Lumpur/Klang Valley; any future geocoding stays Malaysia-scoped, not global |

No open questions remain. This document is ready to seed `docs/REQUIREMENTS.md`, `docs/DECISIONS.md`, and `docs/DESIGN.md` and hand off to your coding agent.
