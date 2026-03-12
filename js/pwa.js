(function(){
  const BUILD_ID = 'guardianes-build-v6-recovery';
  let deferredPrompt = null;
  let installBtn = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function toast(msg){
    if(typeof window.showToast === 'function') window.showToast(msg);
    else console.log(msg);
  }

  async function clearOldAppCachesOnce(){
    const key = 'gc_build_id';
    try{
      const previous = localStorage.getItem(key);
      if(previous === BUILD_ID) return false;
      localStorage.setItem(key, BUILD_ID);
      if('serviceWorker' in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister().catch(()=>false)));
      }
      if('caches' in window){
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => /^guardianes-/i.test(k)).map(k => caches.delete(k)));
      }
      return true;
    }catch(err){
      console.warn('No se pudo limpiar caché PWA', err);
      return false;
    }
  }

  function ensureInstallBtn(){
    if(installBtn || isStandalone) return installBtn;
    installBtn = document.createElement('button');
    installBtn.id = 'install-app-btn';
    installBtn.type = 'button';
    installBtn.setAttribute('aria-label','Instalar app');
    installBtn.textContent = '📲 Instalar app';
    installBtn.style.cssText = [
      'position:fixed','left:14px','bottom:calc(env(safe-area-inset-bottom,0px) + 94px)','z-index:9999',
      'display:none','padding:12px 16px','border:none','border-radius:999px','font-weight:800',
      'background:#1a5e2a','color:#fff','box-shadow:0 12px 28px rgba(0,0,0,.22)','font:700 14px/1.1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif'
    ].join(';');
    installBtn.addEventListener('click', async () => {
      if(deferredPrompt){
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice.catch(()=>null);
        if(choice && choice.outcome === 'accepted') toast('App instalada en tu dispositivo.');
        deferredPrompt = null;
        installBtn.style.display = 'none';
        return;
      }
      const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if(isiOS && !isStandalone) toast('En iPhone o iPad: Compartir → Añadir a pantalla de inicio.');
    });
    document.body.appendChild(installBtn);
    return installBtn;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = ensureInstallBtn();
    if(btn) btn.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', () => {
    toast('Guardianes Climáticos quedó instalada correctamente.');
    if(installBtn) installBtn.style.display = 'none';
  });

  window.addEventListener('load', async () => {
    const cacheResetDone = await clearOldAppCachesOnce();
    if(cacheResetDone){
      const url = new URL(location.href);
      url.searchParams.set('v', BUILD_ID);
      location.replace(url.toString());
      return;
    }

    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('./service-worker.js').then(reg => {
        try{ reg.update(); }catch(_e){}
      }).catch(err => console.warn('SW no registrado', err));
    }

    const isiOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if(isiOS && !isStandalone){
      setTimeout(()=>{
        if(!document.hidden) toast('Tip: en iPhone puedes usar Compartir → Añadir a pantalla de inicio.');
      }, 2200);
    }
  });

  window.addEventListener('online', ()=>toast('Conexión recuperada.'));
  window.addEventListener('offline', ()=>toast('Modo offline activo. Puedes seguir con lo guardado.'));
})();
