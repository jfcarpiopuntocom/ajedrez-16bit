/**
 * EL REINO DE JUANFERLAND
 * Modo Debug (activar con JUANFERLAND_DEBUG)
 */

function initDebug() {
  const debugPanel = document.getElementById('debug-panel');
  if (!debugPanel) return;

  const isDebug = localStorage.getItem('JUANFERLAND_DEBUG') === 'true' ||
                  window.location.search.includes('debug');

  if (isDebug) {
    debugPanel.style.display = 'block';
    console.log('%c[DEBUG] Modo depuración activado', 'color:#FCD34D');

    setInterval(() => {
      if (!window.JUANFERLAND || !window.JUANFERLAND.engine) return;

      const engine = window.JUANFERLAND.engine;
      const ui = window.JUANFERLAND.ui;

      let html = '';
      html += `FPS: ${window.JUANFERLAND.fps || '--'}\n`;
      html += `FEN: ${engine.getFEN().substring(0, 40)}...\n`;
      html += `Turno: ${engine.currentPlayer}\n`;
      html += `Snapshots: ${engine.snapshots.length}\n`;
      html += `GameOver: ${engine.isGameOver()}\n`;

      if (ui && ui.getSelected) {
        html += `Selected: ${ui.getSelected() || 'ninguno'}\n`;
      }

      debugPanel.textContent = html;
    }, 400);
  }
}

function toggleDebug() {
  const current = localStorage.getItem('JUANFERLAND_DEBUG') === 'true';
  localStorage.setItem('JUANFERLAND_DEBUG', (!current).toString());
  location.reload();
}
