(function(){
  const BUILD_ID = 'gcfix7-nopwa';
  async function cleanup(){
    try{
      if('serviceWorker' in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister().catch(() => false)));
      }
      if('caches' in window){
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => /guardianes|gcmed|climatic/i.test(k)).map(k => caches.delete(k)));
      }
      try{ localStorage.setItem('gc_build_id', BUILD_ID); }catch(_e){}
    }catch(err){
      console.warn('PWA cleanup warning', err);
    }
  }
  window.addEventListener('load', function(){ cleanup(); });
})();
