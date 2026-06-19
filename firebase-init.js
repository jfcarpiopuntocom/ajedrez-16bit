// firebase-init.js — Cross-device multiverse via Realtime DB
(async function(){
  if(!window.FIREBASE_CONFIG) return;
  try{
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const { getDatabase, ref, set, get } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    const app = initializeApp(window.FIREBASE_CONFIG);
    const db = getDatabase(app);
    // Returns true/false (not undefined) so callers can show a real cloud-save confirmation
    // instead of assuming success. Used by the "Guardar" panel's cloud-sync indicator.
    window.fbSave = async (code, data) => {
      try { await set(ref(db, 'games/' + code), data); return true; } catch(e) { return false; }
    };
    window.fbLoad = async (code) => {
      try {
        const snap = await get(ref(db, 'games/' + code));
        return snap.exists() ? snap.val() : null;
      } catch(e) { return null; }
    };
  } catch(e) { console.log('Firebase init skipped (offline or config missing)'); }
})();
