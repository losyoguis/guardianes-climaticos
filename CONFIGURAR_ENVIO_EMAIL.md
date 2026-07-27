# Activar el envío automático de los PDF por correo

La aplicación ya quedó preparada para realizar estas dos acciones con un solo clic:

1. Descargar un **PDF real** en el dispositivo.
2. Enviar automáticamente el mismo PDF como archivo adjunto a:

`cd@iemanueljbetancur.edu.co`

El destinatario está bloqueado dentro del servicio y no puede ser cambiado por los estudiantes desde la aplicación.

## Archivos incluidos

- `js/pdf-email.js`: genera los PDF y solicita el envío.
- `js/email-config.js`: guarda la URL de la aplicación web de Google Apps Script.
- `apps-script/Code.gs`: recibe el PDF y lo envía mediante la cuenta de Google que despliega el servicio.

## Único paso externo obligatorio

Una aplicación alojada únicamente en GitHub Pages no puede enviar adjuntos por correo por sí sola. Por eso es necesario publicar una vez el servicio incluido en `apps-script/Code.gs` desde una cuenta institucional autorizada.

## Paso a paso

### 1. Crear el proyecto de Apps Script

1. Ingresa a `script.google.com` con la cuenta institucional que enviará los correos.
2. Selecciona **Nuevo proyecto**.
3. Cambia el nombre por: `Guardianes Climáticos - Envío PDF`.
4. Borra el contenido inicial del archivo `Código.gs`.
5. Abre el archivo `apps-script/Code.gs` que viene dentro de este proyecto.
6. Copia todo su contenido y pégalo en Apps Script.
7. Guarda el proyecto.

### 2. Desplegar como aplicación web

1. En Apps Script, selecciona **Implementar → Nueva implementación**.
2. En el tipo de implementación, elige **Aplicación web**.
3. Configura:
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** Cualquier persona.
4. Selecciona **Implementar**.
5. Autoriza el permiso para enviar correos.
6. Copia la URL de la aplicación web. Debe terminar en `/exec`.

> Si el dominio no permite la opción “Cualquier persona”, el administrador de Google Workspace debe habilitarla para este servicio. El envío desde una web pública necesita que la URL pueda recibir la solicitud sin pedir un inicio de sesión adicional.

### 3. Registrar la URL en la aplicación

1. Abre `js/email-config.js`.
2. Busca esta línea:

```js
webAppUrl: '',
```

3. Pega entre las comillas la URL que termina en `/exec`:

```js
webAppUrl: 'https://script.google.com/macros/s/IDENTIFICADOR/exec',
```

4. Guarda el archivo.
5. Sube el proyecto completo a GitHub Pages.

El token de seguridad ya viene sincronizado entre `js/email-config.js` y `apps-script/Code.gs`. No es necesario modificarlo. Si se cambia, debe usarse exactamente el mismo valor en los dos archivos.

## Prueba final

1. Abre la aplicación publicada.
2. Completa las tres misiones y el Plan Guardián.
3. Selecciona **Descargar plan**.
4. Confirma que se descargó un archivo `.pdf`.
5. Revisa la bandeja de entrada de `cd@iemanueljbetancur.edu.co`.
6. Repite la prueba con **Descargar diploma**.

El mensaje recibido incluirá:

- Tipo de documento.
- Nombre del estudiante.
- Fecha de generación.
- PDF como archivo adjunto.

## Funcionamiento ante fallos

- Si no hay internet o el servicio de correo falla, la descarga local del PDF se conserva.
- Si la URL todavía no se ha configurado, el PDF se descarga y la app muestra un aviso de configuración pendiente.
- El servicio rechaza archivos que no sean PDF, archivos mayores de 8 MB y solicitudes que no tengan el token correcto.
- El destinatario siempre será `cd@iemanueljbetancur.edu.co`.

## Actualizar el servicio en el futuro

Cuando se modifique `Code.gs`, crea una nueva versión de la implementación desde **Implementar → Administrar implementaciones → Editar → Nueva versión**. La URL `/exec` normalmente puede conservarse.
