/**
 * EL REINO DE JUANFERLAND
 * Sistema de guardado con redundancia (IndexedDB + LocalStorage + JSON)
 */

const STORAGE_KEY = 'juanferland_game_v1';

async function saveGame(state) {
  const data = JSON.stringify(state);

  // Plan A: IndexedDB (preferido)
  try {
    await saveToIndexedDB(data);
  } catch (e) {
    console.warn('[Storage] IndexedDB falló, usando LocalStorage');
  }

  // Plan B: LocalStorage
  try {
    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    console.warn('[Storage] LocalStorage falló');
  }
}

async function loadGame() {
  // Intentar IndexedDB primero
  try {
    const idbData = await loadFromIndexedDB();
    if (idbData) {
      return JSON.parse(idbData);
    }
  } catch (e) {}

  // LocalStorage
  try {
    const lsData = localStorage.getItem(STORAGE_KEY);
    if (lsData) return JSON.parse(lsData);
  } catch (e) {}

  return null;
}

function exportGame(state) {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `juanferland_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importGame(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const state = JSON.parse(e.target.result);
      callback(state);
    } catch (err) {
      alert('Archivo de guardado corrupto');
    }
  };
  reader.readAsText(file);
}

// IndexedDB helpers
let db;

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('JuanferlandDB', 1);
    request.onupgradeneeded = (e) => {
      db = e.target.result;
      if (!db.objectStoreNames.contains('games')) {
        db.createObjectStore('games', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    request.onerror = reject;
  });
}

async function saveToIndexedDB(data) {
  if (!db) await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['games'], 'readwrite');
    const store = tx.objectStore('games');
    store.put({ id: 'current', data, timestamp: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = reject;
  });
}

async function loadFromIndexedDB() {
  if (!db) await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['games'], 'readonly');
    const store = tx.objectStore('games');
    const req = store.get('current');
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = reject;
  });
}
