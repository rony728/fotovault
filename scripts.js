const STORAGE_KEY = 'fotovault_script_url';
let SCRIPT_URL = localStorage.getItem(STORAGE_KEY) || '';
let selectedFiles = [];

const configModal = document.getElementById('config-modal');
const scriptInput = document.getElementById('script-url-input');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const strip = document.getElementById('preview-strip');

window.addEventListener('load', () => {
  if (!SCRIPT_URL) configModal.classList.add('open');
  else scriptInput.value = SCRIPT_URL;
});

document.getElementById('save-config-btn').addEventListener('click', saveConfig);
document.querySelector('.config-btn').addEventListener('click', () => configModal.classList.add('open'));
document.getElementById('tab-upload').addEventListener('click', () => switchTab('upload'));
document.getElementById('tab-gallery').addEventListener('click', () => switchTab('gallery'));
document.getElementById('refresh-gallery-btn').addEventListener('click', loadGallery);
document.getElementById('upload-btn').addEventListener('click', uploadFiles);

fileInput.addEventListener('change', e => addFiles(e.target.files));
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag-over');
  addFiles(e.dataTransfer.files);
});

function saveConfig() {
  const val = scriptInput.value.trim();
  if (!val.startsWith('https://script.google.com')) {
    toast('URL inválida', 'error');
    return;
  }
  SCRIPT_URL = val;
  localStorage.setItem(STORAGE_KEY, val);
  configModal.classList.remove('open');
  toast('Configuración guardada ✓', 'success');
}

function switchTab(tab) {
  document.getElementById('tab-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('tab-gallery').classList.toggle('active', tab === 'gallery');
  document.getElementById('panel-upload').classList.toggle('active', tab === 'upload');
  document.getElementById('panel-gallery').classList.toggle('active', tab === 'gallery');
  if (tab === 'gallery') loadGallery();
}

function addFiles(files) {
  [...files].forEach(f => {
    if (!f.type.startsWith('image/')) return;
    const idx = selectedFiles.length;
    selectedFiles.push(f);

    const el = document.createElement('div');
    el.className = 'preview-thumb';
    el.dataset.idx = idx;
    el.innerHTML = `
      <img src="${URL.createObjectURL(f)}" />
      <button class="rm">✕</button>
    `;
    el.querySelector('.rm').addEventListener('click', () => removeFile(idx));
    strip.appendChild(el);
  });
  uploadBtn.disabled = selectedFiles.filter(Boolean).length === 0;
}

function removeFile(idx) {
  selectedFiles[idx] = null;
  strip.querySelector(`[data-idx="${idx}"]`)?.remove();
  uploadBtn.disabled = selectedFiles.filter(Boolean).length === 0;
}

async function uploadFiles() {
  if (!SCRIPT_URL) { configModal.classList.add('open'); return; }

  const files = selectedFiles.filter(Boolean);
  if (!files.length) return;

  const desc = document.getElementById('description').value.trim();
  const wrap = document.getElementById('progress-wrap');
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  uploadBtn.disabled = true;
  wrap.style.display = 'block';

  let done = 0;

  for (const file of files) {
    label.textContent = `Subiendo ${done + 1} de ${files.length}: ${file.name}`;

    try {
      const formData = new FormData();
      formData.append("action", "upload");
      formData.append("description", desc);
      formData.append("file", file);

      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body: formData
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error desconocido");

    } catch (e) {
      toast(`Error en ${file.name}: ${e.message}`, "error");
    }

    done++;
    bar.style.width = `${Math.round(done / files.length * 100)}%`;
  }

  label.textContent = `¡Listo! ${done} imagen(es) subidas ✓`;
  toast(`${done} imagen(es) subidas ✓`, "success");

  setTimeout(() => {
    selectedFiles = [];
    strip.innerHTML = "";
    document.getElementById("description").value = "";
    fileInput.value = "";
    bar.style.width = "0%";
    wrap.style.display = "none";
    uploadBtn.disabled = true;
  }, 2000);
}

async function loadGallery() {
  if (!SCRIPT_URL) return;

  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = 'Cargando...';

  try {
    const res = await fetch(`${SCRIPT_URL}?action=list`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    renderGallery(json.files);
  } catch (e) {
    grid.innerHTML = e.message;
  }
}

function renderGallery(files) {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  if (!files || !files.length) {
    grid.innerHTML = 'No hay imágenes aún';
    return;
  }

  files.forEach(f => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <img src="${f.thumbnailUrl}" loading="lazy" />
      <div class="card-info">
        <div class="card-desc">${f.description || f.name}</div>
        <div class="card-date">${new Date(f.createdTime).toLocaleDateString()}</div>
        <a class="card-dl" href="${f.downloadUrl}" target="_blank">↓ Descargar</a>
      </div>
    `;
    grid.appendChild(card);
  });
}

let toastTimer;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.className = '', 3500);
}
