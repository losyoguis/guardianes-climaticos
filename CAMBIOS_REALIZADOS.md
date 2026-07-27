# Cambios realizados

## Descargas

- El Plan Guardián ahora se genera y descarga como PDF real en tamaño A4 vertical.
- El Diploma Guardián Climático ahora se genera y descarga como PDF real en tamaño A4 horizontal.
- El Plan incluye nombre, puntaje, problemática, contexto, tres acciones, responsables, fechas y una segunda página con la evidencia fotográfica.
- Los nombres de archivo incluyen el nombre del estudiante y la fecha.

## Envío automático

- Cada descarga de Plan o Diploma solicita automáticamente el envío del mismo PDF a `cd@iemanueljbetancur.edu.co`.
- El destinatario está fijado dentro de `apps-script/Code.gs` y no se toma desde el navegador.
- La descarga local se mantiene aunque el envío falle.
- Se añadieron validaciones de token, tipo PDF, tamaño máximo, nombre de archivo y límite temporal de envíos.

## Archivos añadidos

- `js/pdf-email.js`
- `js/email-config.js`
- `apps-script/Code.gs`
- `CONFIGURAR_ENVIO_EMAIL.md`
- `CAMBIOS_REALIZADOS.md`

## Archivo principal actualizado

- `index.html`

También se actualizó `README.md` con la nueva funcionalidad.
