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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
