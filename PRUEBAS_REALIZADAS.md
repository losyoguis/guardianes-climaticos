# Pruebas realizadas — versión corregida v3

Fecha de control: 27 de julio de 2026, zona horaria de Bogotá.

## Navegador automatizado

Se probaron las cuatro acciones visibles de la pantalla final:

- Imprimir Plan Guardián.
- Descargar Plan Guardián.
- Imprimir Diploma.
- Descargar Diploma.

## Resultados

- Plan descargado como PDF válido.
- Plan con fotografía: 2 páginas A4 verticales.
- Diploma descargado como PDF válido.
- Diploma: 1 página A4 horizontal.
- El nombre del archivo usa la fecha de Bogotá.
- Si la descarga automática es bloqueada, queda un enlace manual visible.
- Las dos vistas de impresión muestran el botón `Imprimir ahora`.
- Se realizaron dos solicitudes POST de prueba con los PDF en base64.
- Se simuló la confirmación del backend para verificar que la app solo muestre éxito después de recibir el estado del servidor.
- No se detectaron errores JavaScript durante las pruebas de exportación.

## Alcance de la prueba del correo

No se realizó un envío real a la bandeja institucional porque el ZIP recibido no contiene una URL de implementación `/exec` generada por la cuenta de Google del usuario. Esa URL se crea únicamente al desplegar `apps-script/Code.gs`.

El flujo completo de envío y confirmación fue probado contra un endpoint simulado. Para la prueba real final, despliega Apps Script, registra la URL mediante `configurar-correo.html` y verifica la llegada a `cd@iemanueljbetancur.edu.co`.


## Pruebas v3.2 — cámara en computador

- Confirmado que `btn-print-plan` ya no existe en la interfaz.
- Confirmado que el botón `btn-plan-camera` está visible en el Plan Guardián.
- Confirmado que el selector de archivos ya no fuerza `capture=environment`; permite escoger imágenes en computador.
- Prueba automatizada de apertura de la cámara con `getUserMedia`.
- Prueba automatizada de vista previa en vivo.
- Prueba automatizada de captura en JPEG y almacenamiento como evidencia.
- Confirmado que la pista de video se detiene al capturar o cerrar.
- Confirmado el nombre automático `evidencia_camara_YYYY-MM-DD_HH-MM.jpg`.
- Validación de sintaxis de todos los archivos JavaScript y de todos los scripts inline.
- Confirmado que la URL `/exec` y el destinatario institucional continúan configurados.


## Pruebas v3.3 — cámara desde una actividad incrustada

- Validación de sintaxis de todos los scripts inline de `index.html`.
- Validación de sintaxis del JavaScript de `camera-capture.html`.
- Prueba unitaria con API de cámara simulada y dos dispositivos: una cámara integrada y una cámara externa USB.
- Confirmado que el selector muestra ambos dispositivos y permite alternarlos.
- Confirmado que la captura produce una imagen JPEG y crea el nombre `evidencia_camara_YYYY-MM-DD_HH-MM.jpg`.
- Confirmado que la página de cámara envía el resultado por `window.opener.postMessage`.
- Confirmado el respaldo mediante almacenamiento local.
- Prueba unitaria del receptor en `index.html`: guarda la fotografía en el estado del Plan, actualiza la vista previa y actualiza los requisitos del Plan Guardián.
- Confirmado que la página de cámara se resuelve de forma relativa desde la misma raíz de `index.html`.
- Confirmado que `js/email-config.js` conserva la URL `/exec` de producción.
- Confirmado que el botón **Imprimir plan** continúa eliminado.

La autorización física final depende del permiso que el usuario conceda en Chrome y de que la publicación se abra mediante HTTPS.
