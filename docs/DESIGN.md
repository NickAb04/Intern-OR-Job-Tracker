# DESIGN.md

## Theme
Clean / minimal, recruiter-facing aesthetic. Tailwind + shadcn "nova" preset (Base UI).
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
shadcn Tooltip, delayDuration={1500}ms, used on every status badge/dropdown option.
Touch fallback: tap opens the same text in a small popover.

## Map style
OpenFreeMap "positron" (light) / a dark-matched style for dark mode.
Default viewport: Kuala Lumpur / Klang Valley, zoom ~10.

## Motion
Sidebar: slide-in from right, 200ms ease-out.
Floating list: draggable, spring physics, constrained to viewport.
