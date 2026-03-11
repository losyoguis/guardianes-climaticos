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


## Versión estable restaurada
- Se conservó la arquitectura original de `index.html` para evitar daños visuales o de rutas.
- Se agregó un fallback mínimo para que la pantalla de carga no quede bloqueada si ocurre un error.
- Se actualizó la versión de caché del Service Worker para evitar que el navegador sirva recursos viejos.
