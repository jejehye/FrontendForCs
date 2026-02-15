# HTML Audit Report

## Scope
- Source templates and static pages under `src/*.html` and `src/pages/*.njk`.
- Quick baseline count across `src` and `dist` for `*.html`/`*.njk` files.

## Commands used
- `rg --files src dist | rg '\\.(html|njk)$' | wc -l`
- `rg -n 'class="fa-[^"]*(text-|mr-|ml-|mt-|mb-|shinhan-text)[^"]*"' src/*.html src/pages/*.njk | wc -l`
- `rg -n '<div[^>]*class="[^"]*[0-9][^"]*"' src/*.html src/pages/*.njk | wc -l`
- `rg -n 'class="fa-[^"]*(text-|mr-|ml-|mt-|mb-|shinhan-text)[^"]*"' src/*.html src/pages/*.njk | cut -d: -f1 | sort | uniq -c | sort -nr | head -n 10`
- `rg -n '<div[^>]*class="[^"]*[0-9][^"]*"' src/*.html src/pages/*.njk | cut -d: -f1 | sort | uniq -c | sort -nr | head -n 10`

## Results summary
- Total HTML/NJK files scanned: **31**
- `fa-*` icon classes mixed with utility tokens (`text-*`, `mr-*`, `ml-*`, `shinhan-text`, etc.): **210** matches
- `<div class="...">` attributes containing numeric utility tokens (`p-4`, `mb-2`, `gap-3`, `grid-cols-6`, etc.): **392** matches

## Highest concentration files
### Font Awesome + utility combos
1. `src/main.html` — 42
2. `src/pds.html` — 38
3. `src/pages/pds.njk` — 38
4. `src/chat.html` — 32
5. `src/sms.html` — 28
6. `src/pages/sms.njk` — 28

### `<div>` numeric utility tokens
1. `src/pages/pds.njk` — 97
2. `src/pds.html` — 96
3. `src/main.html` — 89
4. `src/pages/sms.njk` — 42
5. `src/sms.html` — 36
6. `src/chat.html` — 32

## Notes
- Callback page cleanup has already reduced most targeted patterns there; only a small number remains compared to other pages.
- If desired, the next step can be done page-by-page in this order for maximum impact: **main -> pds -> sms -> chat**.
