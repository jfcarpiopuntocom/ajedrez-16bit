/**
 * EL REINO DE JUANFERLAND
 * Audio retro estilo AdLib / Roland MT-32 / LucasArts
 * Usando Web Audio API (sin archivos externos)
 */

let audioContext;

function initAudio() {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('[Audio] Web Audio API no disponible. Sonido desactivado.');
    audioContext = null;
  }
}

function playTone(freq, duration, type = 'square', volume = 0.2) {
  if (!audioContext) return;

  try {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    oscillator.type = type;
    oscillator.frequency.value = freq;

    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    gain.gain.value = volume;

    const now = audioContext.currentTime;

    // Envelope retro
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (e) {}
}

const SFX = {
  move: () => playTone(380, 0.08, 'square', 0.15),
  capture: () => {
    playTone(220, 0.12, 'sawtooth', 0.22);
    setTimeout(() => playTone(180, 0.18, 'square', 0.18), 60);
  },
  check: () => {
    playTone(660, 0.1, 'square', 0.3);
    setTimeout(() => playTone(880, 0.25, 'square', 0.25), 90);
  },
  mate: () => {
    playTone(440, 0.15, 'sawtooth', 0.3);
    setTimeout(() => playTone(330, 0.15, 'sawtooth', 0.3), 120);
    setTimeout(() => playTone(220, 0.4, 'sawtooth', 0.35), 240);
  },
  promotion: () => {
    playTone(523, 0.08, 'sine', 0.2);
    setTimeout(() => playTone(659, 0.08, 'sine', 0.2), 70);
    setTimeout(() => playTone(784, 0.08, 'sine', 0.2), 140);
    setTimeout(() => playTone(1046, 0.3, 'sine', 0.25), 210);
  },
  click: () => playTone(1200, 0.04, 'square', 0.12),
};

function playSound(name) {
  if (!audioContext || !SFX[name]) return;
  try {
    SFX[name]();
  } catch (e) {
    // Silencioso si falla
  }
}

// Failsafe: si el audio falla, no hacer nada más
window.addEventListener('error', () => {
  // No rompemos el juego por audio
});
