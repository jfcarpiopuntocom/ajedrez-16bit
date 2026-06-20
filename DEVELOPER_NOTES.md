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

### Piece input: PURE DRAG ONLY — do not add tap-to-move again (corrected 2026-06-20)
This was tried and explicitly rejected the SAME session it was added. Sequence: JFC asked for
"el clic al mover, que sea mas inmediato" → misread as "add tap-to-select-then-tap-destination
with legal-move dots" → built it → corrected hard: **"no es tap to move, idiota, es DRAG"** /
"lo que queria es el clic al mover, que sea mas inmediato, fin" / "no hagas cosas que no he
pedido". The actual ask was about drag responsiveness, not a new input paradigm. Current
behavior: pure drag, original 95437c9 design, but the ghost piece now appears the INSTANT you
press down (pointerdown) instead of after a 5px movement threshold — that's the "more
immediate" part. No selection state, no legal-move hints, no tap-only move path exist in the
code. **If "click to move" comes up again, ask explicitly whether it means (a) drag feeling
faster/snappier or (b) an actual tap-to-select system before writing any code** — assuming
either one cost a full build-then-revert once already.

### Zoom mode (`body.focusmode`, `@media min-width:860px`) — two non-obvious failure modes
1. **Hiding an element's CONTENT isn't the same as hiding its WRAPPER.** `.title-img` is
   `display:none` in focus mode, but its parent `.title-wrap` (which got its own gold border +
   background in the masthead change above) was NOT in that hidden list — left an empty
   gold-bordered box floating top-center ("la pildora dorada", flagged twice before being
   found). Whenever hiding a themed element in zoom, check whether its wrapper has its own
   visible styling (border/background/padding) and hide that too.
2. **`.board-area` spans both grid rows** (`grid-template-areas:"quotes board capR" "quotes
   board capB"`), so its height comes from the TRACK sizing, not its own content. The grid
   rows MUST be `1fr 1fr` (or otherwise fraction/available-space based) — `auto auto` sizes
   each row to the SHORTEST content in it, and since the quotes/captures panels are
   deliberately kept short (`align-self:start`, see below), the board's spanned rows collapsed
   with them, shrinking the board to nearly nothing ("hiciste el tablero del zoom enano,
   idiota" — a real regression caught and reverted same day). `.board-area` itself must be
   `align-self:stretch` (not `center`) so it actually receives that full track height — its
   own internal `display:flex;align-items:center;justify-content:center` (base CSS, ~line 516)
   is what keeps the board canvas itself centered within that tall area. The quotes/captures
   panels use `align-self:start` + `max-height` on THEMSELVES to stay compact — that's a
   different, unrelated mechanism and is correct as-is; don't touch it when fixing the board.

### Capture FX: NO visual effect, haptics + audio only (corrected 2026-06-20, don't re-add)
A capture used to spawn a particle burst (4 sparks from board-center), then a smaller
burst+ring anchored on the actual captured square. JFC rejected BOTH passes as "super gheeey":
**"ya dijimos haptics y choques varoniles o nada"**. Landed on "nada" — `window.fxCapture` is
now a no-op. Capture feedback is exactly: the existing `vibe(20)` haptic
(`navigator.vibrate`, in the `wrap('capture',...)` hook) + `SFX.capture()`'s two audio tones.
The generic `burst()`/`ring()` particle-engine functions are still defined (dormant, used by
nothing) — left in place rather than ripped out to avoid destabilizing `stepFx()`/`boardCenter()`
for no benefit; just don't wire a capture effect back into them without explicit sign-off.
`fxCheck()` (the red vignette flash on check) was never part of this complaint and is untouched.

### Piece rotation: ONLY in face-to-face 2P, never online (fixed 2026-06-20)
`render()`'s `topColor` (which pieces get the `.rot` 180°-flip class) used to trigger for both
`mode==='2p'` and `mode==='online'`. That's wrong: rotation exists because in 2P, two people
share ONE physical screen sitting across from each other, so the far player's pieces need to
face them. Online players each have their OWN screen — the opponent is remote, never
physically across the table — so rotating their pieces made no sense. Condition is now
`mode==='2p'` only. JFC's exact framing: "recuerda que solo EN PERSONA necesitan estar viradas
las piezas." The capture-tray rotation (`.cap.red` `rotcap` class) already correctly checked
`mode==='2p'` only and didn't need fixing — only the board piece rotation had the bug.

### Tutorial-only features need explicit scope confirmation
JFC added a suggested-move arrow (SVG line + auto-orienting arrowhead, FFVI/SNES-tactics
style) to the intro tutorial's demo board — but was explicit: **"solo en el tutorial, no
vuelvas a hacer cambios generales sin consultar conmigo."** The real game board has NO move
arrows, NO legal-move highlights, NO suggested moves — that's deliberate (see "pure drag only"
above; legal-move hints were tried and rejected in the same session). Don't generalize the
tutorial arrow into the main game without a separate, explicit request.

### Firebase config protection (gap found + fixed 2026-06-20)
`firebase-config.js` holds live credentials and must never be committed. A `.gitignore`
existed in this repo but never actually listed it — it was untracked only by manual
discipline, not by any enforced rule. Now added. Verified via `git log --all --full-history --
firebase-config.js` that it was never previously committed (no history scrub was needed). If
you ever see `firebase-config.js` show up in `git status` as staged, stop and check
`.gitignore` before committing anything.

### Radio Online (added 2026-06-21): 4 genres via radio-browser.info, isolated by design
A 3rd fixed circular button (top-right cluster) opens a panel with Synthwave / Taberna Medieval
/ Gregoriano / Metal Relajado, streamed via radio-browser.info (free, no-auth, CORS-friendly
station directory — no API key, no backend). Key things to know before touching this:
- `RADIO_TAGS`/`RADIO_NAMES` per genre were chosen by manually testing real API responses, not
  guessed. Gregorian and medieval-tavern in particular have very few stations actually TAGGED
  that way — the name-search fallback (`RADIO_NAMES`) is load-bearing for those two, not a
  redundant nice-to-have. If a genre stops finding stations, check both the tag AND name lists.
- Playback is self-healing: `fetchCandidates()` collects several station URLs, then
  `tryPlayCandidates()` advances to the next one on an `<audio>` `error` event. This is required,
  not decorative — confirmed live that individual stations do silently fail and the fallback is
  what makes the feature reliable.
- Calls the EXISTING `stopTavernMusic()` when a genre starts, so the new radio and the old tavern
  Web Audio ambience never overlap. Doesn't touch `tavernCtx`/`tavernGain` itself — different
  audio system entirely (plain `<audio>` element vs Web Audio API), deliberately not unified.
- `positionRadioBtn()` computes the button's `right` offset from Librería Real's actual rendered
  width at runtime, not a hardcoded breakpoint number — that pill's width already changes by
  breakpoint (label hides under 560px). If you add a 4th fixed top-right button, follow this
  pattern (measure the previous button, don't guess a pixel offset).

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
