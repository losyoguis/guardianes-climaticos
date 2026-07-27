/*
 * CONFIGURACIÓN DEL ENVÍO AUTOMÁTICO DE PDF
 * 1. Despliega el archivo apps-script/Code.gs como aplicación web.
 * 2. Copia la URL terminada en /exec en webAppUrl.
 * 3. Usa el mismo token configurado en Code.gs.
 */
window.GC_EMAIL_CONFIG = Object.freeze({
  recipient: 'cd@iemanueljbetancur.edu.co',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbzCYfnSe8smEyeqXdixYghKkBTZhKieJPladoFWIBQ2GZUkJCIE3ha3ZBed2i_8elHf/exec',
  appToken: 'L8UEHKN4iTLxc3PurPREbA-igOs--Gn4zQOaq4f76UBEzrXg',
  maxPdfBytes: 8 * 1024 * 1024
});
