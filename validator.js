/**
 * EL REINO DE JUANFERLAND
 * Sistema de Auditoría Cruzada - Tres capas obligatorias
 */

function validateMoveLayerA(from, to, currentPlayer, boardState) {
  // CAPA A - UI Validation
  if (!from || !to) return { valid: false, reason: 'Origen o destino inválido' };
  if (from.row < 0 || from.row > 7 || from.col < 0 || from.col > 7) return { valid: false, reason: 'Origen fuera del tablero' };
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) return { valid: false, reason: 'Destino fuera del tablero' };

  const piece = boardState[from.row][from.col];
  if (!piece) return { valid: false, reason: 'No hay pieza en el origen' };
  if (piece.color !== currentPlayer) return { valid: false, reason: 'La pieza no te pertenece' };

  return { valid: true };
}

function validateMoveLayerB(from, to, chessInstance) {
  // CAPA B - chess.js oficial
  try {
    const move = chessInstance.move({
      from: `${String.fromCharCode(97 + from.col)}${8 - from.row}`,
      to: `${String.fromCharCode(97 + to.col)}${8 - to.row}`,
      promotion: 'q'
    });
    if (move) {
      chessInstance.undo(); // deshacemos para no mutar aún
      return { valid: true, san: move.san };
    }
    return { valid: false, reason: 'Movimiento ilegal según chess.js' };
  } catch (e) {
    return { valid: false, reason: 'Error en validación chess.js' };
  }
}

function validateMoveLayerC(oldFEN, newFEN, chessInstance, renderedBoard) {
  // CAPA C - Post Validation + consistencia
  const tempChess = new Chess();
  tempChess.load(newFEN);

  // 1. El FEN debe ser cargable
  if (tempChess.fen() !== newFEN) {
    return { valid: false, reason: 'FEN reconstruido no coincide' };
  }

  // 2. Comparar conteo de piezas
  const oldPieces = countPiecesFromFEN(oldFEN);
  const newPieces = countPiecesFromFEN(newFEN);

  if (newPieces.total > oldPieces.total) {
    return { valid: false, reason: 'Aparecieron piezas de la nada' };
  }

  // 3. Verificar consistencia del tablero renderizado (si se pasa)
  if (renderedBoard) {
    const renderedCount = countPiecesFromBoard(renderedBoard);
    if (renderedCount.total !== newPieces.total) {
      return { valid: false, reason: 'Desincronización entre render y estado' };
    }
  }

  return { valid: true };
}

function countPiecesFromFEN(fen) {
  const board = fen.split(' ')[0];
  let count = { total: 0, white: 0, black: 0 };
  for (const char of board) {
    if (/[a-z]/.test(char)) { count.black++; count.total++; }
    if (/[A-Z]/.test(char)) { count.white++; count.total++; }
  }
  return count;
}

function countPiecesFromBoard(board) {
  let count = { total: 0, white: 0, black: 0 };
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        count.total++;
        if (p.color === 'white') count.white++;
        else count.black++;
      }
    }
  }
  return count;
}
