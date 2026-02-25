// ============================================================
//  FotoVault — Google Apps Script Backend
//  Pega este código en https://script.google.com
//  y despliégalo como Web App (ver README para instrucciones)
// ============================================================

// ⬇️  CAMBIA ESTE ID por el de la carpeta de Google Drive
//     donde quieres guardar las imágenes.
//     Para obtenerlo: abre la carpeta en Drive y copia el ID
//     de la URL: drive.google.com/drive/folders/ESTE_ES_EL_ID
const FOLDER_ID = 'TU_FOLDER_ID_AQUI';

// ──────────────────────────────────────────────────────────
//  GET — listar imágenes
// ──────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'list') {
      return listFiles();
    }
    return jsonResponse({ success: false, error: 'Acción no reconocida' });
  } catch(err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function listFiles() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const iter   = folder.getFiles();
  const files  = [];

  // Cargar todas las propiedades una sola vez (más eficiente)
  const props    = PropertiesService.getScriptProperties();
  const allProps = props.getProperties();

  while (iter.hasNext()) {
    const file = iter.next();
    const mime = file.getMimeType();
    if (!mime.startsWith('image/')) continue;

    const desc = allProps['desc_' + file.getId()] || '';

    files.push({
      id:           file.getId(),
      name:         file.getName(),
      description:  desc,
      mimeType:     mime,
      createdTime:  file.getDateCreated().toISOString(),
      // URL de miniatura pública (requiere que el archivo sea compartido)
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${file.getId()}&sz=w400`,
      // URL de descarga directa
      downloadUrl:  `https://drive.google.com/uc?export=download&id=${file.getId()}`
    });
  }

  // Ordenar por fecha descendente (más reciente primero)
  files.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

  return jsonResponse({ success: true, files });
}

// ──────────────────────────────────────────────────────────
//  POST — subir imagen
// ──────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    if (payload.action === 'upload') {
      return uploadFile(payload);
    }

    return jsonResponse({ success: false, error: 'Acción no reconocida' });
  } catch(err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function uploadFile(payload) {
  const { filename, mimeType, data, description } = payload;

  if (!filename || !data) {
    return jsonResponse({ success: false, error: 'Faltan datos requeridos' });
  }

  // Decodificar base64 y crear el archivo en Drive
  const decoded = Utilities.base64Decode(data);
  const blob    = Utilities.newBlob(decoded, mimeType, filename);
  const folder  = DriveApp.getFolderById(FOLDER_ID);
  const file    = folder.createFile(blob);

  // Hacer el archivo accesible con enlace (necesario para miniaturas)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // Guardar la descripción como propiedad del script
  if (description) {
    const props = PropertiesService.getScriptProperties();
    props.setProperty('desc_' + file.getId(), description);
  }

  return jsonResponse({
    success:     true,
    fileId:      file.getId(),
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.getId()}`
  });
}

// ──────────────────────────────────────────────────────────
//  Helper
// ──────────────────────────────────────────────────────────
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
