(function(){
  'use strict';

  const PORTRAIT = { pixelWidth: 1240, pixelHeight: 1754, pdfWidth: 595.28, pdfHeight: 841.89 };
  const LANDSCAPE = { pixelWidth: 1754, pixelHeight: 1240, pdfWidth: 841.89, pdfHeight: 595.28 };
  const encoder = new TextEncoder();

  function config(){
    return window.GC_EMAIL_CONFIG || {};
  }

  function makeCanvas(size){
    const canvas = document.createElement('canvas');
    canvas.width = size.pixelWidth;
    canvas.height = size.pixelHeight;
    return canvas;
  }

  function roundedRect(ctx, x, y, width, height, radius){
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function fillRoundedRect(ctx, x, y, width, height, radius, fill, stroke, lineWidth){
    ctx.save();
    roundedRect(ctx, x, y, width, height, radius);
    if(fill){ ctx.fillStyle = fill; ctx.fill(); }
    if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 2; ctx.stroke(); }
    ctx.restore();
  }

  function normalizeText(value){
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function splitLines(ctx, text, maxWidth){
    const paragraphs = String(text == null ? '' : text).split(/\n/);
    const lines = [];
    paragraphs.forEach((paragraph, paragraphIndex)=>{
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if(!words.length){ lines.push(''); return; }
      let line = '';
      words.forEach(word=>{
        const candidate = line ? `${line} ${word}` : word;
        if(ctx.measureText(candidate).width <= maxWidth){
          line = candidate;
          return;
        }
        if(line) lines.push(line);
        if(ctx.measureText(word).width <= maxWidth){
          line = word;
          return;
        }
        let part = '';
        Array.from(word).forEach(char=>{
          const next = part + char;
          if(ctx.measureText(next).width > maxWidth && part){
            lines.push(part);
            part = char;
          }else{
            part = next;
          }
        });
        line = part;
      });
      if(line) lines.push(line);
      if(paragraphIndex < paragraphs.length - 1) lines.push('');
    });
    return lines;
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, options){
    const opts = options || {};
    ctx.save();
    ctx.font = opts.font || '700 30px Arial, sans-serif';
    ctx.fillStyle = opts.color || '#15304b';
    ctx.textAlign = opts.align || 'left';
    ctx.textBaseline = 'top';
    const lines = splitLines(ctx, text, maxWidth);
    const maxLines = Number(opts.maxLines || 0);
    const visible = maxLines > 0 ? lines.slice(0, maxLines) : lines;
    if(maxLines > 0 && lines.length > maxLines && visible.length){
      let last = visible[visible.length - 1].replace(/\s+$/,'');
      while(last && ctx.measureText(last + '…').width > maxWidth) last = last.slice(0, -1);
      visible[visible.length - 1] = last + '…';
    }
    visible.forEach((line, index)=>ctx.fillText(line, x, y + index * lineHeight));
    ctx.restore();
    return y + visible.length * lineHeight;
  }

  function drawLabel(ctx, text, x, y){
    ctx.save();
    ctx.font = '800 20px Arial, sans-serif';
    ctx.fillStyle = '#5a718a';
    ctx.textBaseline = 'top';
    ctx.fillText(String(text || '').toUpperCase(), x, y);
    ctx.restore();
  }

  function loadImage(dataUrl){
    return new Promise((resolve, reject)=>{
      if(!dataUrl){ reject(new Error('image-empty')); return; }
      const img = new Image();
      img.onload = ()=>resolve(img);
      img.onerror = ()=>reject(new Error('image-load'));
      img.src = dataUrl;
    });
  }

  function drawContainedImage(ctx, img, x, y, width, height){
    const ratio = Math.min(width / img.naturalWidth, height / img.naturalHeight);
    const w = img.naturalWidth * ratio;
    const h = img.naturalHeight * ratio;
    ctx.drawImage(img, x + (width - w) / 2, y + (height - h) / 2, w, h);
  }

  function dataUrlToBytes(dataUrl){
    const base64 = String(dataUrl || '').split(',')[1] || '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for(let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  function concatBytes(chunks){
    const total = chunks.reduce((sum, chunk)=>sum + chunk.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    chunks.forEach(chunk=>{ out.set(chunk, offset); offset += chunk.length; });
    return out;
  }

  function textBytes(value){ return encoder.encode(String(value)); }

  function buildPdfFromJpegPages(pages){
    if(!Array.isArray(pages) || !pages.length) throw new Error('No hay páginas para crear el PDF.');
    const objectCount = 2 + pages.length * 3;
    const objects = new Array(objectCount + 1);
    const pageObjectNumbers = [];

    objects[1] = [textBytes('<< /Type /Catalog /Pages 2 0 R >>')];

    pages.forEach((page, index)=>{
      const pageObj = 3 + index * 3;
      const contentObj = pageObj + 1;
      const imageObj = pageObj + 2;
      pageObjectNumbers.push(pageObj);
      const imageName = `Im${index + 1}`;
      const content = `q\n${page.pdfWidth.toFixed(2)} 0 0 ${page.pdfHeight.toFixed(2)} 0 0 cm\n/${imageName} Do\nQ\n`;
      const contentBytes = textBytes(content);
      const jpegBytes = dataUrlToBytes(page.jpegDataUrl);

      objects[pageObj] = [textBytes(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pdfWidth.toFixed(2)} ${page.pdfHeight.toFixed(2)}] /Resources << /XObject << /${imageName} ${imageObj} 0 R >> >> /Contents ${contentObj} 0 R >>`)];
      objects[contentObj] = [
        textBytes(`<< /Length ${contentBytes.length} >>\nstream\n`),
        contentBytes,
        textBytes('endstream')
      ];
      objects[imageObj] = [
        textBytes(`<< /Type /XObject /Subtype /Image /Width ${page.pixelWidth} /Height ${page.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
        jpegBytes,
        textBytes('\nendstream')
      ];
    });

    objects[2] = [textBytes(`<< /Type /Pages /Kids [${pageObjectNumbers.map(n=>`${n} 0 R`).join(' ')}] /Count ${pages.length} >>`)];

    const chunks = [textBytes('%PDF-1.4\n%âãÏÓ\n')];
    const offsets = new Array(objectCount + 1).fill(0);
    let currentLength = chunks[0].length;

    for(let i = 1; i <= objectCount; i++){
      offsets[i] = currentLength;
      const start = textBytes(`${i} 0 obj\n`);
      const end = textBytes('\nendobj\n');
      chunks.push(start); currentLength += start.length;
      objects[i].forEach(part=>{ chunks.push(part); currentLength += part.length; });
      chunks.push(end); currentLength += end.length;
    }

    const xrefOffset = currentLength;
    let xref = `xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`;
    for(let i = 1; i <= objectCount; i++) xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    xref += `trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(textBytes(xref));

    return new Blob([concatBytes(chunks)], { type:'application/pdf' });
  }

  function drawPlanPageOne(data){
    const size = PORTRAIT;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#eaf5ff'; ctx.fillRect(0, 0, size.pixelWidth, size.pixelHeight);
    fillRoundedRect(ctx, 38, 38, 1164, 1678, 34, '#ffffff', '#cfe2f5', 3);

    const gradient = ctx.createLinearGradient(65, 65, 1175, 285);
    gradient.addColorStop(0, '#00b8f0'); gradient.addColorStop(1, '#7c4dff');
    fillRoundedRect(ctx, 65, 65, 1110, 230, 30, gradient);
    drawWrappedText(ctx, data.title, 95, 96, 1040, 58, { font:'900 50px Arial, sans-serif', color:'#ffffff', maxLines:2 });
    drawWrappedText(ctx, data.intro, 95, 205, 1010, 34, { font:'700 25px Arial, sans-serif', color:'#ffffff', maxLines:2 });

    const cardY = 330, cardW = 340, cardH = 135, gap = 25;
    const cards = [
      [data.generatedLabel, data.generatedOn],
      [data.scoreLabel, `${data.score} ⭐`],
      [data.studentLabel, data.studentName]
    ];
    cards.forEach((item, index)=>{
      const x = 75 + index * (cardW + gap);
      fillRoundedRect(ctx, x, cardY, cardW, cardH, 22, '#f7fbff', '#d7e8fb', 2);
      drawLabel(ctx, item[0], x + 22, cardY + 21);
      drawWrappedText(ctx, item[1], x + 22, cardY + 57, cardW - 44, 33, { font:'800 27px Arial, sans-serif', color:'#15304b', maxLines:2 });
    });

    const problemY = 495;
    fillRoundedRect(ctx, 75, problemY, 1090, 245, 24, '#f7fbff', '#d7e8fb', 2);
    drawWrappedText(ctx, data.problemLabel, 100, problemY + 25, 1030, 40, { font:'900 32px Arial, sans-serif', color:'#123a63', maxLines:1 });
    drawWrappedText(ctx, data.problem || data.problemMissing, 100, problemY + 78, 1030, 35, { font:'700 26px Arial, sans-serif', color:'#294b6b', maxLines:4 });
    if(data.context){
      drawWrappedText(ctx, `${data.contextLabel}: ${data.context}`, 100, problemY + 195, 1030, 28, { font:'700 22px Arial, sans-serif', color:'#4a6480', maxLines:1 });
    }

    drawWrappedText(ctx, data.actionsLabel, 75, 775, 1090, 44, { font:'900 34px Arial, sans-serif', color:'#123a63', maxLines:1 });
    const actionStartY = 830;
    (data.actions || []).slice(0, 3).forEach((action, index)=>{
      const y = actionStartY + index * 240;
      fillRoundedRect(ctx, 75, y, 1090, 215, 24, index % 2 ? '#fbf9ff' : '#f7fbff', '#d7e8fb', 2);
      const badgeGradient = ctx.createLinearGradient(95, y + 28, 160, y + 90);
      badgeGradient.addColorStop(0, '#7c4dff'); badgeGradient.addColorStop(1, '#ba68c8');
      ctx.save(); ctx.fillStyle = badgeGradient; ctx.beginPath(); ctx.arc(128, y + 60, 34, 0, Math.PI * 2); ctx.fill();
      ctx.font = '900 28px Arial, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(index + 1), 128, y + 60); ctx.restore();
      drawWrappedText(ctx, action.title || `${data.actionWord} ${index + 1}`, 180, y + 25, 940, 36, { font:'900 29px Arial, sans-serif', color:'#311b92', maxLines:1 });
      drawWrappedText(ctx, action.what || data.actionMissing, 180, y + 68, 925, 32, { font:'700 24px Arial, sans-serif', color:'#294b6b', maxLines:3 });
      drawWrappedText(ctx, `${data.ownerLabel}: ${action.who || '—'}`, 180, y + 160, 500, 26, { font:'700 21px Arial, sans-serif', color:'#506b86', maxLines:1 });
      drawWrappedText(ctx, `${data.dateLabel}: ${action.when || '—'}`, 700, y + 160, 405, 26, { font:'700 21px Arial, sans-serif', color:'#506b86', maxLines:1 });
    });

    drawWrappedText(ctx, data.footer, 620, 1618, 1080, 30, { font:'700 22px Arial, sans-serif', color:'#486a8b', align:'center', maxLines:2 });
    return { jpegDataUrl:canvas.toDataURL('image/jpeg', 0.91), ...size };
  }

  async function drawPlanEvidencePage(data){
    const size = PORTRAIT;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#eaf5ff'; ctx.fillRect(0, 0, size.pixelWidth, size.pixelHeight);
    fillRoundedRect(ctx, 38, 38, 1164, 1678, 34, '#ffffff', '#cfe2f5', 3);

    const gradient = ctx.createLinearGradient(65, 65, 1175, 245);
    gradient.addColorStop(0, '#2e7d32'); gradient.addColorStop(1, '#26c6da');
    fillRoundedRect(ctx, 65, 65, 1110, 180, 30, gradient);
    drawWrappedText(ctx, data.evidenceLabel, 620, 105, 1040, 55, { font:'900 48px Arial, sans-serif', color:'#ffffff', align:'center', maxLines:2 });

    fillRoundedRect(ctx, 75, 285, 1090, 1280, 28, '#f7fbff', '#b8d7c0', 3);
    try{
      const img = await loadImage(data.photoData);
      drawContainedImage(ctx, img, 105, 315, 1030, 1220);
    }catch(err){
      drawWrappedText(ctx, data.noPhotoLabel, 620, 800, 820, 45, { font:'800 32px Arial, sans-serif', color:'#486a8b', align:'center', maxLines:3 });
    }
    drawWrappedText(ctx, `${data.studentLabel}: ${data.studentName}`, 620, 1600, 1080, 34, { font:'800 25px Arial, sans-serif', color:'#294b6b', align:'center', maxLines:1 });
    drawWrappedText(ctx, data.footer, 620, 1650, 1080, 28, { font:'700 21px Arial, sans-serif', color:'#486a8b', align:'center', maxLines:2 });
    return { jpegDataUrl:canvas.toDataURL('image/jpeg', 0.9), ...size };
  }

  function drawDiplomaPage(data){
    const size = LANDSCAPE;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const bg = ctx.createLinearGradient(0, 0, size.pixelWidth, size.pixelHeight);
    bg.addColorStop(0, '#eef8ff'); bg.addColorStop(1, '#f8f4ff');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, size.pixelWidth, size.pixelHeight);
    fillRoundedRect(ctx, 45, 45, 1664, 1150, 40, '#ffffff', '#ffd600', 10);
    fillRoundedRect(ctx, 72, 72, 1610, 1096, 32, null, '#b5cbe3', 3);

    const chipGradient = ctx.createLinearGradient(670, 105, 1080, 180);
    chipGradient.addColorStop(0, '#7c4dff'); chipGradient.addColorStop(1, '#26c6da');
    fillRoundedRect(ctx, 650, 105, 454, 64, 32, chipGradient);
    drawWrappedText(ctx, data.chip, 877, 121, 410, 34, { font:'900 25px Arial, sans-serif', color:'#ffffff', align:'center', maxLines:1 });

    drawWrappedText(ctx, data.title, 877, 205, 1450, 66, { font:'900 58px Arial, sans-serif', color:'#24496e', align:'center', maxLines:1 });
    drawWrappedText(ctx, data.subtitle, 877, 282, 1400, 40, { font:'800 30px Arial, sans-serif', color:'#54718f', align:'center', maxLines:2 });
    drawWrappedText(ctx, data.awardedTo, 877, 375, 1300, 38, { font:'800 28px Arial, sans-serif', color:'#4f6680', align:'center', maxLines:1 });
    drawWrappedText(ctx, data.studentName, 877, 432, 1450, 75, { font:'900 64px Arial, sans-serif', color:'#15304b', align:'center', maxLines:2 });
    drawWrappedText(ctx, data.forText, 877, 590, 1400, 42, { font:'700 30px Arial, sans-serif', color:'#35506d', align:'center', maxLines:3 });

    fillRoundedRect(ctx, 250, 745, 1254, 118, 26, '#f5f1ff', '#dfd3fa', 2);
    drawWrappedText(ctx, `${data.problemLabel}: ${data.problem || data.problemMissing}`, 877, 775, 1160, 34, { font:'800 25px Arial, sans-serif', color:'#4a3b78', align:'center', maxLines:2 });

    fillRoundedRect(ctx, 425, 905, 360, 105, 24, '#f7fbff', '#d7e8fb', 2);
    fillRoundedRect(ctx, 969, 905, 360, 105, 24, '#f7fbff', '#d7e8fb', 2);
    drawWrappedText(ctx, `${data.dateLabel}:`, 605, 925, 320, 30, { font:'800 22px Arial, sans-serif', color:'#5a718a', align:'center', maxLines:1 });
    drawWrappedText(ctx, data.generatedOn, 605, 963, 320, 30, { font:'900 24px Arial, sans-serif', color:'#15304b', align:'center', maxLines:1 });
    drawWrappedText(ctx, `${data.scoreLabel}:`, 1149, 925, 320, 30, { font:'800 22px Arial, sans-serif', color:'#5a718a', align:'center', maxLines:1 });
    drawWrappedText(ctx, `${data.score} ⭐`, 1149, 963, 320, 30, { font:'900 24px Arial, sans-serif', color:'#15304b', align:'center', maxLines:1 });

    drawWrappedText(ctx, 'Guardianes Climáticos de Medellín', 877, 1050, 1300, 38, { font:'900 29px Arial, sans-serif', color:'#2b587f', align:'center', maxLines:1 });
    drawWrappedText(ctx, data.footer, 877, 1102, 1400, 28, { font:'700 21px Arial, sans-serif', color:'#486a8b', align:'center', maxLines:2 });
    return { jpegDataUrl:canvas.toDataURL('image/jpeg', 0.92), ...size };
  }

  async function createPlanPdf(data){
    const pages = [drawPlanPageOne(data)];
    if(data.photoData) pages.push(await drawPlanEvidencePage(data));
    return buildPdfFromJpegPages(pages);
  }

  async function createDiplomaPdf(data){
    return buildPdfFromJpegPages([drawDiplomaPage(data)]);
  }

  let activePdfUrl = '';

  function getWebAppUrl(){
    const cfg = config();
    const direct = String(cfg.webAppUrl || '').trim();
    if(direct) return direct;
    try{
      return String(localStorage.getItem('gc_email_webapp_url') || '').trim();
    }catch(_e){
      return '';
    }
  }

  function isEmailConfigured(){
    const cfg = config();
    return /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec(?:\?.*)?$/i.test(getWebAppUrl())
      && String(cfg.appToken || '').trim()
      && !/^CAMBIAR_/i.test(String(cfg.appToken || '').trim());
  }

  function ensurePdfDialogStyles(){
    if(document.getElementById('gc-pdf-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'gc-pdf-dialog-styles';
    style.textContent = `
      .gc-pdf-overlay{position:fixed;inset:0;z-index:2147483600;background:rgba(8,24,42,.78);display:flex;align-items:center;justify-content:center;padding:16px}
      .gc-pdf-panel{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;color:#15304b;border-radius:24px;padding:22px;box-shadow:0 24px 80px rgba(0,0,0,.38);text-align:center}
      .gc-pdf-panel h2{margin:0 0 8px;font-size:25px}.gc-pdf-panel p{margin:7px 0;line-height:1.45}
      .gc-pdf-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px}
      .gc-pdf-actions a,.gc-pdf-actions button{appearance:none;border:0;border-radius:999px;padding:12px 18px;font:800 16px Arial,sans-serif;cursor:pointer;text-decoration:none}
      .gc-pdf-download{background:#1565c0;color:#fff}.gc-pdf-open{background:#00a86b;color:#fff}.gc-pdf-close{background:#e8eef5;color:#15304b}
      .gc-pdf-email-state{margin-top:14px;padding:12px;border-radius:14px;background:#f1f7ff;font-weight:700}
      @media(max-width:520px){.gc-pdf-panel{padding:18px 14px;border-radius:18px}.gc-pdf-actions{flex-direction:column}.gc-pdf-actions a,.gc-pdf-actions button{width:100%}}
    `;
    document.head.appendChild(style);
  }

  function closePdfDialog(){
    const old = document.getElementById('gc-pdf-overlay');
    if(old) old.remove();
  }

  function showPdfReadyDialog(blob, filename, options){
    ensurePdfDialogStyles();
    closePdfDialog();
    if(activePdfUrl){
      try{ URL.revokeObjectURL(activePdfUrl); }catch(_e){}
    }
    activePdfUrl = URL.createObjectURL(blob);
    const opts = options || {};
    const overlay = document.createElement('div');
    overlay.id = 'gc-pdf-overlay';
    overlay.className = 'gc-pdf-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.innerHTML = `
      <div class="gc-pdf-panel">
        <h2>${opts.title || 'PDF listo'}</h2>
        <p>${opts.message || 'El documento está listo. Si la descarga automática fue bloqueada, usa el botón azul.'}</p>
        <div class="gc-pdf-actions">
          <a class="gc-pdf-download" download="${String(filename).replace(/"/g,'')}" href="${activePdfUrl}">⬇️ Descargar PDF ahora</a>
          <button type="button" class="gc-pdf-open">🖨️ Abrir / imprimir</button>
          <button type="button" class="gc-pdf-close">Cerrar</button>
        </div>
        <div class="gc-pdf-email-state" aria-live="polite">${opts.emailState || '📧 Preparando el envío por correo…'}</div>
      </div>`;
    document.body.appendChild(overlay);
    const openBtn = overlay.querySelector('.gc-pdf-open');
    const closeBtn = overlay.querySelector('.gc-pdf-close');
    openBtn.addEventListener('click', ()=>{
      const opened = window.open(activePdfUrl, '_blank', 'noopener');
      if(!opened){
        const link = overlay.querySelector('.gc-pdf-download');
        link.focus();
      }
    });
    closeBtn.addEventListener('click', closePdfDialog);
    overlay.addEventListener('click', (event)=>{ if(event.target === overlay) closePdfDialog(); });
    const auto = document.createElement('a');
    auto.href = activePdfUrl;
    auto.download = filename;
    auto.style.display = 'none';
    document.body.appendChild(auto);
    try{ auto.click(); }catch(_e){}
    auto.remove();
    return overlay;
  }

  function setPdfDialogEmailState(message, kind){
    const box = document.querySelector('#gc-pdf-overlay .gc-pdf-email-state');
    if(!box) return;
    box.textContent = message;
    box.dataset.kind = kind || '';
    if(kind === 'ok') box.style.background = '#e8f7ef';
    else if(kind === 'error') box.style.background = '#fff0f0';
    else if(kind === 'warning') box.style.background = '#fff8df';
    else box.style.background = '#f1f7ff';
  }

  function downloadBlob(blob, filename, options){
    return showPdfReadyDialog(blob, filename, options);
  }

  function blobToBase64(blob){
    return new Promise((resolve, reject)=>{
      const reader = new FileReader();
      reader.onload = ()=>resolve(String(reader.result || '').split(',')[1] || '');
      reader.onerror = ()=>reject(new Error('No se pudo preparar el PDF para el envío.'));
      reader.readAsDataURL(blob);
    });
  }

  function makeRequestId(){
    if(window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    return `gc-${Date.now()}-${Math.random().toString(36).slice(2,12)}`;
  }

  function submitPdfForm(endpoint, payload, requestId){
    return new Promise((resolve, reject)=>{
      const iframeName = `gc_email_frame_${requestId.replace(/[^a-zA-Z0-9_]/g,'_')}`;
      const iframe = document.createElement('iframe');
      iframe.name = iframeName;
      iframe.style.display = 'none';
      iframe.setAttribute('aria-hidden','true');
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = endpoint;
      form.target = iframeName;
      form.enctype = 'application/x-www-form-urlencoded';
      form.acceptCharset = 'UTF-8';
      form.style.display = 'none';
      const input = document.createElement('textarea');
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);
      document.body.appendChild(iframe);
      document.body.appendChild(form);
      let settled = false;
      const cleanup = ()=>{
        setTimeout(()=>{
          try{ form.remove(); }catch(_e){}
          try{ iframe.remove(); }catch(_e){}
        }, 1500);
      };
      iframe.addEventListener('load', ()=>{
        if(settled) return;
        settled = true;
        cleanup();
        resolve(true);
      }, { once:true });
      try{
        form.submit();
        setTimeout(()=>{
          if(settled) return;
          settled = true;
          cleanup();
          resolve(true);
        }, 1200);
      }catch(error){
        settled = true;
        cleanup();
        reject(error);
      }
    });
  }

  async function submitPdfRequest(endpoint, payload, requestId){
    try{
      await fetch(endpoint, {
        method:'POST',
        mode:'no-cors',
        cache:'no-store',
        credentials:'omit',
        redirect:'follow',
        headers:{ 'Content-Type':'text/plain;charset=UTF-8' },
        body:JSON.stringify(payload)
      });
      return true;
    }catch(fetchError){
      console.warn('Direct PDF POST failed; trying form fallback.', fetchError);
      return submitPdfForm(endpoint, payload, requestId);
    }
  }

  function jsonpStatus(endpoint, requestId){
    return new Promise((resolve, reject)=>{
      const callbackName = `__gcEmailStatus_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const script = document.createElement('script');
      let finished = false;
      const cleanup = ()=>{
        if(finished) return;
        finished = true;
        clearTimeout(timer);
        try{ delete window[callbackName]; }catch(_e){ window[callbackName] = undefined; }
        try{ script.remove(); }catch(_e){}
      };
      window[callbackName] = (data)=>{ cleanup(); resolve(data || {}); };
      const separator = endpoint.includes('?') ? '&' : '?';
      script.src = `${endpoint}${separator}action=status&requestId=${encodeURIComponent(requestId)}&callback=${encodeURIComponent(callbackName)}&_=${Date.now()}`;
      script.async = true;
      script.onerror = ()=>{ cleanup(); reject(new Error('No se pudo consultar la confirmación del correo.')); };
      const timer = setTimeout(()=>{ cleanup(); reject(new Error('Tiempo de confirmación agotado.')); }, 7000);
      document.head.appendChild(script);
    });
  }

  async function waitForEmailStatus(endpoint, requestId){
    const deadline = Date.now() + 30000;
    let lastError = null;
    while(Date.now() < deadline){
      try{
        const result = await jsonpStatus(endpoint, requestId);
        if(result && result.pending === false) return result;
        if(result && result.ok === true) return result;
        if(result && result.error && !result.pending) return result;
      }catch(error){
        lastError = error;
      }
      await new Promise(resolve=>setTimeout(resolve, 1100));
    }
    return { ok:false, pending:true, error:lastError ? lastError.message : 'No fue posible confirmar el envío.' };
  }

  async function sendPdf(blob, metadata){
    const cfg = config();
    const endpoint = getWebAppUrl();
    if(!isEmailConfigured()) return { ok:false, configured:false, reason:'not-configured' };
    const maxBytes = Number(cfg.maxPdfBytes || 8 * 1024 * 1024);
    if(blob.size > maxBytes) return { ok:false, configured:true, reason:'too-large' };
    const pdfBase64 = await blobToBase64(blob);
    const requestId = makeRequestId();
    const payload = {
      token: String(cfg.appToken || ''),
      requestId,
      filename: metadata.filename,
      documentType: metadata.documentType,
      studentName: metadata.studentName,
      generatedAt: metadata.generatedAt,
      pdfBase64
    };
    await submitPdfRequest(endpoint, payload, requestId);
    const status = await waitForEmailStatus(endpoint, requestId);
    if(status && status.ok) return { ok:true, configured:true, requestId, confirmed:true };
    if(status && status.pending) return { ok:false, configured:true, requestId, pending:true, reason:'confirmation-timeout' };
    return { ok:false, configured:true, requestId, reason:'server-error', error:String(status && status.error || 'El servidor no confirmó el envío.') };
  }

  window.GCPdfEmail = Object.freeze({
    isEmailConfigured,
    createPlanPdf,
    createDiplomaPdf,
    downloadBlob,
    showPdfReadyDialog,
    setPdfDialogEmailState,
    closePdfDialog,
    sendPdf
  });
})();
