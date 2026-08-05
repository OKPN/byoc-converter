"use strict";

// --- アプリケーション状態 ---
const state = {
  files: [],
  results: [],
};

// --- DOM 要素 ---
const fileInput = document.querySelector("#fileInput");
const folderInput = document.querySelector("#folderInput");
const folderSelectButton = document.querySelector("#folderSelectButton");
const dropzone = document.querySelector("#dropzone");
const fileList = document.querySelector("#fileList");
const resultList = document.querySelector("#resultList");
const fileCount = document.querySelector("#fileCount");
const statusText = document.querySelector("#statusText");
const convertButton = document.querySelector("#convertButton");
const convertDownloadButton = document.querySelector("#convertDownloadButton");
const clearButton = document.querySelector("#clearButton");
const zipButton = document.querySelector("#zipButton");
const progressBar = document.querySelector("#progressBar");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const formatSelect = document.querySelector("#formatSelect");
const renamePattern = document.querySelector("#renamePattern");
const clearRenamePattern = document.querySelector("#clearRenamePattern");

// テキスト作成支援
const templateSelect = document.querySelector("#templateSelect");
const saveTemplateButton = document.querySelector("#saveTemplateButton");
const deleteTemplateButton = document.querySelector("#deleteTemplateButton");
const composerTextarea = document.querySelector("#composerTextarea");
const clearComposerButton = document.querySelector("#clearComposerButton");
const copyComposerTextButton = document.querySelector("#copyComposerTextButton");

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/jxl": "jxl",
};

const defaultTemplates = {
  "morning": { name: "朝の挨拶", text: "おはよー！" },
  "noon": { name: "昼の挨拶", text: "こんにちは！" },
  "night": { name: "夜の挨拶", text: "おつかれさま！" }
};

// --- 設定の読み込みと初期化 ---
function loadSettings() {
  const savedFormat = localStorage.getItem("formatSelect");
  if (savedFormat && extensions[savedFormat] && formatSelect) {
    formatSelect.value = savedFormat;
  }

  const savedQuality = localStorage.getItem("qualityRange");
  if (savedQuality) {
    if (qualityRange) qualityRange.value = savedQuality;
    if (qualityOutput) qualityOutput.textContent = savedQuality;
  }

  const savedRename = localStorage.getItem("renamePattern");
  if (savedRename && renamePattern) {
    renamePattern.value = savedRename;
  }

  loadTemplates();
}

function loadTemplates(selectedValue = "") {
  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {
    savedTemplates = {};
  }
  
  const templates = { ...defaultTemplates, ...savedTemplates };
  if (!templateSelect) return;
  
  templateSelect.innerHTML = '<option value="">-- 定型文を選択 --</option>';
  for (const [key, item] of Object.entries(templates)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.dataset.text = item.text;
    opt.textContent = item.name;
    templateSelect.append(opt);
  }

  const optCustom = document.createElement("option");
  optCustom.value = "__new__";
  optCustom.textContent = "🆕 新しい定型文を追加...";
  templateSelect.append(optCustom);

  if (selectedValue) {
    templateSelect.value = selectedValue;
  }
}

// 初期化実行
loadSettings();

// --- イベントリスナー ---

qualityRange?.addEventListener("input", () => {
  if (qualityOutput) qualityOutput.textContent = qualityRange.value;
  localStorage.setItem("qualityRange", qualityRange.value);
});

formatSelect?.addEventListener("change", () => {
  localStorage.setItem("formatSelect", formatSelect.value);
});

renamePattern?.addEventListener("input", () => {
  localStorage.setItem("renamePattern", renamePattern.value.trim());
});

clearRenamePattern?.addEventListener("click", () => {
  if (renamePattern) {
    renamePattern.value = "";
    renamePattern.focus();
    localStorage.setItem("renamePattern", "");
  }
});

