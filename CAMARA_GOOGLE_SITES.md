# Cámara del computador cuando la aplicación está incrustada en Google Sites

## Por qué se usa una ventana independiente

Google Sites muestra la actividad dentro de un iframe. Los navegadores restringen la cámara en marcos de otro origen cuando el sitio superior no delega expresamente ese permiso. Por eso, la versión v3.3 no intenta mantener la cámara dentro del marco de Google Sites.

## Funcionamiento

1. El estudiante pulsa **Abrir cámara del equipo**.
2. Se abre `camera-capture.html` en una ventana o pestaña segura.
3. Chrome solicita permiso para la cámara del sitio donde está publicada la app, por ejemplo GitHub Pages.
4. El estudiante elige la cámara integrada o una cámara externa/USB en la lista.
5. Pulsa **Tomar foto**.
6. La foto regresa automáticamente al Plan Guardián.
7. La ventana se cierra y la cámara se apaga.

## Publicación

Sube `camera-capture.html` a la misma carpeta raíz que `index.html`. No cambies su nombre ni lo incrustes por separado en Google Sites.

## Permisos en Chrome

Cuando Chrome lo solicite, selecciona **Permitir mientras visitas el sitio**. El permiso corresponde al dominio de la aplicación publicada, no a `sites.google.com`.

Si el permiso fue bloqueado:

1. Abre nuevamente la cámara.
2. En la pestaña de cámara, pulsa el icono de controles o cámara junto a la dirección.
3. Cambia Cámara a **Permitir**.
4. Recarga esa pestaña.

## Cámara externa

Conecta la cámara USB antes de abrir la página. Si la conectas después, pulsa **Buscar cámaras**. El selector utiliza el nombre entregado por el sistema operativo para diferenciar la integrada de la externa.

## Alternativas

- **Usar imagen guardada** dentro de la página de cámara.
- **Descargar foto** y luego usar **Subir imagen** en el Plan Guardián.
