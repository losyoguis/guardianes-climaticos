/*
 * CONFIGURACIÓN DEL ENVÍO AUTOMÁTICO DE PDF
 *
 * La URL webAppUrl la genera Google al desplegar apps-script/Code.gs.
 * Debe terminar en /exec. También puede configurarse y probarse desde
 * configurar-correo.html.
 */
window.GC_EMAIL_CONFIG = Object.freeze({
  recipient: 'cd@iemanueljbetancur.edu.co',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbzCYfnSe8smEyeqXdixYghKkBTZhKieJPladoFWIBQ2GZUkJCIE3ha3ZBed2i_8elHf/exec',
  appToken: 'L8UEHKN4iTLxc3PurPREbA-igOs--Gn4zQOaq4f76UBEzrXg',
  maxPdfBytes: 8 * 1024 * 1024
});
