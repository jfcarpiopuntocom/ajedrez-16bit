/**
 * EL REINO DE JUANFERLAND
 * Sprites retro estilo 90s - Perfil lateral (sideways)
 * Dibujados proceduralmente con Canvas 2D
 * Inspirados en Monkey Island II + Final Fantasy VI + Heroes of Might & Magic
 */

const SPRITE_COLORS = {
  blue: {
    main: '#1E40AF',
    light: '#3B82F6',
    dark: '#1E3A8A',
    gold: '#FBBF24',
    skin: '#FCD34D',
    accent: '#DC143C'
  },
  red: {
    main: '#9F1239',
    light: '#EF4444',
    dark: '#7F1D1D',
    gold: '#F59E0B',
    skin: '#FEF3C7',
    accent: '#6B21A8'
  }
};

function drawKing(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Cuerpo y capa
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 8*s, y + 12*s, 16*s, 18*s); // torso

  // Capa azul/rojiza con volumen
  ctx.fillStyle = isRed ? '#7F1D1D' : '#1E3A8A';
  ctx.fillRect(x + 6*s, y + 14*s, 20*s, 20*s);
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x + 7*s, y + 18*s, 4*s, 14*s); // detalles de capa

  // Corona enorme y ornamentada (estilo 90s)
  ctx.fillStyle = colors.gold;
  ctx.beginPath();
  ctx.moveTo(x + 6*s, y + 8*s);
  ctx.lineTo(x + 10*s, y + 2*s);
  ctx.lineTo(x + 14*s, y + 6*s);
  ctx.lineTo(x + 16*s, y + 1*s);
  ctx.lineTo(x + 18*s, y + 5*s);
  ctx.lineTo(x + 22*s, y + 2*s);
  ctx.lineTo(x + 26*s, y + 8*s);
  ctx.lineTo(x + 26*s, y + 11*s);
  ctx.lineTo(x + 6*s, y + 11*s);
  ctx.closePath();
  ctx.fill();

  // Joyas en la corona
  ctx.fillStyle = '#DC143C';
  ctx.fillRect(x + 12*s, y + 4*s, 3*s, 3*s);
  ctx.fillStyle = '#059669';
  ctx.fillRect(x + 17*s, y + 4*s, 3*s, 3*s);

  // Cara anciano sabio
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 10*s, y + 11*s, 12*s, 8*s);

  // Barba blanca/gris grande
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(x + 9*s, y + 16*s, 14*s, 9*s);
  ctx.fillRect(x + 10*s, y + 22*s, 3*s, 4*s);
  ctx.fillRect(x + 18*s, y + 22*s, 3*s, 4*s);

  // Ojos
  ctx.fillStyle = '#111827';
  ctx.fillRect(x + 12*s, y + 13*s, 2*s, 2*s);
  ctx.fillRect(x + 18*s, y + 13*s, 2*s, 2*s);

  // Corona centelleando
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(x + 8*s, y + 3*s, 2*s, 2*s);
  ctx.fillRect(x + 22*s, y + 3*s, 2*s, 2*s);

  ctx.restore();
}

function drawQueen(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Cuerpo aventurero noble
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 8*s, y + 13*s, 16*s, 16*s);

  // Vestido con detalles dorados
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x + 10*s, y + 16*s, 12*s, 12*s);
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 11*s, y + 18*s, 2*s, 8*s);
  ctx.fillRect(x + 19*s, y + 18*s, 2*s, 8*s);

  // Cabello largo y ondulado
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 7*s, y + 6*s, 18*s, 12*s);
  ctx.fillRect(x + 6*s, y + 10*s, 3*s, 8*s);
  ctx.fillRect(x + 23*s, y + 10*s, 3*s, 8*s);

  // Cara noble
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 10*s, y + 10*s, 12*s, 7*s);

  // Ojos expresivos
  ctx.fillStyle = '#111827';
  ctx.fillRect(x + 12*s, y + 12*s, 2*s, 2*s);
  ctx.fillRect(x + 18*s, y + 12*s, 2*s, 2*s);

  // Corona/detalles dorados en la cabeza
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 11*s, y + 7*s, 10*s, 3*s);
  ctx.fillStyle = '#DC143C';
  ctx.fillRect(x + 14*s, y + 7*s, 4*s, 2*s);

  // Brazos con detalles
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 6*s, y + 14*s, 4*s, 8*s);
  ctx.fillRect(x + 22*s, y + 14*s, 4*s, 8*s);

  ctx.restore();
}

function drawRook(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Torre gigantesca - castillo viviente
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 6*s, y + 8*s, 20*s, 22*s);

  // Mampostería detallada
  ctx.fillStyle = isRed ? '#7F1D1D' : '#1E3A8A';
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 8*s, y + (11 + i*6)*s, 16*s, 2*s);
  }

  // Tejado almenado
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 4*s, y + 4*s, 24*s, 6*s);
  // Almenas
  ctx.fillRect(x + 4*s, y + 2*s, 4*s, 4*s);
  ctx.fillRect(x + 12*s, y + 2*s, 4*s, 4*s);
  ctx.fillRect(x + 20*s, y + 2*s, 4*s, 4*s);

  // Bandera
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 14*s, y + 4*s, 2*s, 8*s);
  ctx.fillStyle = isRed ? '#DC143C' : '#3B82F6';
  ctx.fillRect(x + 16*s, y + 4*s, 10*s, 5*s);

  // Escudos y runas
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(x + 9*s, y + 14*s, 4*s, 4*s);
  ctx.fillRect(x + 19*s, y + 14*s, 4*s, 4*s);

  // Joyas
  ctx.fillStyle = '#059669';
  ctx.fillRect(x + 13*s, y + 20*s, 6*s, 3*s);

  ctx.restore();
}

