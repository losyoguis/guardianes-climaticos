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

