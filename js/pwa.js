(function(){
  let deferredPrompt = null;
  let installBtn = null;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function toast(msg){
    if(typeof window.showToast === 'function') window.showToast(msg);
    else console.log(msg);
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
      if(isiOS && !isStandalone){ toast('En iPhone o iPad: Compartir → Añadir a pantalla de inicio.'); }
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

  window.addEventListener('load', () => {
    if('serviceWorker' in navigator){
      navigator.serviceWorker.getRegistrations()
        .then(regs => Promise.all(regs.map(reg => reg.update().catch(()=>null))))
        .catch(()=>null);

      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          reg.update().catch(()=>null);
          if(reg.waiting){
            reg.waiting.postMessage({ type:'SKIP_WAITING' });
          }
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if(!installing) return;
            installing.addEventListener('statechange', () => {
              if(installing.state === 'installed' && navigator.serviceWorker.controller){
                toast('La app se actualizó. Recarga si ves una versión anterior.');
              }
            });
          });
        })
        .catch(err => console.warn('SW no registrado', err));
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