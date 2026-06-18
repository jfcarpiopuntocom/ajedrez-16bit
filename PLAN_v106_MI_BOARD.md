# v106: MI BOARD PERSONAL (Opción B - Tableros Vivos)

## OBJETIVO
Implementar "Mi Board" — tablero personal persistente donde jugadores esperan rival y se conectan 1v1. Multiverse + 1v1 casados en una sola entidad.

## DECISIONES CONFIRMADAS
- ✅ Cap: 2 jugadores por matchCode
- ✅ Trackear en hub (fuente de verdad)
- ✅ Tableros Abiertos de TODO el servidor
- ✅ Librería Real → dentro de Mi Board (privado)
- ✅ Partidas Famosas → sección Inspiración (pública)

---

## ESTRUCTURA NUEVA

```javascript
const myBoard = {
  boardCode: genCode(),        // único, persistente
  ownerId: myPid,              // tu PID permanente
  ownerName: myPseudo,         // tu nombre editable
  status: "open",              // esperando rival
  currentGame: {
    matchCode: "LEGM7K",
    fen: "...",
    against: "IA" || "SofiaRoja"
  },
  gameHistory: [ /* mis partidas guardadas */ ]
};

// Hub mantiene:
const openBoards = [
  { boardCode, ownerId, ownerName, peers: 0/1, status },
  ...
];
```

---

## LAYOUT TABERNA (NUEVO)

```
LA TABERNA (Tableros Vivos)

┌─────────────────────────────────────┐
│ 🎯 MI BOARD                         │
│ Tu código: DRAGON01                 │
│ Status: Esperando rival aquí [🟢]   │
│ [Copiar link]                       │
│                                     │
│ 👑 Mis Partidas (3)                 │
│ ├─ Mate Légal LEGM7K (vs IA)       │
│ ├─ Inmortal IMOR99 (vs IA)         │
│ └─ vs Miguel MIGUE1 (2P, completa) │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📖 TABLEROS ABIERTOS                │
│ ├─ SofiaRoja [🟢] Entrar            │
│ ├─ Miguel [🎮] Jugando              │
│ └─ AnaWhite [🟢] Entrar             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⭐ INSPIRACIÓN                       │
│ [Partidas Famosas] [Top del Servidor]
└─────────────────────────────────────┘
```

---

## TRABAJO MAÑANA (Orden Exacto)

### FASE 1: Setup (30 min)
- [ ] 1. Leer este plan + coffee ☕
- [ ] 2. Crear state `myBoard` en JS (~line 1100)
- [ ] 3. Persistencia: localStorage `board_${myPid}`
- [ ] 4. Recuperar en `goOnline()` si existe

### FASE 2: HTML Reorder (15 min)
- [ ] 5. Reordenar `#lobby-panel`:
  - Mover "Mi Board" arriba (nuevo div)
  - "Tableros Abiertos" en medio
  - "Inspiración" abajo (colapsable)
- [ ] 6. CSS: `.my-board-section` con border dorado

### FASE 3: Core Logic (40 min)
- [ ] 7. Listener `onPeerJoinsBoard(boardCode, peerId)` (~line 1600)
  - Detecta si es TU board → `startGame('online')`
  - Detecta si es OTRO board → `enterBoard(boardCode)`
- [ ] 8. Hub broadcast: `openBoards[]` lista global
- [ ] 9. Function `renderOpenBoards()` (~line 1700)
- [ ] 10. Function `enterBoard(boardCode)` (~line 1750)

### FASE 4: UI Polish (20 min)
- [ ] 11. Feedback visual: "[🎮 Rival aquí]" badge
- [ ] 12. Show opponent name in status bar
- [ ] 13. Responsive CSS para mobile
- [ ] 14. Copy-to-clipboard para board link

### FASE 5: Integration (20 min)
- [ ] 15. Multiverse publish: anida en boardCode
- [ ] 16. Test: abre taberna, ves tu board, invita amigo
- [ ] 17. Test: amigo abre link, entran ambos 1v1

### FASE 6: Release (10 min)
- [ ] 18. Commit: v106 "Mi Board Personal"
- [ ] 19. Push
- [ ] 20. Live URL verificado

---

## CAMBIOS ESPECÍFICOS DE CÓDIGO

### HTML (~line 677-708)
**ANTES:**
```html
<div class="lobby-panel">
  <div class="lobby-tut">...</div>
  <p class="lobby-name">...</p>
  <h3>Jugadores en la Taberna</h3>
  <ul class="lobby-list" id="lobbyList"></ul>
  <div id="lobbyMultiBox">...</div>
  <button class="lobby-share" id="myMatches">👑 Librería Real</button>
  <button class="lobby-share" id="lobbyFamous">⚔️ Partidas Famosas</button>
</div>
```

