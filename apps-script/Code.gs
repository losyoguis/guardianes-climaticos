/**
 * Guardianes Climáticos de Medellín
 * Servicio de recepción y envío automático de PDF.
 *
 * IMPORTANTE:
 * - El destinatario está fijado en el servidor y no se recibe desde el navegador.
 * - Cambia APP_TOKEN y copia exactamente el mismo valor en js/email-config.js.
 * - Despliega como Aplicación web, ejecutando como tú y con acceso para los usuarios
 *   que utilizarán la app.
 */
const DESTINATION_EMAIL = 'cd@iemanueljbetancur.edu.co';
const APP_TOKEN = 'L8UEHKN4iTLxc3PurPREbA-igOs--Gn4zQOaq4f76UBEzrXg';
const MAX_PDF_BYTES = 8 * 1024 * 1024;
const MAX_EMAILS_PER_HOUR = 120;

function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'Guardianes Climáticos PDF Mailer',
    recipient: DESTINATION_EMAIL
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Solicitud vacía.');
    }

    const data = JSON.parse(e.postData.contents);
    if (data.token !== APP_TOKEN) {
      throw new Error('Token no autorizado.');
    }

    const filename = safeFilename_(data.filename || 'documento_guardianes.pdf');
    const documentType = String(data.documentType || 'Documento').slice(0, 60);
    const studentName = cleanText_(data.studentName || 'Estudiante', 120);
    const generatedAt = cleanText_(data.generatedAt || new Date().toISOString(), 80);
    const pdfBase64 = String(data.pdfBase64 || '');

    if (!pdfBase64) throw new Error('No se recibió el PDF.');

    const bytes = Utilities.base64Decode(pdfBase64);
    if (!bytes.length) throw new Error('El PDF está vacío.');
    if (bytes.length > MAX_PDF_BYTES) throw new Error('El PDF supera el tamaño permitido.');
    if (bytes.length < 5 || bytes[0] !== 37 || bytes[1] !== 80 || bytes[2] !== 68 || bytes[3] !== 70 || bytes[4] !== 45) {
      throw new Error('El archivo recibido no es un PDF válido.');
    }

    registerHourlySend_();

    const blob = Utilities.newBlob(bytes, 'application/pdf', filename);
    const subject = `[Guardianes Climáticos] ${documentType} - ${studentName}`;
    const body = [
      'Se ha generado un nuevo documento desde la aplicación Guardianes Climáticos de Medellín.',
      '',
      `Tipo de documento: ${documentType}`,
      `Estudiante: ${studentName}`,
      `Fecha de generación: ${generatedAt}`,
      `Archivo: ${filename}`,
      '',
      'El PDF se encuentra adjunto a este mensaje.'
    ].join('\n');

    MailApp.sendEmail({
      to: DESTINATION_EMAIL,
      subject: subject,
      body: body,
      attachments: [blob],
      name: 'Guardianes Climáticos de Medellín'
    });

    return jsonResponse_({ ok: true, filename: filename });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error && error.message || error) });
  }
}


function registerHourlySend_() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const cache = CacheService.getScriptCache();
    const hourKey = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMddHH');
    const key = `gc_pdf_mail_count_${hourKey}`;
    const current = Number(cache.get(key) || 0);
    if (current >= MAX_EMAILS_PER_HOUR) {
      throw new Error('Se alcanzó el límite temporal de envíos. Intenta nuevamente más tarde.');
    }
    cache.put(key, String(current + 1), 3600);
  } finally {
    lock.releaseLock();
  }
}

function safeFilename_(value) {
  let name = String(value || 'documento_guardianes.pdf')
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 150);
  if (!/\.pdf$/i.test(name)) name += '.pdf';
  return name;
}

function cleanText_(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