document.querySelector(".pattern-helpers")?.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("tag-button")) {
    const insertText = target.dataset.insert;
    if (!insertText || !renamePattern) return;

    const start = renamePattern.selectionStart;
    const end = renamePattern.selectionEnd;
    const text = renamePattern.value;

    const newText = text.substring(0, start) + insertText + text.substring(end);
    renamePattern.value = newText;

    renamePattern.focus();
    const newPos = start + insertText.length;
    renamePattern.setSelectionRange(newPos, newPos);

    localStorage.setItem("renamePattern", renamePattern.value.trim());
  }
});

// ファイル選択関連
fileInput?.addEventListener("change", () => {
  const files = Array.from(fileInput.files || []).map(f => {
    f.relativePath = f.name;
    return f;
  });
  addFiles(files);
  fileInput.value = "";
});

folderSelectButton?.addEventListener("click", () => {
  folderInput?.click();
});

folderInput?.addEventListener("change", () => {
  const files = Array.from(folderInput.files || []).map(f => {
    f.relativePath = f.webkitRelativePath || f.name;
    return f;
  });
  addFiles(files);
  folderInput.value = "";
});

// ドラッグ＆ドロップ関連
dropzone?.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("is-dragging");
});

dropzone?.addEventListener("dragleave", () => {
  dropzone.classList.remove("is-dragging");
});

dropzone?.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropzone.classList.remove("is-dragging");

  const items = event.dataTransfer.items;
  if (items) {
    const files = [];
    const scanPromises = [];

    const scanFiles = async (entry, path = "") => {
      if (entry.isFile) {
        const file = await new Promise((resolve, reject) => entry.file(resolve, reject));
        file.relativePath = path ? `${path}/${file.name}` : file.name;
        files.push(file);
      } else if (entry.isDirectory) {
        const reader = entry.createReader();
        const readAllEntries = async () => {
          const entries = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
          if (entries.length > 0) {
            const nextPath = path ? `${path}/${entry.name}` : entry.name;
            for (const nextEntry of entries) {
              await scanFiles(nextEntry, nextPath);
            }
            await readAllEntries();
          }
        };
        await readAllEntries();
      }
    };

    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        scanPromises.push(scanFiles(entry));
      }
    }

    await Promise.all(scanPromises);
    addFiles(files);
  } else {
    const fallbackFiles = Array.from(event.dataTransfer.files || []).map(f => {
      f.relativePath = f.name;
      return f;
    });
    addFiles(fallbackFiles);
  }
});

clearButton?.addEventListener("click", () => {
  state.results.forEach((result) => {
    if (result && result.url) URL.revokeObjectURL(result.url);
  });
  state.files = [];
  state.results = [];
  render();
});

function addFiles(files) {
  const allowed = files.filter((file) => {
    return file.type.startsWith("image/") || 
           file.type.startsWith("audio/") || 
           file.type.startsWith("video/") ||
           file.name.endsWith(".mp3") ||
           file.name.endsWith(".mp4");
  });
  state.files.push(...allowed);
  render();
}

function setUiLock(locked) {
  if (fileInput) fileInput.disabled = locked;
  if (dropzone) dropzone.classList.toggle("is-disabled", locked);
  if (clearButton) clearButton.disabled = locked;
  if (convertButton) convertButton.disabled = locked || state.files.length === 0;
  if (convertDownloadButton) convertDownloadButton.disabled = locked || state.files.length === 0;
}

