let selectedFiles = [];

const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-input');
const dropzone = document.getElementById('dropzone');
const strip = document.getElementById('preview-strip');

document.getElementById('tab-upload').addEventListener('click', () => switchTab('upload'));
document.getElementById('tab-gallery').addEventListener('click', () => switchTab('gallery'));
document.getElementById('refresh-gallery-btn').addEventListener('click', loadGallery);
document.getElementById('upload-btn').addEventListener('click', uploadFiles);

fileInput.addEventListener('change', e => addFiles(e.target.files));
dropzone.addEventListener('dragover', e => { e.preventDefault(); });
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  addFiles(e.dataTransfer.files);
});

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
    el.innerHTML = `<img src="${URL.createObjectURL(f)}" />`;
    strip.appendChild(el);
  });

  uploadBtn.disabled = selectedFiles.length === 0;
}

async function uploadFiles() {
  const files = selectedFiles;
  if (!files.length) return;

  const wrap = document.getElementById('progress-wrap');
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');

  uploadBtn.disabled = true;
  wrap.style.display = 'block';

  let done = 0;

  for (const file of files) {
    try {
      const response = await fetch(
        "https://piv5s5li0j.execute-api.us-east-1.amazonaws.com/upload-url",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type
          })
        }
      );

      const data = await response.json();

      await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });

      done++;
      bar.style.width = `${Math.round((done / files.length) * 100)}%`;

    } catch (error) {
      console.error(error);
    }
  }

  label.textContent = `¡Listo! ${done} imagen(es) subidas`;
  setTimeout(() => {
    selectedFiles = [];
    strip.innerHTML = "";
    fileInput.value = "";
    bar.style.width = "0%";
    wrap.style.display = "none";
    uploadBtn.disabled = true;
  }, 1500);
}

async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = "Cargando...";

  try {
    const res = await fetch(
      "https://piv5s5li0j.execute-api.us-east-1.amazonaws.com/list-files"
    );

    const data = await res.json();

    if (!data.files || !data.files.length) {
      grid.innerHTML = "No hay imágenes aún";
      return;
    }

    grid.innerHTML = "";

    data.files.forEach(file => {
      const card = document.createElement('div');
      card.className = 'gallery-card';
      card.innerHTML = `
        <img src="${file.url}" />
        <div class="card-info">
          <div class="card-date">${new Date(file.lastModified).toLocaleDateString()}</div>
          <a class="card-dl" href="${file.url}" target="_blank">Descargar</a>
        </div>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    grid.innerHTML = "Error cargando galería";
  }
}
