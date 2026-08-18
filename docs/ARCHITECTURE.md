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
