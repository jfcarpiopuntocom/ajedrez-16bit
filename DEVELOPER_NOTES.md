# Developer Notes — ElMultiVersoDelAjedrez (index.html)

Single-file HTML game (~3900+ lines). This doc exists so future edits don't accidentally
break a system whose purpose isn't obvious from the code alone, or rediscover a bug that
was already fixed once. Read this before touching anything listed below. Matching inline
comments live in the HTML itself (search for "DEV NOTE" or the system name).

## Core concepts — don't break these

### matchCode / boardCode / the Multiverse
- `matchCode`: 6-char NES-style code identifying ONE specific game (e.g. `9Q99CCA`). Stored
  in `location.hash` as `#multiverso=CODE` so any link/refresh can resume that exact match.
- `boardCode` / `myPid`: permanent per-device identity, separate from matchCode. Survives
  across many different matches.
- Side codes = `matchCode + 'A'` (Azul) or `matchCode + 'R'` (Rojo) — lets each side resume
  independently from the same shared game.
- `matchLineage`: array tracking fork/takeover genealogy. Every `forkMultiverse()` call and
  every AI→online takeover appends an entry here. This is what powers the "Genealogía" UI in
  the Guardar panel. Don't clear or reset this array casually — it's the whole point of the
  Multiverse concept (every game is a timeline that can branch from any position).
- `forkMultiverse(mi)`: takes a FEN from any published position and starts a brand new
  independent matchCode + AI game from it. This already does everything a "branch a new
  timeline" feature needs — don't rebuild it from scratch if asked for branching/forking UI.

### Identity & credit (`myPseudo` / `myPid` / `myTag`)
- `myPseudo`: fantasy pseudonym (always present).
- `myTag`: optional real name/iniciales, user-entered, for credit/ownership pride.
- `creditName(name, tag)`: the ONE place that formats "Name (Tag)" vs just "Name". Always use
  this helper instead of concatenating name+tag manually — it's threaded through network
  messages, saveMatch data, PGN headers, takeover badges, lineage entries, and the lobby UI.
  If you add a new place that displays a player's name, route it through `creditName()`.

### Persistence (triple-redundant, intentional)
- localStorage + IndexedDB + a 2-year cookie, all writing the same identity/match data.
  This redundancy is deliberate — don't "simplify" it down to just one. Mobile Safari in
  particular is allowed to silently evict localStorage; the cookie is the fallback of last
  resort.
- Firebase Realtime DB syncs across devices. Config lives in gitignored `firebase-config.js`
  — never commit real keys, never echo them in chat/commits.

### Victory/Draw veil vs. Undo/Redo (fixed 2026-06-20, don't regress)
`showVictory()`/`showDraw()` auto-open 600ms after the game ends and visually sit ON TOP of
the HUD's Deshacer/Rehacer buttons (same z-index stack). **Any handler that needs to act on
the board after game-over MUST call `hideVictory()` first**, or the click silently lands on
the veil's backdrop instead of reaching the board/HUD beneath it. This bit us once already —
undo looked completely broken after checkmate when it was actually never being reached.

### "Nueva Partida" = full reload, not manual state reset (fixed 2026-06-20, don't regress)
`backToStart()` still exists for internal use (rematch flow, etc.) but the `#newgame` button
no longer calls it directly. Manually resetting ~15 hand-picked flags (mode, net, busy,
timers, the stockfish worker, peer connections, audio loops...) is a losing game — every new
feature adds one more piece of state that a manual reset function will eventually forget to
clear, causing hangs or wrong-screen bugs (worse on mobile). **If you add a new top-level
mode, system, worker, or long-lived timer/interval, you do NOT need to teach `backToStart()`
about it** — the reload path already guarantees a clean slate. Don't "optimize" Nueva Partida
back into an in-place reset; the whole point was eliminating that entire bug category.
Remember to clear `location.hash` before reloading, or it'll auto-resume the match being left.

