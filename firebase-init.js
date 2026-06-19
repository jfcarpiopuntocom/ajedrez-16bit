// firebase-init.js — Cross-device multiverse via Realtime DB
(async function(){
  if(!window.FIREBASE_CONFIG) return;
  try{
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js');
    const { getDatabase, ref, set, get } = await import('https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js');
    const app = initializeApp(window.FIREBASE_CONFIG);
    const db = getDatabase(app);
    window.fbSave = async (code, data) => {
      try { await set(ref(db, 'games/' + code), data); } catch(e) {}
    };
    window.fbLoad = async (code) => {
      try {
        const snap = await get(ref(db, 'games/' + code));
        return snap.exists() ? snap.val() : null;
      } catch(e) { return null; }
    };
  } catch(e) { console.log('Firebase init skipped (offline or config missing)'); }
})();