function drawKnight(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Jinete heroico
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 7*s, y + 10*s, 18*s, 18*s); // cuerpo

  // Montura noble
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 5*s, y + 20*s, 22*s, 8*s);

  // Escudo
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 8*s, y + 13*s, 6*s, 8*s);
  ctx.fillStyle = isRed ? '#DC143C' : '#3B82F6';
  ctx.fillRect(x + 9*s, y + 15*s, 4*s, 4*s);

  // Cabeza con yelmo
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 10*s, y + 6*s, 12*s, 8*s);
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 13*s, y + 8*s, 6*s, 4*s);

  // Lanza
  ctx.fillStyle = '#4B5563';
  ctx.fillRect(x + 22*s, y + 8*s, 2*s, 18*s);
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 21*s, y + 6*s, 4*s, 4*s);

  // Capa
  ctx.fillStyle = isRed ? '#7F1D1D' : '#1E3A8A';
  ctx.fillRect(x + 18*s, y + 11*s, 8*s, 12*s);

  ctx.restore();
}

function drawBishop(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Mago - la estrella del set
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 9*s, y + 10*s, 14*s, 18*s); // túnica

  // Capucha enorme y dramática
  ctx.fillStyle = isRed ? '#4C1D95' : '#1E3A8A';
  ctx.beginPath();
  ctx.moveTo(x + 6*s, y + 6*s);
  ctx.lineTo(x + 16*s, y + 2*s);
  ctx.lineTo(x + 26*s, y + 6*s);
  ctx.lineTo(x + 22*s, y + 11*s);
  ctx.lineTo(x + 10*s, y + 11*s);
  ctx.closePath();
  ctx.fill();

  // Cara mística
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 12*s, y + 8*s, 8*s, 5*s);

  // Ojos arcanos
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(x + 13*s, y + 9*s, 2*s, 2*s);
  ctx.fillRect(x + 17*s, y + 9*s, 2*s, 2*s);

  // Bastón espectacular
  ctx.fillStyle = '#451A03';
  ctx.fillRect(x + 24*s, y + 4*s, 3*s, 24*s);
  ctx.fillStyle = colors.gold;
  ctx.beginPath();
  ctx.arc(x + 25.5*s, y + 6*s, 5*s, 0, Math.PI * 2);
  ctx.fill();

  // Orbe mágico flotante
  ctx.fillStyle = isRed ? '#C71585' : '#3B82F6';
  ctx.beginPath();
  ctx.arc(x + 25.5*s, y + 6*s, 3*s, 0, Math.PI * 2);
  ctx.fill();

  // Runas flotantes
  ctx.fillStyle = '#FCD34D';
  ctx.font = `${4*s}px monospace`;
  ctx.fillText('✧', x + 4*s, y + 15*s);

  // Capa con joyas
  ctx.fillStyle = colors.accent;
  ctx.fillRect(x + 10*s, y + 15*s, 12*s, 10*s);
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(x + 12*s, y + 18*s, 2*s, 2*s);
  ctx.fillRect(x + 18*s, y + 18*s, 2*s, 2*s);

  ctx.restore();
}

function drawPawn(ctx, x, y, size, colors, isRed) {
  ctx.save();
  const s = size / 32;

  // Pequeño héroe con personalidad
  ctx.fillStyle = colors.main;
  ctx.fillRect(x + 10*s, y + 12*s, 12*s, 14*s); // cuerpo

  // Escudo pequeño
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 8*s, y + 14*s, 4*s, 6*s);

  // Cabeza con casco
  ctx.fillStyle = colors.gold;
  ctx.fillRect(x + 11*s, y + 7*s, 10*s, 7*s);
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 13*s, y + 9*s, 6*s, 4*s);

  // Lanza o espada
  ctx.fillStyle = '#6B7280';
  ctx.fillRect(x + 20*s, y + 8*s, 2*s, 14*s);

  // Detalles de personalidad
  ctx.fillStyle = '#FCD34D';
  ctx.fillRect(x + 14*s, y + 10*s, 2*s, 2*s); // ojo

  ctx.restore();
}

function drawPiece(ctx, type, color, x, y, size) {
  const isRed = color === 'red';
  const colors = isRed ? SPRITE_COLORS.red : SPRITE_COLORS.blue;

  switch (type) {
    case 'k': drawKing(ctx, x, y, size, colors, isRed); break;
    case 'q': drawQueen(ctx, x, y, size, colors, isRed); break;
    case 'r': drawRook(ctx, x, y, size, colors, isRed); break;
    case 'n': drawKnight(ctx, x, y, size, colors, isRed); break;
    case 'b': drawBishop(ctx, x, y, size, colors, isRed); break;
    case 'p': drawPawn(ctx, x, y, size, colors, isRed); break;
  }
}