function render() {
  if (fileCount) fileCount.textContent = `${state.files.length}件`;
  if (convertButton) convertButton.disabled = state.files.length === 0;
  if (convertDownloadButton) convertDownloadButton.disabled = state.files.length === 0;
  updateZipButtonState();

  if (progressBar) {
    progressBar.value = state.results.length && state.files.length
      ? Math.round((state.results.length / state.files.length) * 100)
      : 0;
  }
  if (statusText) {
    statusText.textContent = state.files.length ? "準備完了" : "待機中";
    statusText.className = "";
  }

  if (fileList) {
    fileList.innerHTML = "";
    fileList.querySelectorAll(".thumb[src^='blob:']").forEach(img => URL.revokeObjectURL(img.src));

    state.files.forEach((file, index) => {
      const item = document.createElement("article");
      item.className = "file-item";
      
      let thumbHtml = "";
      if (file.type.startsWith("image/")) {
        thumbHtml = `<img class="thumb" alt="" src="${URL.createObjectURL(file)}">`;
      } else {
        const ext = file.name.split('.').pop().toUpperCase();
        thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext)}</div>`;
      }

      item.innerHTML = `
        ${thumbHtml}
        <div>
          <div class="item-name">${escapeHtml(file.name)}</div>
          <div class="item-meta">${formatBytes(file.size)} · ${escapeHtml(file.type || "不明")}</div>
        </div>
        <button type="button" class="ghost-button delete-button danger-button" data-index="${index}" aria-label="削除">&times;</button>
      `;
      fileList.append(item);
    });
  }

  renderResults();
}

fileList?.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    const index = Number(event.target.dataset.index);
    if (!isNaN(index) && index >= 0 && index < state.files.length) {
      state.files.splice(index, 1);
      render();
    }
  }
});

function renderResults() {
  if (!resultList) return;
  resultList.innerHTML = "";
  if (!state.results.length) {
    const empty = document.createElement("div");
    empty.className = "item-meta";
    empty.textContent = "変換後のファイルがここに表示されます。";
    resultList.append(empty);
    return;
  }

  state.results.forEach(result => {
    if (!result) return;
    const saved = result.originalSize - result.size;
    const savedRate = result.originalSize ? Math.round((saved / result.originalSize) * 100) : 0;
    const item = document.createElement("article");
    item.className = "result-item";

    let thumbHtml = "";
    if (result.isNonImage) {
      const ext = result.name.split('.').pop().toUpperCase();
      thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext)}</div>`;
    } else if (result.previewUrl) {
      thumbHtml = `<img class="thumb" alt="" src="${result.previewUrl}">`;
    } else {
      thumbHtml = `<div class="thumb format-badge">JXL</div>`;
    }

    let metaHtml = "";
    if (result.isNonImage) {
      metaHtml = `${formatBytes(result.size)} · 無変換`;
    } else {
      metaHtml = `${formatBytes(result.originalSize)} -> ${formatBytes(result.size)} · ${savedRate}% 削減`;
    }

    item.innerHTML = `
      <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="画像を表示">
        ${thumbHtml}
      </a>
      <div>
        <div class="item-name">${escapeHtml(result.name)}</div>
        <div class="item-meta">${metaHtml}</div>
      </div>
      <div class="result-actions">
        <button type="button" class="primary-button download-single-btn" data-url="${escapeHtml(result.url)}" data-name="${escapeHtml(result.name)}">ダウンロード</button>
      </div>
    `;
    resultList.append(item);
  });
  updateZipButtonState();
}

resultList?.addEventListener("click", (event) => {
  if (event.target.classList.contains("download-single-btn")) {
    const url = event.target.dataset.url;
    const name = event.target.dataset.name;
    if (url && name) {
      downloadUrl(url, name);
    }
  }
});

// --- 画像変換処理 ---
async function runConversion() {
  if (!state.files.length) return false;
  if (zipButton) zipButton.disabled = true;
  if (progressBar) progressBar.value = 0;
  if (statusText) {
    statusText.textContent = "変換中...";
    statusText.className = "saving";
  }

  state.results.forEach((result) => {
    if (result) {
      if (result.url) URL.revokeObjectURL(result.url);
      if (result.previewUrl) URL.revokeObjectURL(result.previewUrl);
    }
  });
  state.results = [];
  renderResults();
  setUiLock(true);

  try {
    state.results = new Array(state.files.length).fill(null);

    const conversionPromises = state.files.map((file, index) =>
      convertImage(file, index).then(result => {
        state.results[index] = result;
        const finishedCount = state.results.filter(r => r !== null).length;
        if (progressBar) progressBar.value = Math.round((finishedCount / state.files.length) * 100);
        renderResults();
      })
    );
    await Promise.all(conversionPromises);
    if (statusText) {
      statusText.textContent = "変換完了";
      statusText.className = "";
    }
    return true;
  } catch (error) {
    console.error("Conversion error:", error);
    if (statusText) {
      statusText.textContent = "変換失敗";
      statusText.className = "error";
    }
    return false;
  } finally {
    setUiLock(false);
    updateZipButtonState();
  }
}

