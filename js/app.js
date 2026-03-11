(function(){
  function go(hash){
    try { window.location.href = './index.html' + (hash || '#home'); }
    catch(e){ window.location = './index.html' + (hash || '#home'); }
  }

  window.ir = function(id){
    if(!id) return go('#home');
    const safe = String(id).replace(/^#/, '');
    go('#' + safe);
  };

  window.completar = function(){
    const current = Number(localStorage.getItem('gc_legacy_progress') || 0);
    localStorage.setItem('gc_legacy_progress', String(Math.min(100, current + 20)));
    return true;
  };

  window.elegirAvatar = function(color){
    localStorage.setItem('gc_avatar', String(color || 'verde'));
    go('#home');
  };

  window.completarZona = function(zona){
    const key = 'gc_legacy_zones';
    let data = [];
    try { data = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e) { data = []; }
    if(zona && !data.includes(zona)) data.push(zona);
    localStorage.setItem(key, JSON.stringify(data));
    go('#command');
  };

  document.addEventListener('DOMContentLoaded', function(){
    const legacyPage = (location.pathname.split('/').pop() || '').toLowerCase();
    const map = {
      'avatar.html':'#home',
      'final.html':'#plan',
      'zona-agua.html':'#causas',
      'zona-ciudad.html':'#consecuencias',
      'zona-energia.html':'#soluciones',
      'zona-naturaleza.html':'#causas'
    };
    if(map[legacyPage]){
      const note = document.getElementById('legacy-note');
      if(note){ note.textContent = 'Esta ruta es heredada. Serás llevado a la experiencia principal.'; }
      setTimeout(function(){ go(map[legacyPage]); }, 900);
    }
  });
})();
