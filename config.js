/**
 * EL REINO DE JUANFERLAND
 * Configuración central - Todo configurable aquí
 */
window.JUANFERLAND = window.JUANFERLAND || {};

JUANFERLAND.CONFIG = {
  // Colores extremadamente saturados estilo 90s
  COLORS: {
    gold: '#FFD700',
    darkGold: '#B8860B',
    deepBlue: '#0A1628',
    royalBlue: '#1E3A8A',
    crimson: '#DC143C',
    magenta: '#C71585',
    purple: '#6B21A8',
    emerald: '#059669',
    orange: '#EA580C',
    wood: '#5C4033',
    stone: '#4A5568',
    velvet: '#4C1D95',
    brightGold: '#FBBF24',
    background: '#0F172A',
    panel: '#1E293B',
    text: '#F8FAFC',
    highlight: '#FCD34D',
    danger: '#EF4444'
  },

  // Niveles de IA
  AI_LEVELS: {
    'Medio': {
      depth: 2,
      time: 800,
      skill: 5,
      label: 'Medio'
    },
    'Alto calibre': {
      depth: 3,
      time: 1200,
      skill: 10,
      label: 'Alto calibre'
    },
    'Chess Master': {
      depth: 4,
      time: 1800,
      skill: 15,
      label: 'Chess Master'
    },
    'Grandmaster': {
      depth: 5,
      time: 2500,
      skill: 18,
      label: 'Grandmaster'
    },
    'Bobby Fischer': {
      depth: 6,
      time: 3200,
      skill: 20,
      label: 'Bobby Fischer (Leyenda)'
    }
  },

  // Snapshots
  MAX_SNAPSHOTS: 100,

  // Watchdog
  WATCHDOG_INTERVAL: 5000,

  // Guardado
  AUTOSAVE_INTERVAL: 60000, // 1 minuto

  // Tamaño base del tablero
  BASE_BOARD_SIZE: 560,

  // Debug
  DEBUG_KEY: 'JUANFERLAND_DEBUG',

  // Nombres de jugadores
  PLAYER_BLUE: 'Juanferland',
  PLAYER_RED: 'El Reino Oscuro',

  // Mensajes retro
  MESSAGES: {
    check: '¡JAQUE!',
    checkmate: '¡JAQUE MATE!',
    stalemate: 'Tablas por ahogado',
    draw: 'Tablas',
    promotion: '¡Promoción!',
    castle: 'Enroque',
    capture: 'Captura'
  }
};
