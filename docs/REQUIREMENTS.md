# REQUIREMENTS.md

Source: PROJECT_BRAINSTORM.md §4–6. This is the source-of-truth for in-scope/out-of-scope features.

---

## Core Features

### Map View (main screen)
- Full-bleed MapLibre map behind the nav bar, OpenFreeMap "positron" or "liberty" style (light/dark-matched to theme toggle).
- **Default viewport:** centered on Kuala Lumpur / Klang Valley (3.1390° N, 101.6869° E), zoom ~10, for a new user with no pins yet. Once a user has pins, fit the map bounds to their existing pins instead.
- **Adding a pin — click-to-place:** an "Add pin" mode/button puts the map into a placement state; the next click drops a pin at that exact spot and opens the creation form pre-filled with those coordinates. No geocoding dependency for v1.
- **Pin creation form** (modal or side panel):
  1. Application type — `Internship / Full-time / Contract / Part-time` (select)
  2. Status — 8 options, each with a hover tooltip (see Status List below)
  3. Date applied (date picker)
  4. *Days elapsed* — computed live as `today − most recent status-change date`
  5. Company name + job role/title (text)
  6. Applied via — `Email / JobStreet / LinkedIn / Company website / Referral / Other`
  7. `job_posting_url` (optional link), `notes` (optional free text)
- **Pins are color-coded by current status.**
- **Clustering:** MapLibre's built-in `cluster: true` GeoJSON source groups nearby pins into numbered bubbles.

### Sidebar (pin detail view)
Clicking a pin slides in a side panel showing:
- Company name, role, application type, "applied via", job posting URL, notes — editable inline.
- **Status changer** — a dropdown with hover-tooltip descriptions; changing it appends a new row to the history table.
- **History table** — scrollable, reverse-chronological: `status | date | optional note`. Auto-seeded with one row ("Applied", date_applied) at creation.
- Days elapsed (live, since most recent status change).
- **Archive** (primary action) — removes from default view but keeps data intact; reversible.
- **Delete** (secondary, rare) — hard delete from Archived view only, with confirmation.

### Floating Draggable List
- Small, semi-transparent card overlaid on the map listing all applications as compact rows.
- Draggable anywhere on screen via Motion's `drag`.
- Collapsible to a small pill/icon.
- Clicking a row pans/flies the map to that pin and opens its sidebar.
- Search/filter box inside it.

### Status List (8 statuses)
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

Tooltips: shadcn/Radix Tooltip, `delayDuration={1500}`, hover on desktop, tap-popover on touch.

### Site Shell
- **Top nav bar:** app logo/name · Map (home) · Applications table page · theme toggle · avatar dropdown (Profile / Settings / Log out). Dashboard link added later.
- **Auth:** Supabase Auth — email/password + optional Google/GitHub OAuth.
- **Profile page:** name, email, avatar, account deletion.
- **Light/dark mode:** toggle in nav, persisted via `next-themes`, respects system preference.

---

## Confirmed Feature Additions
- `job_posting_url` — link back to the original listing.
- `notes` field — freeform text.
- Archive over hard delete as primary removal action.
- Dedicated `/applications` table page — sortable/filterable spreadsheet-style view.
- Pin clustering.
- CSV export.
- Toast notifications (sonner).
- Status hover tooltips.

## Explicitly Excluded
- Email/reminder notifications for follow-ups.
- Resume/file attachments per application.
- Browser extension for one-click application logging.

## Deferred (post-MVP)
- Stats/dashboard page (total applied, breakdown by status, response rate, applications-over-time).