async function convertImage(file, index = 0) {
  if (!file.type.startsWith("image/")) {
    const url = URL.createObjectURL(file);
    const outputName = createOutputName(file.name, null, index);
    return {
      id: crypto.randomUUID(),
      name: outputName,
      relativePath: file.relativePath || file.name,
      url,
      previewUrl: "",
      blob: file,
      size: file.size,
      originalSize: file.size,
      isNonImage: true,
    };
  }

  const options = {
    mimeType: formatSelect ? formatSelect.value : "image/webp",
    quality: qualityRange ? Number(qualityRange.value) / 100 : 0.85,
    name: createOutputName(file.name, formatSelect ? formatSelect.value : "image/webp", index),
  };

  let finalBlob = null;

  try {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d", { alpha: true });
    context.drawImage(image, 0, 0);

    finalBlob = await canvasToBlob(canvas, options.mimeType, options.quality);
  } catch (err) {
    console.warn("Canvas conversion fallback failed, using original blob:", err);
    finalBlob = file;
  }

  const finalUrl = URL.createObjectURL(finalBlob);

  return {
    id: crypto.randomUUID(),
    name: options.name,
    relativePath: file.relativePath || file.name,
    url: finalUrl,
    previewUrl: finalUrl,
    blob: finalBlob,
    size: finalBlob.size,
    originalSize: file.size,
    isNonImage: false,
  };
}

convertButton?.addEventListener("click", async () => {
  await runConversion();
});

convertDownloadButton?.addEventListener("click", async () => {
  const success = await runConversion();
  if (!success) return;

  if (statusText) statusText.textContent = "自動ダウンロード中...";
  for (const result of state.results) {
    if (result && result.url) {
      downloadUrl(result.url, result.name);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  if (statusText) statusText.textContent = "自動ダウンロード完了";
});

function updateZipButtonState() {
  if (zipButton) {
    zipButton.disabled = state.results.length === 0;
  }
}

zipButton?.addEventListener("click", async () => {
  if (!zipButton || !state.results.length) return;
  zipButton.disabled = true;
  if (statusText) {
    statusText.textContent = "ZIP作成中...";
    statusText.className = "saving";
  }

  try {
    const entries = [];
    for (const result of state.results) {
      if (result && result.blob) {
        entries.push({
          name: result.name,
          data: new Uint8Array(await result.blob.arrayBuffer()),
        });
      }
    }

    const zipBlob = createZip(entries);
    const url = URL.createObjectURL(zipBlob);
    downloadUrl(url, "converted-images.zip");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (statusText) statusText.textContent = "ZIP一括ダウンロード完了";
  } catch (error) {
    console.error("Zip error:", error);
    if (statusText) {
      statusText.textContent = "ZIP失敗";
      statusText.className = "error";
    }
  } finally {
    updateZipButtonState();
  }
});

// --- ユーティリティ関数 ---

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Could not encode ${mimeType}`));
    }, mimeType, quality);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not load ${file.name}`));
    };
    image.src = url;
  });
}

