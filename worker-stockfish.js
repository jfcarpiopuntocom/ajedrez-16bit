/**
 * EL REINO DE JUANFERLAND
 * Worker para Stockfish (stub)
 * 
 * Para activar Stockfish real:
 * 1. Descarga stockfish.js + stockfish.wasm de https://github.com/nmrugg/stockfish.js
 * 2. Colócalos en la misma carpeta
 * 3. Cambia la lógica en app.js para usar este worker
 */

self.onmessage = function(e) {
  const { fen, depth, skill } = e.data;

  // PLAN B: Heurística fuerte (misma que en app.js)
  // En una versión completa aquí iría el verdadero Stockfish WASM

  // Por ahora devolvemos null para que app.js use su propia heurística
  self.postMessage({ bestMove: null, fallback: true });
};
