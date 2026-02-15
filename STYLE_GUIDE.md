# Tailwind Style Guide

## Naming rules
- Prefer semantic component classes over long inline utility chains.
- Use short, reusable class names for component primitives:
  - `panel`, `card`, `btn`, `tab`, `badge`, `field`, `table`, `pagination`
- Use modifier naming for variants:
  - `btn-primary`, `btn-secondary`
  - `tab-active`
  - `badge-neutral`
- Keep project-specific classes prefixed by feature scope when needed (`callback-*`, `sms-*`, `pds-*`).

## Inline utility rule
- **Do not exceed 6 inline utility classes on a single element.**
- Enforced by `npm run check:classes`.
- If an element needs more than 6 utility classes, extract to semantic component classes in `@layer components`.

## When to use `@apply`
Use `@apply` when:
- The same utility combination appears 2+ times.
- A class group describes a clear component primitive (button, panel, field, tab, badge, table cell, pagination).
- The class set exceeds the 6-utility inline limit.

Keep inline utilities only for:
- One-off, local adjustments (<= 6 utilities).
- Highly contextual spacing/alignment not reused elsewhere.

## Initial semantic component list
Defined in `src/input.css` under `@layer components`:
- `panel`
- `card`
- `btn`, `btn-primary`, `btn-secondary`
- `tab`, `tab-active`
- `badge`, `badge-neutral`
- `field`
- `table`, `table-row-interactive`, `table-cell`
- `pagination`
