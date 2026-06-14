/**
 * EL REINO DE JUANFERLAND
 * UI + Renderizado del tablero y piezas
 */

let boardElement;
let boardState = [];
let selected = null;
let onMoveCallback = null;
let currentOrientation = 'white'; // 'white' = azules abajo

function initUI(container, moveCallback) {
  boardElement = document.getElementById('board');
  onMoveCallback = moveCallback;

  // Crear 64 casillas
  boardElement.innerHTML = '';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement('div');
      square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;
      square.dataset.row = r;
      square.dataset.col = c;

      square.addEventListener('click', handleSquareClick);
      boardElement.appendChild(square);
    }
  }

  // Ajustar tamaño del tablero
  resizeBoard();

  window.addEventListener('resize', resizeBoard);
}

function resizeBoard() {
  const wrapper = document.getElementById('board-wrapper');
  if (!wrapper || !boardElement) return;

  const maxSize = Math.min(
    wrapper.clientWidth || 560,
    window.innerHeight * 0.72
  );

  const size = Math.max(320, Math.floor(maxSize / 8) * 8);
  boardElement.style.width = `${size}px`;
  boardElement.style.height = `${size}px`;
}

function handleSquareClick(e) {
  const row = parseInt(e.currentTarget.dataset.row);
  const col = parseInt(e.currentTarget.dataset.col);

  if (!onMoveCallback) return;

  if (selected) {
    if (selected.row === row && selected.col === col) {
      clearSelection();
      return;
    }
    // Intentar mover
    onMoveCallback(selected, { row, col });
    clearSelection();
  } else {
    // Seleccionar si hay pieza
    const piece = boardState[row] && boardState[row][col];
    if (piece) {
      selected = { row, col };
      highlightSelected(row, col);
    }
  }
}

function highlightSelected(row, col) {
  clearHighlights();
  const squares = boardElement.querySelectorAll('.square');
  squares.forEach(sq => {
    const r = parseInt(sq.dataset.row);
    const c = parseInt(sq.dataset.col);
    if (r === row && c === col) {
      sq.classList.add('selected');
    }
  });
}

function clearSelection() {
  selected = null;
  clearHighlights();
}

function clearHighlights() {
  const squares = boardElement.querySelectorAll('.square');
  squares.forEach(sq => sq.classList.remove('selected', 'highlight', 'legal'));
}

function renderBoard(newBoardState) {
  boardState = newBoardState;
  const squares = boardElement.querySelectorAll('.square');

  squares.forEach(sq => {
    // Limpiar piezas anteriores
    while (sq.firstChild) sq.removeChild(sq.firstChild);
    sq.classList.remove('highlight', 'legal', 'in-check');

    const r = parseInt(sq.dataset.row);
    const c = parseInt(sq.dataset.col);

    const pieceData = boardState[r] && boardState[r][c];
    if (pieceData) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      canvas.className = 'piece';
      canvas.dataset.row = r;
      canvas.dataset.col = c;

      const ctx = canvas.getContext('2d');
      const color = pieceData.color; // 'white' o 'red'
      drawPiece(ctx, pieceData.type, color === 'white' ? 'blue' : 'red', 0, 0, 64);

      sq.appendChild(canvas);
    }
  });
}

function highlightLegalMoves(moves) {
  clearHighlights();
  const squares = boardElement.querySelectorAll('.square');
  squares.forEach(sq => {
    const r = parseInt(sq.dataset.row);
    const c = parseInt(sq.dataset.col);
    if (moves.some(m => m.row === r && m.col === c)) {
      sq.classList.add('legal');
    }
  });
}

function showCheck(kingRow, kingCol) {
  const squares = boardElement.querySelectorAll('.square');
  squares.forEach(sq => {
    if (parseInt(sq.dataset.row) === kingRow && parseInt(sq.dataset.col) === kingCol) {
      sq.classList.add('in-check');
    }
  });
}

function animateMove(from, to, callback) {
  const squares = boardElement.querySelectorAll('.square');
  let fromSq, toSq;

  squares.forEach(sq => {
    if (parseInt(sq.dataset.row) === from.row && parseInt(sq.dataset.col) === from.col) fromSq = sq;
    if (parseInt(sq.dataset.row) === to.row && parseInt(sq.dataset.col) === to.col) toSq = sq;
  });

  if (!fromSq || !toSq) {
    if (callback) callback();
    return;
  }

  const pieceCanvas = fromSq.querySelector('.piece');
  if (!pieceCanvas) {
    if (callback) callback();
    return;
  }

  const startRect = fromSq.getBoundingClientRect();
  const endRect = toSq.getBoundingClientRect();
  const boardRect = boardElement.getBoundingClientRect();

  // Clonar pieza para animar
  const animPiece = pieceCanvas.cloneNode(true);
  animPiece.style.position = 'absolute';
  animPiece.style.left = `${startRect.left - boardRect.left}px`;
  animPiece.style.top = `${startRect.top - boardRect.top}px`;
  animPiece.style.width = `${pieceCanvas.width}px`;
  animPiece.style.height = `${pieceCanvas.height}px`;
  animPiece.classList.add('moving');
  boardElement.appendChild(animPiece);

  fromSq.querySelector('.piece')?.remove();

  const dx = endRect.left - startRect.left;
  const dy = endRect.top - startRect.top;

  animPiece.style.transition = 'transform 160ms cubic-bezier(0.23, 1, 0.32, 1)';
  animPiece.style.transform = `translate(${dx}px, ${dy}px)`;

  setTimeout(() => {
    animPiece.remove();
    if (callback) callback();
  }, 180);
}

function updateStatus(text, isCheck = false, isRedTurn = false) {
  const statusEl = document.getElementById('status-text');
  const turnEl = document.getElementById('turn-indicator');

  if (statusEl) statusEl.textContent = text;
  if (turnEl) {
    turnEl.textContent = isRedTurn ? 'EL REINO OSCURO' : 'JUANFERLAND';
    turnEl.style.background = isRedTurn ? '#9F1239' : '#1E40AF';
  }
}

function updateCapturedPieces(captured) {
  const left = document.getElementById('captured-blue');
  const right = document.getElementById('captured-red');
  if (!left || !right) return;

  left.innerHTML = '';
  right.innerHTML = '';

  (captured.white || []).forEach(piece => {
    const c = document.createElement('canvas');
    c.width = 28; c.height = 28;
    c.className = 'captured-piece';
    const ctx = c.getContext('2d');
    drawPiece(ctx, piece, 'blue', 0, 0, 28);
    left.appendChild(c);
  });

  (captured.red || []).forEach(piece => {
    const c = document.createElement('canvas');
    c.width = 28; c.height = 28;
    c.className = 'captured-piece';
    const ctx = c.getContext('2d');
    drawPiece(ctx, piece, 'red', 0, 0, 28);
    right.appendChild(c);
  });
}

function getCurrentFENFromUI() {
  // Placeholder - en una implementación completa se mantendría sincronizado
  return null;
}
