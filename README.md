# FotoVault — AWS Edition

Aplicación web para subir imágenes desde cualquier dispositivo
y almacenarlas de forma segura en Amazon S3.

La app es un sitio estático alojado en GitHub Pages.
El backend está compuesto por AWS Lambda + API Gateway.
Las imágenes se suben directamente a S3 mediante URLs firmadas.

---

## Arquitectura

Navegador
↓
GitHub Pages (index.html)
↓
API Gateway
↓
Lambda
↓
Amazon S3 (almacenamiento)

---

## Tecnologías utilizadas

- GitHub Pages (Frontend)
- AWS API Gateway (HTTP API)
- AWS Lambda (Node.js)
- Amazon S3 (almacenamiento privado)
- URLs firmadas para subida segura

---

## Flujo de funcionamiento

### Subida

1. El usuario selecciona una imagen
2. El frontend solicita a Lambda una URL firmada
3. Lambda genera URL temporal
4. El navegador sube directamente a S3
5. La imagen queda almacenada en el bucket

### Galería

1. El frontend llama al endpoint `/list-files`
2. Lambda lista los objetos del bucket
3. Devuelve URLs firmadas de descarga
4. Se muestran en la galería

---

## Seguridad

- El bucket permanece privado
- Las URLs firmadas expiran automáticamente
- No hay credenciales AWS expuestas en el frontend
- Solo tu dominio puede llamar al API (CORS configurado)

---

## Desarrollo local

Clonar el repositorio:

git clone https://github.com/rony728/fotovault.git
cd fotovault

Abrir en Visual Studio Code:

code .

Usar Live Server para pruebas locales.

---

## Deploy

Después de hacer cambios:

git add .
git commit -m "actualización"
git push

GitHub Pages se actualiza automáticamente.

---

## Estado actual

✔ Subida rápida  
✔ Arquitectura serverless  
✔ Sin Google Drive  
✔ 100% AWS  

Proyecto mantenido por Rony.
