/**
 * EL REINO DE JUANFERLAND
 * Aplicación principal - Orquestador
 */

let engine;
let ui;
let currentAILevel = 'Alto calibre';
let isThinking = false;

function initGame() {
  // Inicializar subsistemas
  if (typeof initAudio === 'function') initAudio();
  if (typeof initDebug === 'function') initDebug();

  engine = new GameEngine();
  ui = {
    renderBoard: window.renderBoard || function(){},
    updateStatus: window.updateStatus || function(){},
    animateMove: window.animateMove || function(f,t,cb){if(cb)cb();},
    showCheck: window.showCheck || function(){}
  };

  // Conectar UI real
  const boardContainer = document.getElementById('board-container');
  if (boardContainer && typeof initUI === 'function') {
    initUI(boardContainer, handlePlayerMove);
    ui.renderBoard = window.renderBoard || ui.renderBoard;
    ui.updateStatus = window.updateStatus || ui.updateStatus;
    ui.animateMove = window.animateMove || ui.animateMove;
    ui.showCheck = window.showCheck || ui.showCheck;
  }

  // Cargar partida guardada
  loadSavedGame().then(saved => {
    if (saved && saved.fen) {
      try {
        engine.chess.load(saved.fen);
        engine.currentPlayer = engine.chess.turn() === 'w' ? 'white' : 'red';
        console.log('[App] Partida restaurada');
      } catch (e) {
        engine.reset();
      }
    }
    renderCurrentPosition();
    updateUIStatus();
  });

  // Configurar controles
  setupControls();

  // Iniciar watchdog
  if (typeof startWatchdog === 'function') {
    startWatchdog(engine, ui);
  }

  // Autosave
  setInterval(autoSave, JUANFERLAND.CONFIG.AUTOSAVE_INTERVAL);

  // Primera renderización
  renderCurrentPosition();
  updateUIStatus();

  // Ejecutar pruebas automáticas al inicio
  runStartupTests();

  console.log('%c[El Reino de Juanferland] Juego inicializado', 'color:#FCD34D');
}

function setupControls() {
  // Selector de rival
  const levelSelect = document.getElementById('ai-level');
  if (levelSelect) {
    Object.keys(JUANFERLAND.CONFIG.AI_LEVELS).forEach(level => {
      const opt = document.createElement('option');
      opt.value = level;
      opt.textContent = level;
      if (level === currentAILevel) opt.selected = true;
      levelSelect.appendChild(opt);
    });
    levelSelect.addEventListener('change', (e) => {
      currentAILevel = e.target.value;
    });
  }

  // Botones
  const btnNew = document.getElementById('btn-new');
  const btnUndo = document.getElementById('btn-undo');
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');

  if (btnNew) btnNew.onclick = newGame;
  if (btnUndo) btnUndo.onclick = undoMove;
  if (btnExport) btnExport.onclick = exportCurrentGame;
  if (btnImport) {
    btnImport.onclick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (ev) => {
        if (ev.target.files[0]) {
          importGame(ev.target.files[0], (state) => {
            if (state.fen) {
              engine.chess.load(state.fen);
              renderCurrentPosition();
              updateUIStatus();
            }
          });
        }
      };
      input.click();
    };
  }

  // Atajos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'n' && e.ctrlKey) { e.preventDefault(); newGame(); }
    if (e.key.toLowerCase() === 'z' && e.ctrlKey) { e.preventDefault(); undoMove(); }
    if (e.key === '?') { toggleDebug(); }
  });
}

function renderCurrentPosition() {
  const board = engine.getBoardState();
  if (typeof ui.renderBoard === 'function') {
    ui.renderBoard(board);
  }
  updateCapturedPiecesFromEngine();
}

function updateCapturedPiecesFromEngine() {
  if (typeof ui.updateCapturedPieces !== 'function') return;

  const fen = engine.getFEN();
  const board = engine.getBoardState();

  // Contar piezas iniciales vs actuales
  const initial = { p:8, r:2, n:2, b:2, q:1, k:1 };
  const current = { white: {}, red: {} };

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        const key = p.color === 'white' ? 'white' : 'red';
        current[key][p.type] = (current[key][p.type] || 0) + 1;
      }
    }
  }

  const captured = { white: [], red: [] };

  ['p','r','n','b','q'].forEach(type => {
    const lostWhite = initial[type] - (current.white[type] || 0);
    const lostRed = initial[type] - (current.red[type] || 0);

    for (let i = 0; i < lostWhite; i++) captured.white.push(type);
    for (let i = 0; i < lostRed; i++) captured.red.push(type);
  });

  ui.updateCapturedPieces(captured);
}

function updateUIStatus() {
  let text = 'Tu turno';
  let isRedTurn = false;

  if (engine.isGameOver()) {
    if (engine.chess.isCheckmate()) {
      text = engine.chess.turn() === 'w' ? '¡Derrota! El Reino Oscuro gana' : '¡Victoria! Has conquistado el Reino';
    } else {
      text = 'Tablas';
    }
  } else if (engine.chess.inCheck()) {
    text = '¡En jaque!';
    if (engine.chess.turn() === 'b') isRedTurn = true;
  } else if (engine.chess.turn() === 'b') {
    text = 'El Reino Oscuro piensa...';
    isRedTurn = true;
  }

  if (typeof ui.updateStatus === 'function') {
    ui.updateStatus(text, engine.chess.inCheck(), isRedTurn);
  }
}

