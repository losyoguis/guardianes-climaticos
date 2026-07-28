# Guardianes Climáticos de Medellín — Web App

Versión ajustada para funcionar solo como **web app**, sin PWA.

## Qué se retiró
- `manifest.json`
- `service-worker.js`
- `offline.html`
- `js/pwa.js`
- referencias de instalación tipo app en los HTML

## Qué se dejó
- `index.html` como app principal
- imágenes y assets originales
- `js/rubrica.js`
- páginas de compatibilidad/redirección

## Recomendación al publicar
Después de subir esta versión a GitHub Pages, haz una recarga forzada (`Cmd + Shift + R`) para limpiar recursos viejos del navegador.


Actualización v8: reforzados los vínculos del Cinturón de Guardia con handlers directos, z-index y navegación de rescate.


- v11: flechas del reto del bus activas, clic completo en pista/carriles y audio por botón/por sección reforzado.

## PDF reales y envío automático por correo

El Plan Guardián y el Diploma ahora se descargan como archivos `.pdf` reales. En el mismo proceso, la aplicación intenta enviar automáticamente una copia adjunta a `cd@iemanueljbetancur.edu.co`.

Para activar el envío, sigue una sola vez las instrucciones de `CONFIGURAR_ENVIO_EMAIL.md`. El backend listo para desplegar se encuentra en `apps-script/Code.gs` y la URL se registra en `js/email-config.js`.

La descarga local sigue funcionando aunque el servicio de correo no esté disponible.


## Corrección de exportación v3

La versión v3 corrige los bloqueos de impresión y descarga e incorpora confirmación real del envío por Apps Script.

- `configurar-correo.html`: asistente para probar la URL `/exec`, guardarla y generar `js/email-config.js`.
- `js/pdf-email.js`: PDF, descarga con respaldo, envío y confirmación.
- `apps-script/Code.gs`: recepción, validación, envío y consulta del estado.

La generación, descarga e impresión funcionan sin backend. El envío automático necesita desplegar una vez `apps-script/Code.gs` en la cuenta institucional y registrar la URL `/exec`, como se explica en `CONFIGURAR_ENVIO_EMAIL.md`.


## Configuración activa del correo — v3.1

La URL `/exec` suministrada para Google Apps Script ya está registrada en `js/email-config.js`:

`https://script.google.com/macros/s/AKfycbzCYfnSe8smEyeqXdixYghKkBTZhKieJPladoFWIBQ2GZUkJCIE3ha3ZBed2i_8elHf/exec`

Al publicar esta carpeta completa, la aplicación intentará enviar automáticamente el Plan Guardián y el Diploma a `cd@iemanueljbetancur.edu.co`.


## Cámara de evidencia en computador (v3.2)

En el Plan Guardián ahora aparecen dos opciones para la evidencia:

- **Abrir cámara:** activa la webcam integrada o conectada del computador. También funciona en celular o tableta.
- **Subir imagen:** permite escoger una fotografía ya guardada.

La cámara directa necesita que la aplicación se abra desde una conexión segura HTTPS. La publicación normal de GitHub Pages utiliza HTTPS. El navegador solicitará permiso la primera vez.

El botón **Imprimir plan** fue retirado. El botón **Descargar plan** continúa generando el PDF y enviando la copia al correo institucional configurado.