**DESPUÉS:**
```html
<div class="lobby-panel">
  <div class="lobby-tut">...</div>
  
  <!-- MI BOARD (NUEVO) -->
  <div class="my-board-section">
    <h3>🎯 Mi Board</h3>
    <p class="board-code" id="myBoardCode">------</p>
    <p class="board-status" id="myBoardStatus">Esperando rival aquí</p>
    <button id="copyBoardLink" class="lobby-share">Copiar link</button>
    <details>
      <summary>👑 Mis Partidas (<span id="myGameCount">0</span>)</summary>
      <ul class="lobby-list" id="myGamesList"></ul>
    </details>
  </div>

  <!-- TABLEROS ABIERTOS (REUBICADO) -->
  <h3 class="lobby-h">📖 Tableros Abiertos</h3>
  <ul class="lobby-list" id="openBoardsList"></ul>

  <!-- NOMBRE + BOTONES LOBBY -->
  <p class="lobby-name">...</p>
  <h3>👥 Jugadores en la Taberna</h3>
  <ul class="lobby-list" id="lobbyList"></ul>

  <!-- INSPIRACIÓN (COLAPSABLE) -->
  <details>
    <summary>⭐ Inspiración</summary>
    <button class="lobby-share" id="famousGamesBtn" style="width:100%">Partidas Famosas</button>
  </details>
</div>
```

### JS (~line 1100-1110)
```javascript
// NEW STATE
let myBoard = {
  boardCode: null,
  ownerId: myPid,
  ownerName: myPseudo,
  status: 'open',
  currentGame: null,
  gameHistory: []
};

function loadMyBoard() {
  try {
    var saved = JSON.parse(localStorage.getItem('board_'+myPid));
    if (saved) myBoard = saved;
    if (!myBoard.boardCode) myBoard.boardCode = genCode();
    saveMyBoard();
  } catch(e) {
    myBoard.boardCode = genCode();
    saveMyBoard();
  }
}

function saveMyBoard() {
  try {
    localStorage.setItem('board_'+myPid, JSON.stringify(myBoard));
    idbPut('myboard', myBoard);
  } catch(e) {}
}

// Call in goOnline()
loadMyBoard();
```

### JS (~line 1600-1650) - Listener
```javascript
// NEW: Detect when peer joins your board
function onPeerJoinsBoard(boardCode, peerId) {
  if (boardCode === myBoard.boardCode && boardCode !== 'PLAZA1') {
    // Someone entered YOUR board
    console.log('Rival entró a tu board:', peerId);
    if (net.conn) { // ya hay conexión
      aiActive = false;
      mode = 'online';
      status('🎮 Rival aquí. ¡Que comience!');
    }
  }
}

// Attach to net.on('data') handler
// When receive {t:'peer-joined', boardCode}
```

### JS (~line 1700-1750) - Render
```javascript
function renderOpenBoards() {
  var list = $('openBoardsList');
  list.innerHTML = '';
  
  if (!net.openBoards || net.openBoards.length === 0) {
    list.innerHTML = '<li style="text-align:center;color:#999">Esperando tableros...</li>';
    return;
  }
  
  net.openBoards.forEach(function(board) {
    if (board.boardCode === myBoard.boardCode) return; // skip your own
    if (board.peers >= 2) return; // full
    
    var badge = board.peers === 1 ? '[🎮]' : '[🟢]';
    var li = document.createElement('li');
    li.innerHTML = board.ownerName + ' ' + badge;
    li.onclick = function() { enterBoard(board.boardCode, board.ownerName); };
    list.appendChild(li);
  });
}

function enterBoard(boardCode, ownerName) {
  myBoard.targetBoard = boardCode;
  myBoard.targetOwner = ownerName;
  
  if (!net.peer) { netInit(); }
  // Connect to that specific boardCode
  netConnect(boardCode);
  
  status('Entrando a board de ' + ownerName + '...');
}
```

---

## TESTING CHECKLIST MAÑANA

- [ ] Abro taberna, veo "🎯 Mi Board" con mi código
- [ ] Comparto link con amigo (copia link)
- [ ] Amigo abre link → ve mi board, clickea "Entrar"
- [ ] Automáticamente: ambos conectados, IA desaparece, es 1v1
- [ ] Mi tablero muestra su nombre en status
- [ ] Sus movimientos se sincronizan en vivo
- [ ] Mi histórico de partidas aparece en Mi Board
- [ ] Si clickeo "Tablero Abierto" ajeno → entro a su tablero
- [ ] Multiverse: puedo ramificar desde cualquier tablero

---

## NOTAS IMPORTANTES

- **PLAZA1 desaparece gradualmente** (v107+) — por ahora es fallback
- **Multiverse vive DENTRO del board** — cada rama es una entidad del creador
- **Persistencia triple:** localStorage + IndexedDB + cookie
- **Cap 2 jugadores:** detectar con `connectedPeers[boardCode].length >= 2`
- **Takeover automático:** cuando jugador #2 entra, IA desvanece

---

## TOKEN BUDGET PARA MAÑANA

| Fase | Tokens | Notas |
|------|--------|-------|
| Setup | 150 | myBoard state + persistencia |
| HTML | 120 | Reordenar lobby |
| Logic | 300 | Listeners + renderOpen + enterBoard |
| Polish | 100 | CSS + feedback |
| Integration | 80 | Multiverse + tests |
| **TOTAL** | **~750** | Muy orientado |

---

**IMPORTANTE:** Leer este plan + café primero. Todo está mapeado. ¡Legendario mañana!