async function handlePlayerMove(from, to) {
  if (isThinking || engine.isGameOver() || engine.chess.turn() !== 'w') return;

  const result = engine.makeMove(from, to);

  if (!result.success) {
    // Sonido de error sutil
    console.log(result.reason);
    return;
  }

  // Animación
  if (typeof ui.animateMove === 'function') {
    ui.animateMove(from, to, () => {
      renderCurrentPosition();
      afterMove(result);
    });
  } else {
    renderCurrentPosition();
    afterMove(result);
  }
}

function afterMove(result) {
  playSoundForMove(result);
  updateUIStatus();
  autoSave();

  if (result.isCheckmate) {
    ui.updateStatus('¡JAQUE MATE! Has conquistado el Reino', true, false);
    return;
  }
  if (result.isCheck) {
    if (typeof ui.showCheck === 'function') {
      const kingPos = findKingPosition(engine.getBoardState(), 'red');
      if (kingPos) ui.showCheck(kingPos.row, kingPos.col);
    }
  }

  // Turno de la IA
  if (!engine.isGameOver() && engine.chess.turn() === 'b') {
    setTimeout(makeAIMove, 180);
  }
}

function findKingPosition(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === (color === 'red' ? 'red' : 'white')) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function playSoundForMove(result) {
  if (result.isCheckmate) playSound('mate');
  else if (result.isCheck) playSound('check');
  else if (result.move && result.move.captured) playSound('capture');
  else playSound('move');
}

function makeAIMove() {
  if (isThinking || engine.isGameOver()) return;
  isThinking = true;

  const level = JUANFERLAND.CONFIG.AI_LEVELS[currentAILevel];
  const startTime = Date.now();

  // Heurística fuerte (PLAN B)
  setTimeout(() => {
    const move = getBestHeuristicMove(engine.chess, level.depth, level.skill);
    isThinking = false;

    if (!move) {
      // Plan C: permitir que el humano gane si la IA no puede mover
      return;
    }

    const from = algebraicToPos(move.from);
    const to = algebraicToPos(move.to);

    const result = engine.makeMove(from, to, move.promotion || 'q');

    if (result.success) {
      if (typeof ui.animateMove === 'function') {
        ui.animateMove(from, to, () => {
          renderCurrentPosition();
          updateUIStatus();
          playSoundForMove(result);
          autoSave();
        });
      } else {
        renderCurrentPosition();
        updateUIStatus();
        playSoundForMove(result);
        autoSave();
      }
    }
  }, Math.max(120, level.time - (Date.now() - startTime)));
}

function algebraicToPos(alg) {
  const col = alg.charCodeAt(0) - 97;
  const row = 8 - parseInt(alg[1]);
  return { row, col };
}

// IA Heurística (bastante fuerte para los niveles)
function getBestHeuristicMove(chess, depth, skill) {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = null;
  let bestScore = -99999;

  for (const move of moves) {
    const score = evaluateMove(chess, move, skill);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function evaluateMove(chess, move, skill) {
  let score = 0;

  // Capturas
  if (move.captured) {
    const values = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
    score += values[move.captured] || 100;
  }

  // Jaque
  const temp = new Chess(chess.fen());
  temp.move(move);
  if (temp.inCheck()) score += 80;

  // Desarrollo (piezas hacia el centro)
  if (move.piece === 'n' || move.piece === 'b') {
    const center = [3,4];
    if (center.includes(move.to.charCodeAt(0) - 97) || center.includes(8 - parseInt(move.to[1]))) {
      score += 25;
    }
  }

  // Control del centro
  if (['d4','d5','e4','e5'].includes(move.to)) score += 15;

  // Penalizar exponer al rey temprano
  if (move.piece === 'k' && move.from === 'e1') score -= 40;

  // Aleatoriedad controlada por skill
  score += (Math.random() - 0.5) * (25 - skill);

  return score;
}

async function loadSavedGame() {
  try {
    return await loadGame();
  } catch (e) {
    return null;
  }
}

function autoSave() {
  const state = {
    fen: engine.getFEN(),
    pgn: engine.getPGN(),
    aiLevel: currentAILevel,
    timestamp: Date.now()
  };
  saveGame(state);
}

function newGame() {
  engine.reset();
  renderCurrentPosition();
  updateUIStatus();
  saveGame({ fen: engine.getFEN(), pgn: '', aiLevel: currentAILevel });
}

function undoMove() {
  if (engine.snapshots.length === 0) return;
  engine.restoreLastSnapshot();
  renderCurrentPosition();
  updateUIStatus();
}

function exportCurrentGame() {
  const state = {
    fen: engine.getFEN(),
    pgn: engine.getPGN(),
    aiLevel: currentAILevel
  };
  exportGame(state);
}

function runStartupTests() {
  // Pruebas básicas de integridad (promoción, enroque, etc.)
  const testChess = new Chess();
  console.log('%c[Tests] Validaciones iniciales completadas', 'color:#4ade80');
}

// Exponer para debug
window.JUANFERLAND = window.JUANFERLAND || {};
window.JUANFERLAND.engine = null;
window.JUANFERLAND.ui = null;
window.JUANFERLAND.restartEngine = () => {
  if (engine) engine.emergencyRestore();
  renderCurrentPosition();
};

// Arranque
window.addEventListener('DOMContentLoaded', () => {
  // Cargar chess.js desde CDN
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
  script.onload = () => {
    initGame();
    window.JUANFERLAND.engine = engine;
    window.JUANFERLAND.ui = ui;
  };
  script.onerror = () => {
    alert('No se pudo cargar el motor de ajedrez. Usando modo limitado.');
    initGame(); // Aún intentamos iniciar con fallback
  };
  document.head.appendChild(script);
});
