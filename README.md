# FotoVault — Instrucciones de configuración

Aplicación web para subir imágenes desde tu celular a Google Drive
y descargarlas desde tu computador. Se aloja como sitio estático en AWS S3.

---

## Arquitectura

```
Celular  →  index.html (S3)  →  Apps Script  →  Google Drive
PC       →  index.html (S3)  →  Apps Script  →  Google Drive (descarga)
```

No necesitas servidor propio. El backend es un Google Apps Script **gratuito**.

---

## PASO 1 — Crear carpeta en Google Drive

1. Ve a https://drive.google.com
2. Crea una carpeta nueva (ej: `FotoVault`)
3. Ábrela y copia el **ID** de la URL:
   ```
   https://drive.google.com/drive/folders/  ← COPIA_ESTO
   ```
4. Guárdalo, lo necesitas en el siguiente paso.

---

## PASO 2 — Crear el Apps Script

1. Ve a https://script.google.com
2. Clic en **"Nuevo proyecto"**
3. Borra el código de ejemplo
4. Pega **todo** el contenido del archivo `Code.gs` (incluido en este ZIP)
5. En la línea que dice:
   ```javascript
   const FOLDER_ID = 'TU_FOLDER_ID_AQUI';
   ```
   Reemplaza `TU_FOLDER_ID_AQUI` con el ID que copiaste en el paso 1.
6. Guarda el proyecto (Ctrl+S) — ponle un nombre, ej: `FotoVault Backend`

---

## PASO 3 — Desplegar como Web App

1. En el Apps Script, clic en **"Implementar"** → **"Nueva implementación"**
2. Clic en el ícono ⚙ junto a "Tipo" y selecciona **"Aplicación web"**
3. Configura así:
   - **Descripción:** FotoVault v1
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier persona ← **importante**
4. Clic en **"Implementar"**
5. Copia la **URL de la aplicación web** — se ve así:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
   ¡Guarda esta URL!

> **Nota de seguridad:** Cualquiera con la URL puede subir imágenes.
> Para uso privado, comparte la URL solo contigo mismo o cámbiala periódicamente
> volviendo a desplegar con "Nueva versión".

---

## PASO 4 — Subir index.html a AWS S3

### Crear bucket S3

1. Ve a la consola de AWS → S3
2. Clic en **"Crear bucket"**
3. Ponle un nombre único (ej: `fotovault-mi-nombre`)
4. **Región:** elige la más cercana a ti
5. **Desbloquear acceso público:** desmarca "Bloquear todo el acceso público"
   y confirma que entiendes las implicaciones
6. Clic en **"Crear bucket"**

### Habilitar sitio web estático

1. Ve a tu bucket → pestaña **"Propiedades"**
2. Baja hasta **"Alojamiento de sitios web estáticos"** → clic en Editar
3. Actívalo, pon `index.html` en Documento de índice
4. Guarda

### Política de bucket (permitir lectura pública)

1. Ve a pestaña **"Permisos"** → **"Política de bucket"** → Editar
2. Pega esto (cambia `NOMBRE-DE-TU-BUCKET`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::NOMBRE-DE-TU-BUCKET/*"
    }
  ]
}
```

3. Guarda

### Subir el archivo

1. Ve a la pestaña **"Objetos"** → **"Cargar"**
2. Sube el archivo `index.html`
3. Ve a **Propiedades** del bucket → **Alojamiento de sitio web estático**
4. Copia la **URL del punto de enlace del sitio web**
   (ej: `http://fotovault-mi-nombre.s3-website-us-east-1.amazonaws.com`)

---

## PASO 5 — Configurar la app

1. Abre la URL de tu S3 en el **celular**
2. Se abrirá el modal de configuración
3. Pega la URL del Apps Script del Paso 3
4. Clic en **"Guardar y continuar"**

¡Listo! Ya puedes subir imágenes desde el celular y descargarlas desde el PC.

---

## Uso diario

**Desde el celular:**
- Abre la URL de S3
- Pestaña **"↑ Subir"**
- Selecciona una o varias fotos
- Agrega descripción (opcional)
- Clic en "Subir a Google Drive"

**Desde el PC:**
- Abre la misma URL de S3
- Pestaña **"⊞ Galería"**
- Clic en "↻ Actualizar galería"
- Clic en "↓ Descargar" en la imagen que quieras

---

## Solución de problemas

| Problema | Solución |
|----------|----------|
| "Error de red" al subir | Verifica que la URL del Apps Script sea correcta en ⚙ |
| Galería no carga | Vuelve a desplegar el Apps Script ("Administrar implementaciones" → actualiza) |
| Miniaturas no aparecen | Las imágenes tardan unos segundos en ser accesibles en Drive |
| "CORS error" | Vuelve a desplegar el Apps Script con "Nueva versión" |

---

## Actualizar el Apps Script (si cambias el código)

1. Implementar → Administrar implementaciones
2. Clic en el lápiz ✏️ → Versión: **"Nueva versión"** → Implementar
3. La URL **no cambia**, no necesitas reconfigurar la app