### Mobile layout: scroll is now ALLOWED outside zoom mode (changed 2026-06-20)
The historic rule was "no scroll, ever, on mobile" — JFC explicitly broke that rule for the
in-game view: `@media (max-width:899px)` now sets `overflow-y:auto` and lets `.app` grow
past 100vh instead of force-shrinking the board (`ensureNoScroll()` is a no-op in that range
now). Zoom/focus mode (`body.focusmode`) is exempt and keeps the original tight no-scroll
fit via `!important` height rules — that distinction is intentional, not a bug. The splash
screen (`.start`) has its own separate fixed/no-scroll layout, untouched by this change.

### Tutorial board: grid-cell math, not raw pixels (fixed 2026-06-20, don't regress)
The 4x4 demo board in the FF-style intro tutorial resizes between 200px (desktop) and 160px
(`@media max-width:480px`). Piece positions are computed from `SQ = board.clientWidth/4` and
expressed as grid cells (0-3), not hardcoded pixel offsets — hardcoded pixels broke as soon
as the board's actual rendered size didn't match what the math assumed (pieces ended up
clipped outside the visible area by `overflow:hidden`, looking like "empty boxes"). Two
related gotchas if you touch this code again:
1. `buildBoard()` MUST run after the veil gets `display:flex` (i.e. after `.show` is added),
   or `board.clientWidth` reads 0 (hidden ancestor) and silently falls back to the wrong scale.
2. Any new choreographed move (`moveN(dc,dr)`) must stay within the 0-3 cell range — there's
   a `Math.max(0,Math.min(3,...))` clamp now, but don't rely on the clamp to make an
   out-of-bounds move "look right"; design moves that land in-bounds on purpose.

### Piece floor alignment (CSS, tuned by eye — don't "fix" without re-verifying visually)
`.cell img[data-t="..."]` sets per-piece-type `height` + `bottom` offset so each piece's art
sits flush with its square's floor line despite the source art having different amounts of
transparent padding per piece. Current baseline (knight/pawn were already correct):
- Pawn: `height:81%` (was 84%, reduced 3% per JFC's sizing note)
- Rook: `bottom:2%` (tuned down from -6% across two passes — JFC kept seeing it float)
- Queen: `bottom:-4%`, King: `bottom:-5%`
- Bishop ("mago"/wizard) is the ONE piece allowed to float — don't flatten it to match the rest.
- `.cell img.rot[data-t=...]` mirrors these offsets with inverted sign for the 180°-rotated
  (opponent, face-to-face mode) pieces — if you change the non-rotated offset, update the
  `.rot` counterpart too or the two sides will look inconsistent.

### Masthead (title image)
No longer has a float animation or edge mask-fade (both removed 2026-06-20 — JFC called it
"titilada idiota"/an annoying flicker). It now has a plain solid gold border + dark backing,
matching the button style used everywhere else (`var(--gold)` border, `2px solid`). Don't
re-add a CSS animation or mask-image here without checking with JFC first — this was an
explicit "stop doing that" correction.

## Things that are correct on purpose (don't "fix" these)
- AI mode never silently falls back to AI after an online human takes over — human-over-AI
  priority is enforced by the takeover flow stopping AI mode outright, not by a runtime check.
- King-of-the-hill online matches block Deshacer/Rehacer entirely while the duel is live and
  unresolved (`mode==='online' && !game.game_over() && !resigned`) — this is deliberate, not
  a bug: online duels don't get take-backs.
- The Bobby Fischer Bot level intentionally has no Elo number shown ("inhumano").

## Where things live
- All game logic, UI, and styling: `index.html` (single file by design — see CLAUDE.md
  "single files preferred" rule; don't split into multiple files without explicit approval).
- Firebase config (gitignored, never commit): `firebase-config.js`.
- Firebase init/bootstrap (safe to commit, no secrets): `firebase-init.js`.
- Backups: `index_YYYY-MM-DD_HH-MM.html` siblings, created before risky edits per CLAUDE.md
  backup protocol. Clean up old ones periodically rather than letting them accumulate forever.
