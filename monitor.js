/**
 * EL REINO DE JUANFERLAND
 * Watchdog / Monitor independiente
 * Verifica cada 5 segundos el estado del sistema
 */

let watchdogInterval = null;

function startWatchdog(engine, ui) {
  if (watchdogInterval) clearInterval(watchdogInterval);

  watchdogInterval = setInterval(() => {
    try {
      if (!engine || !engine.chess) {
        console.warn('[WATCHDOG] Motor caído. Restaurando...');
        if (window.JUANFERLAND && window.JUANFERLAND.restartEngine) {
          window.JUANFERLAND.restartEngine();
        }
        return;
      }

      const fen = engine.getFEN();
      if (!fen || fen.length < 20) {
        console.warn('[WATCHDOG] FEN corrupto');
        engine.emergencyRestore();
        if (ui && ui.renderBoard) ui.renderBoard(engine.getBoardState());
      }

      if (window.performance && window.performance.memory) {
        const mem = window.performance.memory.usedJSHeapSize / 1048576;
        if (mem > 200) {
          console.warn(`[WATCHDOG] Memoria alta: ${mem.toFixed(1)} MB`);
        }
      }
    } catch (e) {
      console.error('[WATCHDOG] Error:', e);
    }
  }, JUANFERLAND.CONFIG.WATCHDOG_INTERVAL);
}

function stopWatchdog() {
  if (watchdogInterval) clearInterval(watchdogInterval);
}
