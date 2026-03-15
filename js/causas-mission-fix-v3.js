(function(){
  const FIX_TAG = 'gcCausasMissionV3';
  const throttleMap = new WeakMap();
  let dragActive = false;

  function t(es,en){
    try{ return currentLang === 'en' ? en : es; }catch(_e){ return es; }
  }
  function stop(e){
    if(!e) return;
    try{ if(e.cancelable) e.preventDefault(); }catch(_e){}
    try{ e.stopPropagation(); }catch(_e){}
    try{ if(e.stopImmediatePropagation) e.stopImmediatePropagation(); }catch(_e){}
  }
  function throttle(el, gap){
    if(!el) return true;
    const now = Date.now();
    const prev = throttleMap.get(el) || 0;
    if(now - prev < (gap || 140)) return false;
    throttleMap.set(el, now);
    return true;
  }
  function toast(msg){
    try{ if(typeof showToast === 'function') showToast(msg); }catch(_e){}
  }
  function getState(){ try{ return state; }catch(_e){ return null; } }
  function getPicks(){ try{ return vehPick; }catch(_e){ return null; } }
  function vehDone(){ const s=getState(); return !!(s&&s.tasks&&s.tasks.causas&&s.tasks.causas.veh); }
  function quizDone(){ const s=getState(); return !!(s&&s.tasks&&s.tasks.causas&&s.tasks.causas.quiz); }
  function missionDone(){ const s=getState(); return !!(s&&s.completed&&s.completed.causas); }
  function laneText(level){ return ({low:t('Baja','Low'),mid:t('Media','Medium'),high:t('Alta','High')})[level] || level || ''; }
  function countDone(){ const s=getState(); return (!s||!s.tasks||!s.tasks.causas)?0:[s.tasks.causas.veh,s.tasks.causas.quiz].filter(Boolean).length; }
  function callNativeRefresh(){
    try{ if(typeof refreshMissionLocks === 'function') refreshMissionLocks(); }catch(_e){}
    try{ if(typeof refreshCommandMenuBadges === 'function') refreshCommandMenuBadges(); }catch(_e){}
    try{ if(typeof refreshPlanLock === 'function') refreshPlanLock(); }catch(_e){}
  }
  function save(){ try{ if(typeof saveState === 'function') saveState(); }catch(_e){} }
  function addPoints(n){ try{ if(typeof addScore === 'function') addScore(n); }catch(_e){} }
  function setChip(el, done){ if(!el) return; el.textContent = done ? t('✅ Listo','✅ Done') : t('⏳ Pendiente','⏳ Pending'); el.classList.toggle('done', !!done); }
  function getBusTrack(){ return document.querySelector('.drag-track[data-drag-track="bus"]'); }
  function getBusEl(){ return document.querySelector('.drag-bus[data-drag-bus="bus"]'); }
  function getBusLanes(){ return Array.from(document.querySelectorAll('.drag-lane[data-veh="bus"]')); }
  function positionBus(level){
    const bus=getBusEl(), track=getBusTrack();
    if(!bus||!track) return;
    let left=8;
    const lane=level ? track.querySelector('.drag-lane[data-veh="bus"][data-level="'+level+'"]') : null;
    if(lane) left = lane.offsetLeft + Math.max(0,(lane.offsetWidth-bus.offsetWidth)/2);
    bus.style.left = left + 'px';
    bus.classList.toggle('idle', !level);
    bus.classList.remove('dragging');
    try{ if(typeof syncBusAria === 'function') syncBusAria(level || null); }catch(_e){}
  }
  function syncVehicleUI(){
    const picks=getPicks();
    if(!picks) return;
    document.querySelectorAll('.tiny-choice[data-veh="car"], .tiny-choice[data-veh="metro"]').forEach(function(btn){
      const veh=btn.getAttribute('data-veh'), level=btn.getAttribute('data-level');
      btn.classList.toggle('selected', picks[veh] === level);
    });
    getBusLanes().forEach(function(lane){
      lane.classList.toggle('selected', picks.bus === lane.getAttribute('data-level'));
      lane.classList.remove('preview');
    });
    positionBus(picks.bus || null);
    const sim=document.querySelector('.drag-sim[data-drag-veh="bus"]');
    if(sim) sim.classList.toggle('guide-hidden', !!picks.bus || vehDone());
  }
  function syncProgressUI(){
    const progress=document.getElementById('causas-progress');
    if(progress) progress.textContent = t('Retos','Challenges') + ': ' + countDone() + '/2';
    setChip(document.getElementById('causas-chip-veh'), vehDone());
    setChip(document.getElementById('causas-chip-q'), quizDone());
    setChip(document.getElementById('causas-chip-m'), missionDone());
    const finish=document.getElementById('btn-complete-causas');
    if(finish){ finish.disabled = missionDone() || countDone() < 2; finish.setAttribute('aria-disabled', finish.disabled ? 'true' : 'false'); }
  }
  function syncAll(){ syncVehicleUI(); syncProgressUI(); }
  function clearVehFeedback(){ document.querySelectorAll('.tiny-choice[data-veh], .drag-lane[data-veh]').forEach(function(el){ el.classList.remove('correct','wrong','preview'); }); }
  function selectVehicle(veh, level, announce){
    const picks=getPicks();
    if(!picks) return false;
    if(vehDone()){ toast(t('Ya está listo ✅','Already done ✅')); return false; }
    picks[veh]=level;
    syncAll();
    if(announce && veh==='bus') toast(t('Bus en ','Bus in ') + laneText(level) + '.');
    return false;
  }
  function shiftBus(dir){
    const picks=getPicks();
    if(!picks) return false;
    const order=['low','mid','high'];
    let idx=order.indexOf(picks.bus || '');
    if(idx<0) idx = dir >= 0 ? -1 : order.length;
    idx=Math.max(0, Math.min(order.length-1, idx + (dir >= 0 ? 1 : -1)));
    return selectVehicle('bus', order[idx], true);
  }
  function pickBusFromClientX(clientX){
    const lanes=getBusLanes();
    if(!lanes.length) return false;
    let bestLevel='mid', bestDist=Infinity;
    lanes.forEach(function(lane){
      const r=lane.getBoundingClientRect(), center=r.left + (r.width/2), dist=Math.abs(clientX-center);
      if(dist<bestDist){ bestDist=dist; bestLevel=lane.getAttribute('data-level') || 'mid'; }
    });
    return selectVehicle('bus', bestLevel, true);
  }
  function resetVehicleMission(){
    const picks=getPicks();
    if(!picks) return false;
    if(vehDone()){ toast(t('Este reto ya quedó completado ✅','This challenge is already completed ✅')); return false; }
    picks.car=null; picks.bus=null; picks.metro=null;
    clearVehFeedback(); syncAll();
    toast(t('¡Reiniciado!','Reset!'));
    return false;
  }
  function checkVehicleMission(){
    const s=getState(), picks=getPicks();
    if(!s||!picks) return false;
    if(vehDone()){ toast(t('Ya está listo ✅','Already done ✅')); return false; }
    const answer={car:'high',bus:'mid',metro:'low'};
    clearVehFeedback();
    let ok=true;
    ['car','bus','metro'].forEach(function(veh){
      const chosen=picks[veh];
      if(!chosen){ ok=false; return; }
      const selector = veh === 'bus' ? '.drag-lane[data-veh="bus"][data-level="'+chosen+'"]' : '.tiny-choice[data-veh="'+veh+'"][data-level="'+chosen+'"]';
      const btn=document.querySelector(selector);
      if(chosen === answer[veh]){ if(btn) btn.classList.add('correct'); }
      else { ok=false; if(btn) btn.classList.add('wrong'); }
    });
    if(ok){
      s.tasks.causas.veh=true;
      addPoints(5); save(); callNativeRefresh(); syncAll();
      toast(t('¡Correcto! Ahora sigue con el mini-quiz.','Correct! Now continue with the mini-quiz.'));
    }else{
      syncAll();
      toast(t('Revisa tus respuestas e inténtalo otra vez.','Check your answers and try again.'));
    }
    return false;
  }
  function markQuiz(choice){
    const s=getState();
    if(!s) return false;
    if(quizDone()){ toast(t('Ya está listo ✅','Already done ✅')); return false; }
    document.querySelectorAll('.choice[data-quiz-id="causas-q"]').forEach(function(btn){ btn.classList.remove('selected','correct','wrong'); });
    choice.classList.add('selected');
    const ok=choice.hasAttribute('data-correct');
    if(ok){
      choice.classList.add('correct');
      s.tasks.causas.quiz=true;
      addPoints(5); save(); callNativeRefresh(); syncAll();
      toast(t('¡Muy bien! Ya puedes terminar la misión.','Great! You can now finish the mission.'));
    }else{
      choice.classList.add('wrong'); syncAll();
      toast(t('Respuesta incorrecta. Intenta otra vez.','Wrong answer. Try again.'));
    }
    return false;
  }
  function finishMission(){
    const s=getState();
    if(!s) return false;
    if(missionDone()){ toast(t('La misión ya fue completada ✅','The mission is already completed ✅')); return false; }
    if(countDone() < 2){ toast(t('Primero completa los 2 retos.','Complete both challenges first.')); syncAll(); return false; }
    try{
      if(typeof completeMission === 'function') completeMission('causas');
      else { s.completed.causas=true; addPoints(20); save(); }
    }catch(_e){ s.completed.causas=true; addPoints(20); save(); }
    callNativeRefresh(); syncAll();
    return false;
  }
  function bindTap(el, handler){
    if(!el || el.dataset[FIX_TAG] === '1') return;
    el.dataset[FIX_TAG]='1';
    const fire=function(e){ if(!throttle(el)){ stop(e); return false; } stop(e); handler(e); return false; };
    el.addEventListener('pointerdown', fire, true);
    el.addEventListener('click', fire, true);
    el.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' ' || e.key==='Spacebar'){ fire(e); } }, true);
  }
  function bindBusTrack(){
    const track=getBusTrack(), bus=getBusEl();
    if(!track || track.dataset.gcMissionTrackBound==='1') return;
    track.dataset.gcMissionTrackBound='1';
    track.addEventListener('pointerdown', function(e){
      if(vehDone()){ stop(e); toast(t('Ya está listo ✅','Already done ✅')); return false; }
      const target=e.target;
      if(target && target.closest && target.closest('.drag-lane[data-veh="bus"], .drag-arrow, .drag-bus')) return;
      if(!throttle(track,120)){ stop(e); return false; }
      stop(e);
      pickBusFromClientX(typeof e.clientX==='number' ? e.clientX : (track.getBoundingClientRect().left + track.clientWidth/2));
      return false;
    }, true);
    if(bus && bus.dataset.gcMissionDragBound!=='1'){
      bus.dataset.gcMissionDragBound='1';
      bus.addEventListener('pointerdown', function(e){
        if(vehDone()){ stop(e); toast(t('Ya está listo ✅','Already done ✅')); return false; }
        if(!throttle(bus,90)){ stop(e); return false; }
        dragActive=true; bus.classList.add('dragging'); stop(e); return false;
      }, true);
      window.addEventListener('pointermove', function(e){
        if(!dragActive || vehDone()) return;
        const trackEl=getBusTrack(), busEl=getBusEl();
        if(!trackEl || !busEl) return;
        const rect=trackEl.getBoundingClientRect();
        let left=e.clientX - rect.left - (busEl.offsetWidth/2);
        const min=8, max=Math.max(min, trackEl.clientWidth - busEl.offsetWidth - 8);
        left=Math.max(min, Math.min(max, left));
        busEl.style.left = left + 'px';
        busEl.classList.remove('idle');
        getBusLanes().forEach(function(lane){
          const r=lane.getBoundingClientRect(), center=r.left + (r.width/2), dist=Math.abs(e.clientX-center);
          lane.classList.toggle('preview', dist < (r.width/2));
        });
      }, true);
      const finishDrag=function(e){
        if(!dragActive) return;
        dragActive=false;
        const busEl=getBusEl();
        if(busEl) busEl.classList.remove('dragging');
        getBusLanes().forEach(function(lane){ lane.classList.remove('preview'); });
        if(vehDone()) return;
        const trackEl=getBusTrack();
        const x=(e && typeof e.clientX==='number') ? e.clientX : (trackEl ? trackEl.getBoundingClientRect().left + (trackEl.clientWidth/2) : 0);
        pickBusFromClientX(x);
      };
      window.addEventListener('pointerup', finishDrag, true);
      window.addEventListener('pointercancel', finishDrag, true);
    }
  }
  function install(){
    if(!document.getElementById('causas')) return;
    document.querySelectorAll('.tiny-choice[data-veh="car"], .tiny-choice[data-veh="metro"]').forEach(function(btn){ bindTap(btn, function(){ selectVehicle(btn.getAttribute('data-veh'), btn.getAttribute('data-level'), false); }); });
    getBusLanes().forEach(function(lane){ bindTap(lane, function(){ selectVehicle('bus', lane.getAttribute('data-level'), true); }); });
    bindTap(document.querySelector('.drag-arrow.left[data-drag-step="-1"]'), function(){ shiftBus(-1); });
    bindTap(document.querySelector('.drag-arrow.right[data-drag-step="1"]'), function(){ shiftBus(1); });
    bindTap(getBusEl(), function(){ shiftBus(1); });
    bindBusTrack();
    bindTap(document.getElementById('btn-check-veh') || document.querySelector('[data-action="check-veh"]'), checkVehicleMission);
    bindTap(document.getElementById('btn-reset-veh') || document.querySelector('[data-action="reset-veh"]'), resetVehicleMission);
    document.querySelectorAll('.choice[data-quiz-id="causas-q"]').forEach(function(choice){ bindTap(choice, function(){ markQuiz(choice); }); });
    bindTap(document.getElementById('btn-complete-causas'), finishMission);
    syncAll();
  }
  function boot(){ install(); syncAll(); }
  window.addEventListener('DOMContentLoaded', boot);
  window.addEventListener('load', boot);
  window.addEventListener('pageshow', boot);
  window.addEventListener('hashchange', function(){ setTimeout(syncAll,60); });
  setTimeout(boot,250); setTimeout(boot,900); setTimeout(boot,1800);
})();