function generateRandomString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createOutputName(originalName, mimeType, index = 0) {
  const dotIndex = originalName.lastIndexOf(".");
  const baseName = dotIndex > 0 ? originalName.slice(0, dotIndex) : originalName;
  const originalExt = dotIndex > 0 ? originalName.slice(dotIndex + 1) : "";
  const pattern = renamePattern?.value?.trim() || "{name}";
  
  let safeBase = pattern.replaceAll("{name}", baseName);

  safeBase = safeBase.replace(/\{rand[ao]m(?::(\d+))?\}/g, (match, digits) => {
    const len = digits ? parseInt(digits, 10) : 6;
    return generateRandomString(len);
  });

  safeBase = safeBase.replace(/\{num(?::(\d+))?\}/g, (match, digits) => {
    const numValue = index + 1;
    if (digits) {
      const targetLength = parseInt(digits, 10);
      return String(numValue).padStart(targetLength, "0");
    }
    return String(numValue);
  });

  safeBase = safeBase.replace(/[\\/:*?"<>|]/g, "-");

  const ext = (mimeType && extensions[mimeType]) ? extensions[mimeType] : (originalExt || "bin");
  return `${safeBase}.${ext}`;
}

function createZip(entries) {
  const files = [];
  const centralDirectory = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.name);
    const data = entry.data;
    const crc = crc32(data);

    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    files.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralDirectory.push(centralHeader);

    offset += localHeader.length + data.length;
  }

  const centralSize = centralDirectory.reduce((sum, chunk) => sum + chunk.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...files, ...centralDirectory, end], { type: "application/zip" });
}

function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function downloadUrl(url, name) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units.shift();
  while (value >= 1024 && units.length) {
    value /= 1024;
    unit = units.shift();
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// テキスト作成支援定型文イベント
templateSelect?.addEventListener("change", () => {
  const val = templateSelect.value;
  const opt = templateSelect.selectedOptions[0];
  const isCustom = val && val.startsWith("custom_");
  if (deleteTemplateButton) deleteTemplateButton.style.display = isCustom ? "inline-block" : "none";

  if (val === "__new__") {
    if (composerTextarea) composerTextarea.value = "";
    if (saveTemplateButton) saveTemplateButton.textContent = "定型文を新規保存";
  } else if (isCustom) {
    if (saveTemplateButton) saveTemplateButton.textContent = "定型文を上書き保存";
  } else {
    if (saveTemplateButton) saveTemplateButton.textContent = "定型文を保存";
  }

  if (val !== "__new__" && opt && opt.dataset.text && composerTextarea) {
    composerTextarea.value = opt.dataset.text;
  }
});

saveTemplateButton?.addEventListener("click", () => {
  const text = composerTextarea?.value?.trim();
  if (!text) {
    alert("文章を入力してください。");
    return;
  }
  const val = templateSelect.value;
  const isCustom = val && val.startsWith("custom_");

  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {}

  if (isCustom) {
    savedTemplates[val].text = text;
    localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));
    loadTemplates(val);
    alert("上書き保存しました。");
  } else {
    const name = prompt("定型文の名前を入力してください:", "カスタム定型文");
    if (!name) return;
    const key = `custom_${Date.now()}`;
    savedTemplates[key] = { name, text };
    localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));
    loadTemplates(key);
    alert("新規保存しました。");
  }
});

deleteTemplateButton?.addEventListener("click", () => {
  const val = templateSelect.value;
  if (!val || !val.startsWith("custom_")) return;
  if (!confirm("この定型文を削除しますか？")) return;

  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {}

  delete savedTemplates[val];
  localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));
  loadTemplates("");
  if (composerTextarea) composerTextarea.value = "";
});

clearComposerButton?.addEventListener("click", () => {
  if (composerTextarea) composerTextarea.value = "";
});

copyComposerTextButton?.addEventListener("click", async () => {
  const text = composerTextarea?.value;
  if (!text || !text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
    if (copyComposerTextButton) {
      copyComposerTextButton.textContent = "コピー完了!";
      setTimeout(() => { copyComposerTextButton.textContent = "文章をコピーする"; }, 2000);
    }
  } catch (err) {
    console.error("Failed to copy:", err);
  }
});

render();
