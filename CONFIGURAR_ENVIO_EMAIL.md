# Estado de esta entrega

La URL de Google Apps Script ya quedó configurada en `js/email-config.js`:

`https://script.google.com/macros/s/AKfycbzCYfnSe8smEyeqXdixYghKkBTZhKieJPladoFWIBQ2GZUkJCIE3ha3ZBed2i_8elHf/exec`

No necesitas repetir la conexión mientras esta implementación `/exec` continúe activa. Conserva las instrucciones siguientes para una futura actualización o un nuevo despliegue.

---

# Activar y comprobar el envío automático de PDF

La aplicación puede generar, descargar e imprimir el **Plan Guardián** y el **Diploma Guardián Climático**. Cuando el servicio de correo está configurado, cada descarga también envía el mismo PDF como adjunto a:

`cd@iemanueljbetancur.edu.co`

El destinatario está fijado en el servidor y no puede ser modificado por los estudiantes.

## Por qué existe un paso de activación

GitHub Pages solo publica archivos estáticos y no puede enviar correos con adjuntos por sí mismo. Google debe generar una URL privada de implementación para la cuenta institucional que autoriza los envíos. Esa URL no puede venir creada de antemano dentro del ZIP.

## 1. Crear el servicio en Google Apps Script

1. Entra a `https://script.google.com` con la cuenta institucional que enviará los mensajes.
2. Selecciona **Nuevo proyecto**.
3. Ponle el nombre `Guardianes Climáticos - Envío PDF`.
4. Borra el contenido inicial de `Código.gs`.
5. Abre `apps-script/Code.gs` dentro de este proyecto.
6. Copia todo su contenido y pégalo en Apps Script.
7. Guarda.

## 2. Implementarlo como aplicación web

1. Selecciona **Implementar → Nueva implementación**.
2. En tipo, elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** Cualquier persona.
4. Presiona **Implementar**.
5. Autoriza el permiso para enviar correos.
6. Copia la URL generada. Debe terminar exactamente en `/exec`.

No uses una URL terminada en `/dev`.

## 3. Probar y configurar la URL

La forma más sencilla es abrir, desde el proyecto publicado, esta página:

`configurar-correo.html`

Allí puedes:

1. Pegar la URL `/exec`.
2. Probar la conexión.
3. Guardarla temporalmente en ese navegador.
4. Descargar un archivo `email-config.js` ya configurado.

Para que funcione en todos los equipos, reemplaza en GitHub:

`js/email-config.js`

por el archivo descargado desde `configurar-correo.html`.

También puedes editarlo manualmente y cambiar:

```js
webAppUrl: '',
```

por:

```js
webAppUrl: 'https://script.google.com/macros/s/IDENTIFICADOR/exec',
```

No cambies el token a menos que lo cambies exactamente igual en `apps-script/Code.gs` y `js/email-config.js`.

## 4. Publicar los archivos actualizados

Sube el proyecto completo a GitHub. Verifica que `index.html` esté en la raíz y que las carpetas `js` y `apps-script` conserven sus nombres.

Después de publicar, realiza una recarga forzada:

- Mac: `Command + Shift + R`
- Windows: `Ctrl + F5`

## 5. Prueba final

1. Completa la experiencia y finaliza el Plan Guardián.
2. Presiona **Descargar plan**.
3. Debe aparecer un panel con:
   - descarga manual de respaldo;
   - opción para abrir o imprimir;
   - estado del envío por correo.
4. El estado correcto es:

`✅ Correo confirmado y enviado correctamente.`

5. Comprueba que el PDF llegó a `cd@iemanueljbetancur.edu.co`.
6. Repite con **Descargar diploma**.

## Diagnóstico de errores

### El PDF se descarga, pero dice “servicio pendiente”

La URL `/exec` no está escrita en `js/email-config.js` ni guardada en el navegador. Abre `configurar-correo.html`.

### El servidor rechaza el envío

En Apps Script, abre **Ejecuciones**. La nueva versión muestra el error real en la aplicación y registra un código de solicitud.

### La conexión no se confirma

Comprueba que:

- la URL termina en `/exec`;
- la implementación está publicada para **Cualquier persona**;
- se autorizó `MailApp`;
- se publicó una nueva versión después de modificar `Code.gs`;
- el token coincide en ambos archivos.

### Se modificó Code.gs

Ve a **Implementar → Administrar implementaciones → Editar → Nueva versión → Implementar**.

## Cambios de confiabilidad de esta versión

- La descarga ya no depende únicamente de un clic automático: siempre aparece un enlace manual.
- La impresión ya no utiliza un iframe oculto: abre una vista visible con el botón **Imprimir ahora**.
- El envío usa un POST compatible con GitHub Pages.
- La aplicación consulta al servidor mediante un código único y solo muestra éxito cuando Apps Script confirma el envío.
- Si el correo falla, el PDF continúa disponible para descargar.
