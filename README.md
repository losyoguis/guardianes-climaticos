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
