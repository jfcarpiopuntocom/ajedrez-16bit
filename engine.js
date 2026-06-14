/**
 * EL REINO DE JUANFERLAND
 * Motor de Ajedrez con Auditorías Cruzadas y Redundancias
 */

class GameEngine {
  constructor() {
    this.chess = new Chess();
    this.snapshots = [];
    this.lastValidFEN = this.chess.fen();
    this.currentPlayer = 'white';
  }

  makeMove(from, to, promotion = 'q') {
    const fromPos = { row: from.row, col: from.col };
    const toPos = { row: to.row, col: to.col };

    // === CAPA A ===
    const layerA = validateMoveLayerA(fromPos, toPos, this.currentPlayer === 'white' ? 'white' : 'black', this.getBoardState());
    if (!layerA.valid) {
      console.warn('[AUDIT] Capa A rechazó el movimiento:', layerA.reason);
      return { success: false, reason: layerA.reason };
    }

    // === CAPA B ===
    const layerB = validateMoveLayerB(fromPos, toPos, this.chess);
    if (!layerB.valid) {
      console.warn('[AUDIT] Capa B rechazó el movimiento:', layerB.reason);
      return { success: false, reason: layerB.reason };
    }

    // Guardamos estado anterior
    const oldFEN = this.chess.fen();
    const oldBoard = this.getBoardState();

    // Ejecutamos el movimiento real
    const moveResult = this.chess.move({
      from: `${String.fromCharCode(97 + from.col)}${8 - from.row}`,
      to: `${String.fromCharCode(97 + to.col)}${8 - to.row}`,
      promotion
    });

    if (!moveResult) {
      return { success: false, reason: 'chess.js rechazó el movimiento' };
    }

    const newFEN = this.chess.fen();

    // === CAPA C ===
    const layerC = validateMoveLayerC(oldFEN, newFEN, this.chess, oldBoard);
    if (!layerC.valid) {
      console.error('[AUDIT] Capa C detectó inconsistencia:', layerC.reason);
      this.chess.load(oldFEN); // revertir inmediatamente
      return { success: false, reason: 'Inconsistencia detectada. Movimiento revertido.' };
    }

    // Todo correcto → guardar snapshot
    this.saveSnapshot(oldFEN, newFEN, moveResult);
    this.lastValidFEN = newFEN;
    this.currentPlayer = this.chess.turn() === 'w' ? 'white' : 'black';

    return {
      success: true,
      move: moveResult,
      fen: newFEN,
      isCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw()
    };
  }

  // Reconstruye el tablero desde FEN (Failsafe 1)
  reconstructFromFEN(fen) {
    try {
      this.chess.load(fen);
      this.lastValidFEN = fen;
      return true;
    } catch (e) {
      console.error('[FAILSAFE 1] Falló reconstrucción desde FEN');
      return false;
    }
  }

  getBoardState() {
    const board = [];
    const fenBoard = this.chess.board();
    for (let r = 0; r < 8; r++) {
      board[r] = [];
      for (let c = 0; c < 8; c++) {
        const piece = fenBoard[r][c];
        if (piece) {
          board[r][c] = {
            type: piece.type,
            color: piece.color === 'w' ? 'white' : 'red'
          };
        } else {
          board[r][c] = null;
        }
      }
    }
    return board;
  }

  getFEN() {
    return this.chess.fen();
  }

  getPGN() {
    return this.chess.pgn();
  }

  isGameOver() {
    return this.chess.isGameOver();
  }

  saveSnapshot(oldFEN, newFEN, move) {
    const snapshot = {
      oldFEN,
      newFEN,
      pgn: this.chess.pgn(),
      turn: this.currentPlayer,
      move: move ? move.san : null,
      timestamp: Date.now()
    };
    this.snapshots.push(snapshot);
    if (this.snapshots.length > JUANFERLAND.CONFIG.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
  }

  restoreLastSnapshot() {
    if (this.snapshots.length === 0) return false;
    const last = this.snapshots.pop();
    try {
      this.chess.load(last.oldFEN);
      this.lastValidFEN = last.oldFEN;
      return true;
    } catch (e) {
      return false;
    }
  }

  // Failsafe principal
  emergencyRestore() {
    // 1. Intentar último snapshot
    if (this.restoreLastSnapshot()) {
      console.log('[FAILSAFE] Restaurado desde snapshot');
      return true;
    }
    // 2. Último FEN válido
    if (this.reconstructFromFEN(this.lastValidFEN)) {
      console.log('[FAILSAFE] Restaurado desde último FEN válido');
      return true;
    }
    // 3. Nueva partida
    this.chess.reset();
    this.snapshots = [];
    this.lastValidFEN = this.chess.fen();
    console.warn('[FAILSAFE] Se creó nueva partida');
    return false;
  }

  reset() {
    this.chess.reset();
    this.snapshots = [];
    this.lastValidFEN = this.chess.fen();
    this.currentPlayer = 'white';
  }
}
