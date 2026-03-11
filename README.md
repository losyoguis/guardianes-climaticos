# Guardianes Climáticos de Medellín

Versión depurada del proyecto PWA educativa.

## Archivo principal
- `index.html` → experiencia principal completa

## Archivos activos
- `manifest.json`
- `service-worker.js`
- `offline.html`
- `js/pwa.js`
- `js/rubrica.js`
- `js/app.js` (compatibilidad para rutas heredadas)
- `img/`
- `icons/`

## Ajustes realizados
- Limpieza de archivos residuales y duplicados innecesarios.
- Conversión de rutas antiguas en redirecciones seguras hacia `index.html`.
- Actualización del Service Worker para una caché más limpia.
- Conservación de compatibilidad con enlaces heredados.

## Versión modular
- `index.html` quedó como punto de entrada principal.
- El CSS principal se movió a `css/main.css`.
- El JavaScript principal se movió a `js/main.js`.
- `js/app.js` queda solo como compatibilidad para rutas antiguas/redirecciones.

