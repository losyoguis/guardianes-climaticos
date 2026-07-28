# Corrección de impresión, descarga y correo

## Problemas encontrados

1. `js/email-config.js` tenía la URL de Apps Script vacía, por lo que el correo no podía enviarse.
2. La impresión dependía de un iframe oculto y de una llamada diferida a `print()`, bloqueada en algunos navegadores.
3. La descarga automática se ejecutaba después de un proceso asíncrono y podía ser bloqueada por el navegador.
4. El envío anterior utilizaba `no-cors` y mostraba éxito sin confirmar que Apps Script hubiera enviado el mensaje.

## Correcciones aplicadas

- Se añadió una vista visible de impresión con el botón **Imprimir ahora**.
- Cada PDF intenta descargarse automáticamente y, además, muestra un botón manual permanente.
- El panel permite abrir el PDF para imprimirlo desde el visor del navegador.
- Apps Script asigna un código único a cada envío y guarda su estado.
- La app consulta ese estado y solo informa éxito cuando el servidor confirma el correo.
- Se muestran errores reales del servidor y estados de espera.
- Se mantiene la descarga aunque el correo no esté configurado o falle.
- Se agregó `configurar-correo.html` para probar la URL, guardarla y generar `email-config.js`.
- La fecha de los archivos usa la zona horaria de Bogotá.

## Archivos modificados

- `index.html`
- `js/pdf-email.js`
- `js/email-config.js`
- `apps-script/Code.gs`
- `CONFIGURAR_ENVIO_EMAIL.md`
- `CAMBIOS_REALIZADOS.md`
- `README.md`

## Archivo creado

- `configurar-correo.html`

## Validaciones realizadas

- Sintaxis de todos los scripts JavaScript.
- Generación del PDF del Plan Guardián.
- Generación del PDF del Diploma.
- Descarga automática y enlace manual de respaldo.
- Vista visible de impresión.
- Envío POST simulado y confirmación JSONP simulada.
- Estado visual de correo confirmado.


## Actualización v3.1 — URL de producción configurada

- Se registró la URL de la aplicación web de Google Apps Script en `js/email-config.js`.
- URL configurada: `https://script.google.com/macros/s/AKfycbzCYfnSe8smEyeqXdixYghKkBTZhKieJPladoFWIBQ2GZUkJCIE3ha3ZBed2i_8elHf/exec`
- El destinatario continúa bloqueado en `cd@iemanueljbetancur.edu.co`.
- No se modificó el token compartido entre la aplicación y `apps-script/Code.gs`.
- La descarga e impresión siguen funcionando aunque el envío de correo presente un error.
