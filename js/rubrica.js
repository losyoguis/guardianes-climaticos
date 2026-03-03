/* =========================================================
   Guardianes Climáticos — Rúbrica + explicación gamificación
   - Botón flotante siempre visible
   - Modal accesible (ESC, click afuera)
   - Pensado para primaria (lenguaje simple)
   ========================================================= */

(function () {
  if (window.__GC_RUBRICA_LOADED__) return;
  window.__GC_RUBRICA_LOADED__ = true;

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  onReady(function () {
    // --- Styles (injected) ---
    if (!document.getElementById('gc-rubrica-style')) {
      var style = document.createElement('style');
      style.id = 'gc-rubrica-style';
      style.textContent = `
        :root{--gc-rubrica-z:1600;}
        #gc-rubrica-fab{
          position:fixed;
          left:14px;
          bottom:calc(14px + env(safe-area-inset-bottom, 0px));
          z-index:var(--gc-rubrica-z);
          border:none;
          cursor:pointer;
          padding:12px 14px;
          border-radius:18px;
          font-family:inherit;
          font-weight:900;
          font-size:0.95rem;
          display:inline-flex;
          align-items:center;
          gap:10px;
          background:rgba(255,255,255,.92);
          color:#0b2b18;
          border:2px solid rgba(0,0,0,.18);
          box-shadow:0 10px 0 rgba(0,0,0,.14), 0 18px 40px rgba(0,0,0,.12);
          backdrop-filter: blur(10px);
          transition:transform .18s ease, box-shadow .18s ease;
        }
        #gc-rubrica-fab:hover{transform:translateY(-2px);box-shadow:0 12px 0 rgba(0,0,0,.14), 0 22px 52px rgba(0,0,0,.14)}
        #gc-rubrica-fab:active{transform:translateY(4px);box-shadow:0 6px 0 rgba(0,0,0,.14), 0 12px 32px rgba(0,0,0,.10)}
        #gc-rubrica-fab .badge{display:inline-flex;align-items:center;justify-content:center;
          width:34px;height:34px;border-radius:14px;
          background:linear-gradient(135deg, #00e676, #FFD600);
          border:2px solid rgba(0,0,0,.25);
          box-shadow:0 6px 0 rgba(0,0,0,.16);
          font-size:1.05rem;
        }
        /* Si el body usa 'belt-on' (versión index), sube el botón para no tapar el cinturón móvil */
        body.belt-on #gc-rubrica-fab{
          bottom:calc(14px + env(safe-area-inset-bottom, 0px) + var(--belt-h, 124px));
        }

        #gc-rubrica-overlay{
          position:fixed;inset:0;z-index:99999;
          background:rgba(0,0,0,.55);
          display:none;
          align-items:center;justify-content:center;
          padding:16px;
        }
        #gc-rubrica-overlay.show{display:flex;}

        .gc-rubrica-dialog{
          width:min(980px, 100%);
          max-height:min(88dvh, 720px);
          overflow:hidden;
          border-radius:22px;
          background:rgba(255,255,255,.95);
          border:3px solid rgba(0,0,0,.25);
          box-shadow:0 30px 120px rgba(0,0,0,.55);
          display:flex;flex-direction:column;
        }
        body.dark .gc-rubrica-dialog{background:rgba(17,24,32,.96); border-color:rgba(255,255,255,.18)}

        .gc-rubrica-head{
          display:flex;align-items:center;justify-content:space-between;gap:12px;
          padding:12px 14px;
          background:linear-gradient(90deg, rgba(0,230,118,.25), rgba(255,214,0,.18), rgba(255,109,0,.18));
          border-bottom:1px solid rgba(0,0,0,.12);
        }
        body.dark .gc-rubrica-head{border-bottom:1px solid rgba(255,255,255,.12)}

        .gc-rubrica-title{
          display:flex;align-items:center;gap:10px;
          font-weight:900;
          letter-spacing:.2px;
          font-size:1.05rem;
        }
        .gc-rubrica-actions{display:flex;align-items:center;gap:10px;flex:0 0 auto}
        .gc-rubrica-btn{
          border:none;cursor:pointer;
          padding:10px 12px;border-radius:14px;
          font-weight:900;font-family:inherit;
          background:rgba(255,255,255,.92);
          border:2px solid rgba(0,0,0,.18);
          box-shadow:0 6px 0 rgba(0,0,0,.10);
          transition:transform .18s ease, box-shadow .18s ease;
        }
        body.dark .gc-rubrica-btn{background:rgba(17,24,32,.88); color:rgba(233,242,251,.95); border-color:rgba(255,255,255,.18)}
        .gc-rubrica-btn:hover{transform:translateY(-2px);box-shadow:0 8px 0 rgba(0,0,0,.10)}
        .gc-rubrica-btn:active{transform:translateY(3px);box-shadow:0 4px 0 rgba(0,0,0,.10)}

        .gc-rubrica-body{
          padding:14px;
          overflow:auto;
          color:inherit;
        }
        .gc-rubrica-body h3{margin:12px 0 8px;font-size:1.05rem}
        .gc-rubrica-body p{line-height:1.45;margin:8px 0;font-size:.98rem}
        .gc-rubrica-kids{padding:12px 14px;border-radius:18px;
          background:rgba(100,181,246,.18);border:2px solid rgba(21,101,192,.20);
        }
        body.dark .gc-rubrica-kids{background:rgba(100,181,246,.12);border-color:rgba(100,181,246,.22)}

        .gc-rubrica-list{margin:10px 0 0 0;padding-left:18px}
        .gc-rubrica-list li{margin:6px 0;line-height:1.35}

        .gc-rubrica-note{
          margin-top:10px;
          padding:10px 12px;
          border-radius:16px;
          background:rgba(0,230,118,.14);
          border:2px solid rgba(0,230,118,.22);
          font-weight:700;
        }
        body.dark .gc-rubrica-note{background:rgba(0,230,118,.10);border-color:rgba(0,230,118,.22)}

        .gc-rubrica-table-wrap{margin-top:12px;overflow:auto;border-radius:18px;border:2px solid rgba(0,0,0,.12)}
        body.dark .gc-rubrica-table-wrap{border-color:rgba(255,255,255,.14)}
        .gc-rubrica-table{border-collapse:separate;border-spacing:0;width:100%;min-width:880px;background:rgba(255,255,255,.75)}
        body.dark .gc-rubrica-table{background:rgba(17,24,32,.75)}
        .gc-rubrica-table th,.gc-rubrica-table td{vertical-align:top;padding:12px 12px;border-bottom:1px solid rgba(0,0,0,.10)}
        body.dark .gc-rubrica-table th, body.dark .gc-rubrica-table td{border-bottom:1px solid rgba(255,255,255,.10)}
        .gc-rubrica-table th{position:sticky;top:0;background:rgba(255,255,255,.98);z-index:2;text-align:left}
        body.dark .gc-rubrica-table th{background:rgba(17,24,32,.98)}
        .gc-rubrica-table tr:last-child td{border-bottom:none}
        .gc-rubrica-table .col-crit{width:180px;font-weight:900}
        .gc-rubrica-pill{display:inline-flex;align-items:center;gap:8px;font-weight:900}
        .gc-rubrica-mini{opacity:.85;font-weight:700;font-size:.92rem}

        .gc-rubrica-scorehint{
          margin-top:12px;
          padding:12px 14px;
          border-radius:18px;
          background:rgba(255,109,0,.12);
          border:2px solid rgba(255,109,0,.18);
        }
        body.dark .gc-rubrica-scorehint{background:rgba(255,109,0,.10);border-color:rgba(255,109,0,.20)}

        /* Mobile: allow smaller dialog height */
        @media (max-width: 520px){
          .gc-rubrica-dialog{max-height:92dvh}
          .gc-rubrica-body{padding:12px}
          #gc-rubrica-fab{left:10px;bottom:calc(10px + env(safe-area-inset-bottom, 0px));border-radius:16px}
          body.belt-on #gc-rubrica-fab{bottom:calc(10px + env(safe-area-inset-bottom, 0px) + var(--belt-h, 124px));}
        }
      `;
      document.head.appendChild(style);
    }

    // --- Build UI ---
    var fab = document.createElement('button');
    fab.id = 'gc-rubrica-fab';
    fab.type = 'button';
    fab.setAttribute('aria-label', 'Abrir rúbrica de evaluación');
    fab.innerHTML = '<span class="badge">📋</span><span>Rúbrica</span>';

    var overlay = document.createElement('div');
    overlay.id = 'gc-rubrica-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Rúbrica de evaluación');
    overlay.innerHTML = `
      <div class="gc-rubrica-dialog" tabindex="-1">
        <div class="gc-rubrica-head">
          <div class="gc-rubrica-title">🧩 Guía de juego + Rúbrica</div>
          <div class="gc-rubrica-actions">
            <button type="button" class="gc-rubrica-btn" data-gc-rubrica="print" aria-label="Imprimir">🖨️</button>
            <button type="button" class="gc-rubrica-btn" data-gc-rubrica="close" aria-label="Cerrar">✖️</button>
          </div>
        </div>

        <div class="gc-rubrica-body">
          <div class="gc-rubrica-kids">
            <h3>🎮 ¿Cómo funciona la gamificación y los retos?</h3>
            <p>
              En esta app tú eres un <b>Guardián Climático</b>. Vas ganando <b>⭐ puntos</b> mientras superas retos.
              Cada reto te da retroalimentación inmediata (“¡Correcto!” o “Intenta otra vez 🙂”).
            </p>
            <ul class="gc-rubrica-list">
              <li><b>1) Aceptas la misión</b> con el personaje “Guardia”.</li>
              <li><b>2) Sigues el recorrido</b>: Briefing → Señal climática → Mapa de visión → <b>Cinturón</b>.</li>
              <li><b>3) Eliges una misión</b> (🔥 Causas / 🌊 Consecuencias / 💡 Soluciones).</li>
              <li><b>4) En cada misión haces 2 retos</b> (mini‑juegos y mini‑quizzes). Cada uno suma <b>+5 ⭐</b>.</li>
              <li><b>5) Cuando completas los 2 retos</b>, puedes marcar la misión como lograda y ganas <b>+20 ⭐</b>.</li>
              <li><b>6) Al completar las 3 misiones</b>, se desbloquea la <b>MISIÓN FINAL</b>: 📋 Plan Guardián (<b>+40 ⭐</b>).</li>
              <li><b>7) Al final</b> aparece tu <b>puntaje total</b>. Puedes tomar captura como evidencia.</li>
            </ul>
            <div class="gc-rubrica-note">💡 Tip docente: los ⭐ puntos muestran avance, pero la evaluación valora también comprensión y acción.</div>
          </div>

          <h3>🧑‍🏫 Rúbrica de evaluación</h3>
          <p class="gc-rubrica-mini">
            Niveles (1 a 4): 🌱 <b>Semilla</b> (necesita ayuda) · 🌿 <b>Brote</b> (va mejorando) · 🌳 <b>Árbol</b> (lo logra) · 🛡️ <b>Guardián Pro</b> (lo supera)
          </p>

          <div class="gc-rubrica-table-wrap" role="region" aria-label="Tabla de rúbrica (desliza horizontalmente)">
            <table class="gc-rubrica-table">
              <thead>
                <tr>
                  <th class="col-crit">Criterio</th>
                  <th><span class="gc-rubrica-pill">🌱 Semilla</span><div class="gc-rubrica-mini">(1)</div></th>
                  <th><span class="gc-rubrica-pill">🌿 Brote</span><div class="gc-rubrica-mini">(2)</div></th>
                  <th><span class="gc-rubrica-pill">🌳 Árbol</span><div class="gc-rubrica-mini">(3)</div></th>
                  <th><span class="gc-rubrica-pill">🛡️ Guardián Pro</span><div class="gc-rubrica-mini">(4)</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="col-crit">1) Participación y perseverancia</td>
                  <td>Se distrae con facilidad y abandona los retos; necesita mucha guía para continuar.</td>
                  <td>Participa por momentos; intenta de nuevo cuando se le anima; requiere recordatorios.</td>
                  <td>Se mantiene activo, intenta varias veces y termina la mayoría de retos sin rendirse.</td>
                  <td>Participa con energía, ayuda a otros y demuestra constancia incluso si se equivoca.</td>
                </tr>
                <tr>
                  <td class="col-crit">2) Uso de la app (competencia digital)</td>
                  <td>Le cuesta navegar; presiona al azar; necesita acompañamiento constante.</td>
                  <td>Navega con ayuda; entiende algunos botones; mejora con práctica.</td>
                  <td>Navega bien (cinturón, verificar, reiniciar); usa la app con cuidado y respeto.</td>
                  <td>Explora con seguridad, explica a otros cómo navegar y cuida el dispositivo/turnos.</td>
                </tr>
                <tr>
                  <td class="col-crit">3) Comprende las <b>causas</b> (Misión 1)</td>
                  <td>Confunde qué contamina más; no identifica el rol del CO₂ sin apoyo.</td>
                  <td>Reconoce algunas causas (transporte/CO₂) pero con errores frecuentes.</td>
                  <td>Identifica correctamente causas principales y explica “CO₂ como manta” con sus palabras.</td>
                  <td>Relaciona varias causas, da ejemplos cercanos (casa/colegio) y argumenta sus elecciones.</td>
                </tr>
                <tr>
                  <td class="col-crit">4) Comprende <b>consecuencias</b> (Misión 2)</td>
                  <td>No logra ordenar la cadena o no reconoce consecuencias reales.</td>
                  <td>Ordena parte de la cadena; reconoce una consecuencia con ayuda.</td>
                  <td>Ordena la cadena completa y reconoce consecuencias como lluvias fuertes e inundaciones.</td>
                  <td>Explica cómo afecta a Medellín (laderas, deslizamientos) y propone cómo cuidarse.</td>
                </tr>
                <tr>
                  <td class="col-crit">5) Propone <b>soluciones</b> (Misión 3)</td>
                  <td>Elige compromisos al azar o no puede justificar; requiere mucha guía.</td>
                  <td>Elige 1–2 acciones útiles; explica de forma simple; necesita apoyo para completar.</td>
                  <td>Elige 3 compromisos realistas y justifica cómo ayudan (energía, residuos, agua).</td>
                  <td>Propone acciones extra, adapta soluciones al salón/casa y motiva a sus compañeros.</td>
                </tr>
                <tr>
                  <td class="col-crit">6) Cumplimiento de misiones y evidencia</td>
                  <td>No completa misiones o no registra evidencia (sin puntaje final/captura).</td>
                  <td>Completa 1 misión y registra evidencia parcial (captura o reporte oral).</td>
                  <td>Completa 2–3 misiones y muestra evidencia clara (puntaje final/captura).</td>
                  <td>Completa 3 misiones + Plan Guardián, comparte evidencia y una reflexión breve.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="gc-rubrica-scorehint">
            <b>Cómo calificar rápido (sugerencia):</b>
            <ul class="gc-rubrica-list">
              <li>Asigna 1–4 puntos por criterio. Total máximo (6 criterios): <b>24</b>.</li>
              <li>Si trabajaron en equipos, la “Participación” y “Trabajo con otros” se observa en el aula.</li>
              <li>Usa el <b>puntaje ⭐ final</b> como evidencia de avance, no como la única nota.</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    var dialog = overlay.querySelector('.gc-rubrica-dialog');
    var btnClose = overlay.querySelector('[data-gc-rubrica="close"]');
    var btnPrint = overlay.querySelector('[data-gc-rubrica="print"]');
    var lastFocus = null;

    function openRubrica() {
      lastFocus = document.activeElement;
      overlay.classList.add('show');
      // Focus dialog for accessibility
      setTimeout(function () { dialog && dialog.focus(); }, 0);
    }

    function closeRubrica() {
      overlay.classList.remove('show');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function printRubrica() {
      try {
        var contentEl = overlay.querySelector('.gc-rubrica-body');
        if (!contentEl) return;
        var content = contentEl.innerHTML;

        // Prefer printing via a hidden iframe (avoids popup blockers and is more consistent)
        var iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        document.body.appendChild(iframe);

        var css = `
          @page{margin:14mm;}
          body{font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; padding:0; color:#111;}
          h3{margin:12px 0 8px;}
          p,li{line-height:1.35;}
          .gc-rubrica-kids, .gc-rubrica-scorehint{border:1px solid #ddd;border-radius:12px;padding:12px;margin:10px 0;}
          table{border-collapse:collapse;width:100%;font-size:12.5px;}
          th,td{border:1px solid #ddd;padding:8px;vertical-align:top;}
          th{background:#f7f7f7;}
          .gc-rubrica-table-wrap{border:none;overflow:visible;}
        `;

        var doc = iframe.contentWindow && iframe.contentWindow.document;
        if (!doc) {
          iframe.remove();
          return;
        }
        doc.open();
        doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Rúbrica — Guardianes Climáticos</title><style>${css}</style></head><body>${content}</body></html>`);
        doc.close();

        // Print (kept synchronous to preserve "user gesture" in most browsers)
        var printed = false;
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          printed = true;
        } catch (e) {
          printed = false;
        }

        // Fallback: popup window (in case iframe printing is blocked)
        if (!printed) {
          try {
            var w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
            if (w) {
              w.document.open();
              w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Rúbrica — Guardianes Climáticos</title><style>${css}</style></head><body>${content}</body></html>`);
              w.document.close();
              w.focus();
              w.print();
            }
          } catch (e2) {}
        }

        setTimeout(function () {
          try { iframe.remove(); } catch (e3) {}
        }, 900);
      } catch (e) {
        // Silent fail
      }
    }

    fab.addEventListener('click', openRubrica);
    btnClose.addEventListener('click', closeRubrica);
    btnPrint.addEventListener('click', printRubrica);

    // Close on click outside
    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) closeRubrica();
    });

    // ESC + basic focus trap
    document.addEventListener('keydown', function (ev) {
      if (!overlay.classList.contains('show')) return;
      if (ev.key === 'Escape') {
        ev.preventDefault();
        closeRubrica();
        return;
      }
      if (ev.key === 'Tab') {
        // trap focus inside modal
        var focusables = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusables = Array.prototype.slice.call(focusables).filter(function (el) {
          return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
        });
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    });
  });
})();
