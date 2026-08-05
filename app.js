"use strict";

const KV_MAX_SIZE = 25 * 1024 * 1024;  // 25MB
const KV_WARN_SIZE = 15 * 1024 * 1024; // 15MB

const state = {
  files: [],
  results: [],
  r2TotalSize: 0,
};

const fileInput = document.querySelector("#fileInput");
const dropzone = document.querySelector("#dropzone");
const fileList = document.querySelector("#fileList");
const resultList = document.querySelector("#resultList");
const fileCount = document.querySelector("#fileCount");
const statusText = document.querySelector("#statusText");
const convertButton = document.querySelector("#convertButton");
const convertUploadButton = document.querySelector("#convertUploadButton");
const convertDownloadButton = document.querySelector("#convertDownloadButton");
const clearButton = document.querySelector("#clearButton");
const zipButton = document.querySelector("#zipButton");
const uploadAllButton = document.querySelector("#uploadAllButton");
const progressBar = document.querySelector("#progressBar");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const formatSelect = document.querySelector("#formatSelect");
const renamePattern = document.querySelector("#renamePattern");
const clearRenamePattern = document.querySelector("#clearRenamePattern");
const uploadOriginalButton = document.querySelector("#uploadOriginalButton");
const uploadRenameButton = document.querySelector("#uploadRenameButton");
const tempTtlSelect = document.querySelector("#tempTtlSelect");
const storageLimitRange = document.querySelector("#storageLimitRange");
const storageLimitOutput = document.querySelector("#storageLimitOutput");

// ☁️ Cloudflare 情報パネル
const cfEndpoint = document.querySelector("#cfEndpoint");
const cfToken = document.querySelector("#cfToken");
const cfDirectDomain = document.querySelector("#cfDirectDomain");
const cfSaveButton = document.querySelector("#cfSaveButton");
const cfClearButton = document.querySelector("#cfClearButton");
const cfStatus = document.querySelector("#cfStatus");
const cfSettingsAccordion = document.querySelector("#cfSettingsAccordion");

const templateSelect = document.querySelector("#templateSelect");
const saveTemplateButton = document.querySelector("#saveTemplateButton");
const deleteTemplateButton = document.querySelector("#deleteTemplateButton");
const paletteList = document.querySelector("#paletteList");
const composerTextarea = document.querySelector("#composerTextarea");
const clearComposerButton = document.querySelector("#clearComposerButton");
const copyComposerTextButton = document.querySelector("#copyComposerTextButton");

let paletteFiles = []; // パレットに表示するR2ファイル一覧をキャッシュ
let hasCleanedOnStart = false;

const r2FileList = document.querySelector("#r2FileList");
const deleteSelectedR2FilesButton = document.querySelector("#deleteSelectedR2FilesButton");
const reloadR2FilesButton = document.querySelector("#reloadR2FilesButton");
const storageUsage = document.querySelector("#storageUsage");
const storageUsageBar = document.querySelector("#storageUsageBar");
const storageUsageText = document.querySelector("#storageUsageText");
const folderSelectButton = document.querySelector("#folderSelectButton");
const folderInput = document.querySelector("#folderInput");
const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/jxl": "jxl",
};

const DEFAULT_R2_DEV_URL = (typeof import.meta !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_DEFAULT_R2_DEV_URL) || "https://pub-af80885fa5b341b882bfaccce7d29530.r2.dev";
const DEFAULT_API_ENDPOINT = (typeof import.meta !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_DEFAULT_API_ENDPOINT) || "";
const DEFAULT_API_TOKEN = (typeof import.meta !== "undefined" && import.meta && import.meta.env && import.meta.env.VITE_DEFAULT_API_TOKEN) || "";

const defaultTemplates = {
  "morning": { name: "朝の挨拶", text: "おはよー！\n{url}" },
  "noon": { name: "昼の挨拶", text: "こんにちは！\n{url}" },
  "night": { name: "夜の挨拶", text: "おつかれさま！\n{url}" }
};

function loadTemplates(selectedValue = "") {
  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {
    savedTemplates = {};
  }
  
  const templates = { ...defaultTemplates, ...savedTemplates };
  
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

function renderUrlPalette() {
  paletteList.innerHTML = "";
  
  if (paletteFiles.length === 0) {
    paletteList.innerHTML = `<span style="font-size: 11px; color: var(--muted); padding: 8px;">アップロード済みのファイルがありません。</span>`;
    return;
  }
  
  paletteFiles.forEach(file => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "palette-chip";
    btn.dataset.url = file.url;
    btn.title = file.key;
    
    const ext = file.key ? file.key.split('.').pop().toLowerCase() : "";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      const img = document.createElement("img");
      img.src = file.url;
      img.alt = file.key;
      img.loading = "lazy";
      btn.append(img);
    } else {
      btn.className += " format-badge";
      btn.textContent = ext.toUpperCase();
    }
    
    btn.addEventListener("click", () => {
      insertAtCursor(file.url);
    });
    
    paletteList.append(btn);
  });
}

function insertAtCursor(text) {
  const textarea = composerTextarea;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  
  if (val.includes("{url}")) {
    const idx = val.indexOf("{url}");
    textarea.value = val.replace("{url}", text);
    const newPos = idx + text.length;
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
  } else {
    textarea.value = val.substring(0, start) + text + val.substring(end);
    const newPos = start + text.length;
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
  }
}

function loadSettings() {
  // Cloudflare 情報を localStorage から復元
  const savedEndpoint = localStorage.getItem("cfEndpoint") || "";
  const savedToken    = localStorage.getItem("cfToken")    || "";
  const savedDirect   = localStorage.getItem("cfDirectDomain") || "";
  if (cfEndpoint) cfEndpoint.value = savedEndpoint;
  if (cfToken)    cfToken.value    = savedToken;
  if (cfDirectDomain) cfDirectDomain.value = savedDirect;

  // 設定済みかどうかをステータスに反映
  updateCfStatus();

  const savedFormat = localStorage.getItem("formatSelect");
  if (savedFormat && extensions[savedFormat]) {
    if (formatSelect) formatSelect.value = savedFormat;
  }

  const savedQuality = localStorage.getItem("qualityRange");
  if (savedQuality) {
    if (qualityRange) qualityRange.value = savedQuality;
    if (qualityOutput) qualityOutput.textContent = savedQuality;
  }

  const savedRename = localStorage.getItem("renamePattern");
  if (savedRename) {
    if (renamePattern) renamePattern.value = savedRename;
  }

  const savedLimit = localStorage.getItem("storageLimit") || "10000";
  if (storageLimitRange) storageLimitRange.value = savedLimit;
  updateLimitOutput(savedLimit);

  const savedTempTtl = localStorage.getItem("tempTtlSelect");
  if (savedTempTtl && tempTtlSelect) {
    tempTtlSelect.value = savedTempTtl;
  }

  loadTemplates();
}

/** Cloudflare 情報が設定済みかチェックし、ステータス表示＆アップロードボタン有効/無効を切り替える */
function updateCfStatus() {
  const endpoint = localStorage.getItem("cfEndpoint") || "";
  const token    = localStorage.getItem("cfToken")    || "";
  const isConfigured = endpoint !== "" && token !== "";

  if (cfStatus) {
    if (isConfigured) {
      cfStatus.innerHTML = `<span style="color: #4caf50;">✅ 設定済み: ${escapeHtml(endpoint)}</span>`;
    } else {
      cfStatus.innerHTML = `<span style="color: var(--danger);">⚠️ Worker URL と API トークンを入力して保存してください</span>`;
    }
  }

  // アップロード系ボタンは CF 情報が揃っている場合のみ有効化できる（ファイル選択状態で最終判定）
  // ここでは「CF設定がない場合は常に無効」の制御のみ行う
  const uploadButtons = [convertUploadButton, uploadRenameButton, uploadOriginalButton];
  if (!isConfigured) {
    uploadButtons.forEach(btn => { if (btn) btn.disabled = true; });
    if (cfSettingsAccordion) cfSettingsAccordion.open = true;
  }
  // 有効化は updateButtonStates() に委ねる（ファイル選択状態との組み合わせが必要）
  return isConfigured;
}

function getR2BaseUrl() {
  // 直リンクドメインが設定されていればそちらを使用、なければ Worker URL を使用
  const direct = (localStorage.getItem("cfDirectDomain") || "").replace(/\/$/, "");
  if (direct) return direct;
  const endpoint = (localStorage.getItem("cfEndpoint") || "").replace(/\/$/, "");
  return endpoint;
}

function getApiUrl(path) {
  const endpoint = (localStorage.getItem("cfEndpoint") || "").replace(/\/$/, "");
  if (!endpoint) return path;
  const relativePath = path.startsWith("/") ? path : `/${path}`;
  return `${endpoint}${relativePath}`;
}

function getPublicUrl(workerUrl) {
  const directBase = getR2BaseUrl();
  if (!directBase) return workerUrl;

  try {
    return `${directBase}${new URL(workerUrl).pathname}`;
  } catch {
    return workerUrl;
  }
}

function getRequestHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = (localStorage.getItem("cfToken") || "").trim();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function updateLimitOutput(value) {
  if (!storageLimitOutput) return;
  const mb = Number(value);
  if (mb >= 1000) {
    storageLimitOutput.textContent = `1.0 GB`;
  } else {
    storageLimitOutput.textContent = `${(mb / 1000).toFixed(1)} GB`;
  }
}

function updateStorageUsageUI() {
  if (!storageLimitRange || !storageUsageText || !storageUsageBar) return;
  const totalSize = state.r2TotalSize || 0;
  const limitMb = Number(storageLimitRange.value) || 1000;
  const limitBytes = limitMb * 1024 * 1024;
  
  const percentage = limitBytes > 0 ? (totalSize / limitBytes) * 100 : 0;
  const clampedPercentage = Math.min(100, Math.round(percentage * 10) / 10);
  
  if (storageUsage) storageUsage.hidden = false;
  if (storageUsageBar) storageUsageBar.value = clampedPercentage;
  
  if (storageUsageText) {
    const formattedLimit = limitMb >= 1000 ? "1.0 GB" : `${(limitMb / 1000).toFixed(1)} GB`;
    storageUsageText.textContent = `使用量: ${formatBytes(totalSize)} / ${formattedLimit} (${clampedPercentage}%)`;
    
    if (totalSize > limitBytes) {
      storageUsageText.classList.add("storage-warning");
    } else {
      storageUsageText.classList.remove("storage-warning");
    }
  }
}

// 起動時の初期ロード
loadSettings();

// ☁️ Cloudflare 情報 — リアルタイム自動保存
const saveCfSettingsAuto = () => {
  const endpoint = cfEndpoint?.value?.trim() || "";
  const token    = cfToken?.value?.trim()    || "";
  const direct   = cfDirectDomain?.value?.trim() || "";
  if (endpoint) localStorage.setItem("cfEndpoint", endpoint);
  else localStorage.removeItem("cfEndpoint");
  if (token) localStorage.setItem("cfToken", token);
  else localStorage.removeItem("cfToken");
  if (direct) localStorage.setItem("cfDirectDomain", direct);
  else localStorage.removeItem("cfDirectDomain");
  updateCfStatus();
  render();
};

cfEndpoint?.addEventListener("input", saveCfSettingsAuto);
cfToken?.addEventListener("input", saveCfSettingsAuto);
cfDirectDomain?.addEventListener("input", saveCfSettingsAuto);

// ☁️ Cloudflare 情報 — 保存ボタン
cfSaveButton?.addEventListener("click", () => {
  const endpoint = cfEndpoint?.value?.trim() || "";
  const token    = cfToken?.value?.trim()    || "";

  if (!endpoint || !token) {
    if (cfStatus) cfStatus.innerHTML = `<span style="color: var(--danger);">⚠️ Worker URL と API トークンは必須です</span>`;
    return;
  }

  saveCfSettingsAuto();
  if (cfSettingsAccordion) cfSettingsAccordion.open = false;
});

// ☁️ Cloudflare 情報 — クリアボタン
cfClearButton?.addEventListener("click", () => {
  localStorage.removeItem("cfEndpoint");
  localStorage.removeItem("cfToken");
  localStorage.removeItem("cfDirectDomain");
  if (cfEndpoint) cfEndpoint.value = "";
  if (cfToken)    cfToken.value    = "";
  if (cfDirectDomain) cfDirectDomain.value = "";
  updateCfStatus();
  render();
  if (cfSettingsAccordion) cfSettingsAccordion.open = true;
});

qualityRange.addEventListener("input", () => {
  qualityOutput.textContent = qualityRange.value;
  localStorage.setItem("qualityRange", qualityRange.value);
});

formatSelect.addEventListener("change", () => {
  localStorage.setItem("formatSelect", formatSelect.value);
});

tempTtlSelect?.addEventListener("change", () => {
  if (tempTtlSelect) {
    localStorage.setItem("tempTtlSelect", tempTtlSelect.value);
  }
});

renamePattern.addEventListener("input", () => {
  localStorage.setItem("renamePattern", renamePattern.value.trim());
});

clearRenamePattern?.addEventListener("click", () => {
  renamePattern.value = "";
  renamePattern.focus();
  localStorage.setItem("renamePattern", "");
});

document.querySelector(".pattern-helpers")?.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("tag-button")) {
    const insertText = target.dataset.insert;
    if (!insertText) return;

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

r2CustomUrl?.addEventListener("input", () => {
  localStorage.setItem("r2CustomUrl", r2CustomUrl.value.trim());
});

apiEndpoint?.addEventListener("input", () => {
  localStorage.setItem("apiEndpoint", apiEndpoint.value.trim());
});

apiToken?.addEventListener("input", () => {
  localStorage.setItem("apiToken", apiToken.value.trim());
});

function saveSharedConfig() {
  // BYOC Workerにはアプリ設定を保持させず、利用中のブラウザだけに保存する。
  localStorage.setItem("storageLimit", storageLimitRange?.value || "10000");
  localStorage.setItem("autoCleanEnabled", String(autoCleanEnabled?.checked || false));
  localStorage.setItem("autoCleanDays", autoCleanDays?.value || "7");
}

storageLimitRange?.addEventListener("input", () => {
  const val = storageLimitRange.value;
  updateLimitOutput(val);
  localStorage.setItem("storageLimit", val);
  updateStorageUsageUI();
});

storageLimitRange?.addEventListener("change", saveSharedConfig);

autoCleanEnabled?.addEventListener("change", () => {
  const isEnabled = autoCleanEnabled.checked;
  localStorage.setItem("autoCleanEnabled", isEnabled);
  if (autoCleanDaysContainer) autoCleanDaysContainer.style.display = isEnabled ? "block" : "none";
  saveSharedConfig();
});

autoCleanDays?.addEventListener("input", () => {
  const val = autoCleanDays.value;
  if (autoCleanDaysOutput) autoCleanDaysOutput.textContent = `${val}日`;
  localStorage.setItem("autoCleanDays", val);
});

autoCleanDays?.addEventListener("change", saveSharedConfig);

// 5ch投稿用テキスト作成関連のイベントリスナー
templateSelect.addEventListener("change", () => {
  const val = templateSelect.value;
  const opt = templateSelect.selectedOptions[0];
  
  const isCustom = val && val.startsWith("custom_");
  deleteTemplateButton.style.display = isCustom ? "inline-block" : "none";

  if (val === "__new__") {
    if (composerTextarea.value.trim() !== "" && !confirm("現在のテキストエリアをクリアして、新しい定型文を作成しますか？")) {
      templateSelect.value = "";
      deleteTemplateButton.style.display = "none";
      saveTemplateButton.textContent = "定型文を保存";
      return;
    }
    composerTextarea.value = "";
    saveTemplateButton.textContent = "定型文を新規保存";
  } else if (isCustom) {
    saveTemplateButton.textContent = "定型文を上書き保存";
  } else {
    saveTemplateButton.textContent = "定型文を新規保存";
  }

  if (val !== "__new__" && opt && opt.dataset.text) {
    if (composerTextarea.value.trim() !== "" && !confirm("現在の入力テキストを上書きしますか？")) {
      templateSelect.value = "";
      deleteTemplateButton.style.display = "none";
      saveTemplateButton.textContent = "定型文を保存";
      return;
    }
    composerTextarea.value = opt.dataset.text;
  }
});

saveTemplateButton.addEventListener("click", () => {
  const text = composerTextarea.value.trim();
  if (!text) {
    alert("保存する定型文（文章）を下のテキストエリアに入力してください。");
    return;
  }
  
  const val = templateSelect.value;
  const isCustom = val && val.startsWith("custom_");

  if (isCustom) {
    if (!confirm("この定型文を上書き保存しますか？")) return;
    
    let savedTemplates = {};
    try {
      savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
    } catch (e) {}
    
    if (savedTemplates[val]) {
      savedTemplates[val].text = text;
      localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));
      loadTemplates(val);
      alert("定型文を上書き保存しました。");
    }
  } else {
    const name = prompt("この定型文の名前（ラベル）を入力してください:", "カスタム定型文");
    if (!name) return;
    
    let savedTemplates = {};
    try {
      savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
    } catch (e) {}
    
    const key = `custom_${Date.now()}`;
    savedTemplates[key] = { name, text };
    localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));
    
    loadTemplates(key);
    deleteTemplateButton.style.display = "inline-block";
    saveTemplateButton.textContent = "定型文を上書き保存";
    alert("定型文を新規保存しました。");
  }
});

deleteTemplateButton.addEventListener("click", () => {
  const val = templateSelect.value;
  if (!val || !val.startsWith("custom_")) {
    alert("削除できるのは作成したカスタム定型文のみです。");
    return;
  }

  if (!confirm("この定型文を削除しますか？")) return;

  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {}

  delete savedTemplates[val];
  localStorage.setItem("composerTemplates", JSON.stringify(savedTemplates));

  loadTemplates("");
  composerTextarea.value = "";
  deleteTemplateButton.style.display = "none";
  saveTemplateButton.textContent = "定型文を保存";
});

clearComposerButton.addEventListener("click", () => {
  if (composerTextarea.value.trim() === "" || confirm("テキストエリアをクリアしますか？")) {
    composerTextarea.value = "";
    templateSelect.value = "";
    deleteTemplateButton.style.display = "none";
    saveTemplateButton.textContent = "定型文を保存";
  }
});

copyComposerTextButton.addEventListener("click", async () => {
  const text = composerTextarea.value;
  if (!text.trim()) {
    alert("コピーする文章がありません。");
    return;
  }
  
  try {
    await navigator.clipboard.writeText(text);
    copyComposerTextButton.textContent = "コピー完了!";
    setTimeout(() => {
      copyComposerTextButton.textContent = "文章をコピーする";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text:", err);
    alert("コピーに失敗しました。");
  }
});


fileInput.addEventListener("change", () => {
  const files = Array.from(fileInput.files || []).map(f => {
    f.relativePath = f.name;
    return f;
  });
  addFiles(files);
  fileInput.value = "";
});

folderSelectButton.addEventListener("click", () => {
  folderInput.click();
});

folderInput.addEventListener("change", () => {
  const files = Array.from(folderInput.files || []).map(f => {
    f.relativePath = f.webkitRelativePath || f.name;
    return f;
  });
  addFiles(files);
  folderInput.value = "";
});

dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("is-dragging");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("is-dragging");
});

dropzone.addEventListener("drop", async (event) => {
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

clearButton.addEventListener("click", () => {
  state.results.forEach((result) => URL.revokeObjectURL(result.url));
  state.files = [];
  state.results = [];
  render();
});

function setUiLock(locked) {
  const cfOk = (localStorage.getItem("cfEndpoint") || "") !== "" && (localStorage.getItem("cfToken") || "") !== "";
  fileInput.disabled = locked;
  dropzone.classList.toggle("is-disabled", locked);
  clearButton.disabled = locked;
  convertButton.disabled = locked || state.files.length === 0;
  convertUploadButton.disabled = locked || state.files.length === 0 || !cfOk;
  convertDownloadButton.disabled = locked || state.files.length === 0;
  uploadOriginalButton.disabled = locked || state.files.length === 0 || !cfOk;
  uploadRenameButton.disabled = locked || state.files.length === 0 || !cfOk;
  if (locked) uploadAllButton.disabled = true;
}

async function runConversion() {
  zipButton.disabled = true;
  progressBar.value = 0;
  statusText.textContent = "変換中";
  statusText.className = "saving";
  state.results.forEach((result) => {
    if (result) {
      URL.revokeObjectURL(result.url);
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
        progressBar.value = Math.round((finishedCount / state.files.length) * 100);
        renderResults();
      })
    );
    await Promise.all(conversionPromises);
    statusText.textContent = "完了";
    return true;
  } catch (error) {
    console.error(error);
    statusText.textContent = "失敗";
    statusText.className = "error";
    return false;
  } finally {
    setUiLock(false);
    updateZipButtonState();
    updateUploadAllButtonState();
  }
}

convertButton.addEventListener("click", async () => {
  if (!state.files.length) return;
  await runConversion();
});

convertUploadButton.addEventListener("click", async () => {
  if (!state.files.length) return;

  const success = await runConversion();
  if (!success) return;

  // すでにアップロード済みのものは除外してアップロード
  const targets = state.results.filter(r => r && !r.isUploaded && !r.isUploading);
  if (targets.length === 0) {
    statusText.textContent = "アップロード対象がありません";
    statusText.className = "error";
    return;
  }

  setUiLock(true);
  statusText.className = "saving";
  progressBar.value = 0;

  try {
    for (let i = 0; i < targets.length; i++) {
      const result = targets[i];
      statusText.textContent = `アップロード中 (${i + 1}/${targets.length})`;
      await uploadImage(result);
      progressBar.value = Math.round(((i + 1) / targets.length) * 100);
    }
    progressBar.value = 100;
    statusText.textContent = "一括アップロード完了";
  } catch (error) {
    console.error("Consolidated upload failed:", error);
    statusText.textContent = `アップロード失敗: ${error.message}`;
    statusText.className = "error";
  } finally {
    setUiLock(false);
    updateUploadAllButtonState();
  }
});

convertDownloadButton.addEventListener("click", async () => {
  if (!state.files.length) return;

  const success = await runConversion();
  if (!success) return;

  statusText.textContent = "自動ダウンロード中";
  try {
    for (const result of state.results) {
      if (result) {
        const downloadName = result.relativePath ? result.relativePath.split('/').pop() : result.name;
        downloadUrl(result.url, downloadName);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    statusText.textContent = "自動ダウンロード完了";
  } catch (error) {
    console.error("Auto download failed:", error);
    statusText.textContent = "ダウンロード失敗";
    statusText.className = "error";
  }
});

uploadOriginalButton.addEventListener("click", async () => {
  if (!state.files.length) return;

  setUiLock(true);
  statusText.textContent = `アップロード中 (0/${state.files.length})`;
  statusText.className = "saving";
  progressBar.value = 0;

  try {
    let completedCount = 0;
    const uploadPromises = state.files.map(file => (
      uploadFile(file).then(() => {
        completedCount++;
        statusText.textContent = `アップロード中 (${completedCount}/${state.files.length})`;
        progressBar.value = Math.round((completedCount / state.files.length) * 100);
      })
    ));

    await Promise.all(uploadPromises);

    statusText.textContent = "アップロード完了";
    // 入力ファイルをクリア
    state.files = [];
    render();
    // R2リストを更新
    await fetchAndRenderR2Files();

  } catch (error) {
    console.error(error);
    statusText.textContent = error.message;
    statusText.className = "error";
  } finally {
    setUiLock(false);
  }
});

uploadRenameButton.addEventListener("click", async () => {
  if (!state.files.length) return;

  setUiLock(true);
  statusText.textContent = `アップロード中 (0/${state.files.length})`;
  statusText.className = "saving";
  progressBar.value = 0;

  try {
    let completedCount = 0;
    const uploadPromises = state.files.map((file, index) => {
      const dotIndex = file.name.lastIndexOf(".");
      const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
      const ext = dotIndex > 0 ? file.name.slice(dotIndex) : "";
      
      const pattern = renamePattern.value.trim() || "{name}";
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
      const newFilename = `${safeBase}${ext}`;

      return uploadFile(file, newFilename).then(() => {
        completedCount++;
        statusText.textContent = `アップロード中 (${completedCount}/${state.files.length})`;
        progressBar.value = Math.round((completedCount / state.files.length) * 100);
      });
    });

    await Promise.all(uploadPromises);

    statusText.textContent = "アップロード完了";
    state.files = [];
    render();
    await fetchAndRenderR2Files();

  } catch (error) {
    console.error(error);
    statusText.textContent = error.message;
    statusText.className = "error";
  } finally {
    setUiLock(false);
  }
});

function updateZipButtonState() {
  const unuploadedResults = state.results ? state.results.filter(r => r && !r.isUploaded) : [];
  zipButton.disabled = unuploadedResults.length === 0;
}

function updateUploadAllButtonState() {
  const unuploadedResults = state.results ? state.results.filter(r => r && !r.isUploaded && !r.isUploading) : [];
  uploadAllButton.disabled = unuploadedResults.length === 0;
}

uploadAllButton.addEventListener("click", async () => {
  const targets = state.results ? state.results.filter(r => r && r.isUploaded !== true && r.isUploading !== true) : [];
  console.log("Upload all triggered. Targets found:", targets.length);
  
  if (targets.length === 0) {
    statusText.textContent = "アップロード対象がありません";
    statusText.className = "error";
    return;
  }

  const validTargets = targets.filter(r => r.size <= KV_MAX_SIZE);
  const oversizedCount = targets.length - validTargets.length;

  if (validTargets.length === 0) {
    statusText.textContent = "25MB超のファイルのみのため一括アップロードできません";
    statusText.className = "error";
    return;
  }

  setUiLock(true);
  statusText.className = "saving";
  progressBar.value = 0;

  try {
    for (let i = 0; i < validTargets.length; i++) {
      const result = validTargets[i];
      console.log(`Batch uploading [${i + 1}/${validTargets.length}]:`, result.name);
      statusText.textContent = `一括アップロード中 (${i + 1}/${validTargets.length})`;
      
      await uploadImage(result);
      
      progressBar.value = Math.round(((i + 1) / validTargets.length) * 100);
    }
    
    progressBar.value = 100;
    if (oversizedCount > 0) {
      statusText.textContent = `一括アップロード完了 (※${oversizedCount}件は25MB超のためスキップ)`;
    } else {
      statusText.textContent = "一括アップロード完了";
    }
    console.log("Batch upload successfully finished!");
  } catch (error) {
    console.error("Batch upload failed:", error);
    statusText.textContent = `一括アップロード失敗: ${error.message}`;
    statusText.className = "error";
  } finally {
    setUiLock(false);
    updateUploadAllButtonState();
  }
});

zipButton.addEventListener("click", async () => {
  zipButton.disabled = true;
  statusText.textContent = "ZIP作成中";
  statusText.className = "saving";

  try {
    const entries = [];
    for (const result of state.results) {
      if (result && !result.isUploaded) {
        entries.push({
          name: result.relativePath || result.name,
          data: new Uint8Array(await result.blob.arrayBuffer()),
        });
      }
    }

    const zipBlob = createZip(entries);
    const url = URL.createObjectURL(zipBlob);
    downloadUrl(url, "file-publisher-results.zip");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusText.textContent = "ZIP完了";
  } catch (error) {
    console.error(error);
    statusText.textContent = "ZIP失敗";
    statusText.className = "error";
  } finally {
    updateZipButtonState();
  }
});

resultList.addEventListener("change", (event) => {
  const target = event.target;
  if (target.classList.contains("result-persist-checkbox")) {
    const resultId = target.closest(".result-item")?.dataset.id;
    if (!resultId) return;
    const result = state.results.find(r => r.id === resultId);
    if (result) {
      result.isPersisted = target.checked;
    }
  }
});

resultList.addEventListener("click", async (event) => {
  const target = event.target;
  const resultId = target.closest(".result-item")?.dataset.id;
  if (!resultId) return;

  const result = state.results.find(r => r.id === resultId);
  if (!result) return;

  // アップロードボタン
  if (target.classList.contains("upload-button")) {
    await uploadImage(result);
  }

  // コピーボタン
  if (target.classList.contains("copy-button")) {
    await copyToClipboard(result.proxyUrl, target);
  }



  // 削除ボタン
  if (target.classList.contains("delete-button")) {
    await deleteImage(result);
  }
});

reloadR2FilesButton.addEventListener("click", fetchAndRenderR2Files);

r2FileList.addEventListener("change", async (event) => {
  const target = event.target;
  
  if (target.classList.contains("r2-file-checkbox")) {
    updateDeleteSelectedButtonState();
    return;
  }

  if (target.classList.contains("storage-persist-checkbox")) {
    const from = target.dataset.filename;
    if (!from) return;

    const isChecked = target.checked;
    let to = "";
    if (isChecked) {
      to = from.startsWith("keep/") ? from : `keep/${from}`;
    } else {
      to = from.replace(/^keep\//, "");
    }

    if (from === to) return;

    try {
      target.disabled = true;
      const response = await fetch(getApiUrl("/api/rename"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ from, to }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
        throw new Error(errorData.error);
      }

      await fetchAndRenderR2Files();
    } catch (error) {
      alert(`永続化設定の切り替えに失敗しました: ${error.message}`);
      console.error("Persist toggle failed:", error);
      target.checked = !isChecked;
      target.disabled = false;
    }
  }
});

function updateDeleteSelectedButtonState() {
  const checkedBoxes = r2FileList.querySelectorAll(".r2-file-checkbox:checked");
  const count = checkedBoxes.length;
  if (count > 0) {
    deleteSelectedR2FilesButton.style.display = "inline-block";
    deleteSelectedR2FilesButton.textContent = `選択削除 (${count})`;
  } else {
    deleteSelectedR2FilesButton.style.display = "none";
  }
}

deleteSelectedR2FilesButton.addEventListener("click", async () => {
  const checkedBoxes = r2FileList.querySelectorAll(".r2-file-checkbox:checked");
  const count = checkedBoxes.length;
  if (count === 0) return;

  if (!confirm(`選択された ${count} 件の一時共有ファイルを完全消滅（削除）しますか？`)) return;

  deleteSelectedR2FilesButton.disabled = true;
  deleteSelectedR2FilesButton.textContent = "削除中...";

  try {
    const deletePromises = Array.from(checkedBoxes).map(async (checkbox) => {
      const key = checkbox.dataset.key;
      const response = await fetch(getApiUrl("/api/temp-delete"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "削除エラー" }));
        throw new Error(errorData.error || "削除エラー");
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    alert(`削除中にエラーが発生しました: ${error.message}`);
    console.error("Bulk delete failed:", error);
  } finally {
    deleteSelectedR2FilesButton.disabled = false;
    deleteSelectedR2FilesButton.style.display = "none";
    await fetchAndRenderR2Files();
  }
});

r2FileList.addEventListener("change", (event) => {
  if (event.target.classList.contains("r2-file-checkbox")) {
    updateDeleteSelectedButtonState();
  }
});

r2FileList.addEventListener("click", async (event) => {
  // 編集（✏️）ボタン
  if (event.target.classList.contains("rename-trigger-button")) {
    const filename = event.target.dataset.filename;
    const titleRow = event.target.closest(".item-title-row");
    if (!titleRow || !filename) return;

    const isKeep = filename.startsWith("keep/");
    const cleanName = isKeep ? filename.substring(5) : filename;
    const dotIndex = cleanName.lastIndexOf(".");
    const baseName = dotIndex > 0 ? cleanName.slice(0, dotIndex) : cleanName;
    const ext = dotIndex > 0 ? cleanName.slice(dotIndex + 1) : "";

    titleRow.innerHTML = `
      <div class="rename-form" style="width: 100%; display: flex; align-items: center; gap: 4px;">
        ${isKeep ? '<span style="font-size: 12px; color: var(--text-muted); font-family: monospace; white-space: nowrap;">keep/</span>' : ''}
        <input type="text" class="rename-input" value="${escapeHtml(baseName)}" data-oldname="${escapeHtml(filename)}" data-ext="${escapeHtml(ext)}" data-keep="${isKeep}" style="flex: 1; padding: 4px 6px; font-size: 12px;">
        ${ext ? `<span style="font-size: 12px; color: var(--text-muted); font-family: monospace; white-space: nowrap;">.${escapeHtml(ext)}</span>` : ''}
        <div class="rename-button-group">
          <button type="button" class="rename-btn save">保存</button>
          <button type="button" class="rename-btn cancel">戻る</button>
        </div>
      </div>
    `;
    return;
  }

  // リネームキャンセル（戻る）ボタン
  if (event.target.classList.contains("cancel") && event.target.classList.contains("rename-btn")) {
    await fetchAndRenderR2Files();
    return;
  }

  // リネーム保存ボタン
  if (event.target.classList.contains("save") && event.target.classList.contains("rename-btn")) {
    const form = event.target.closest(".rename-form");
    const input = form?.querySelector(".rename-input");
    if (!input) return;

    const newBase = input.value.trim();
    if (!newBase) {
      alert("ファイル名を入力してください。");
      return;
    }

    const from = input.dataset.oldname;
    const ext = input.dataset.ext;
    const isKeep = input.dataset.keep === "true";

    // 新ファイル名の再結合
    let to = newBase;
    if (ext) {
      to = `${to}.${ext}`;
    }
    if (isKeep) {
      to = `keep/${to}`;
    }

    if (from === to) {
      await fetchAndRenderR2Files();
      return;
    }

    try {
      input.disabled = true;
      event.target.disabled = true;
      event.target.textContent = "...";

      const response = await fetch(getApiUrl("/api/rename"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ from, to }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
        throw new Error(errorData.error);
      }

      await fetchAndRenderR2Files();
    } catch (error) {
      alert(`名前変更に失敗しました: ${error.message}`);
      console.error("Rename failed:", error);
      await fetchAndRenderR2Files();
    }
    return;
  }

  if (event.target.classList.contains("copy-button") || event.target.classList.contains("dev-copy-button")) {
    const url = event.target.dataset.url;
    if (url) {
      await copyToClipboard(url, event.target);
    }
  }
  if (event.target.classList.contains("temp-extend-btn")) {
    const key = event.target.dataset.key;
    if (!key) return;

    try {
      event.target.disabled = true;
      event.target.textContent = "延長中...";
      const res = await fetch(getApiUrl("/api/temp-extend"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        await fetchAndRenderR2Files();
      } else {
        const errData = await res.json().catch(() => ({ error: "サーバーエラー" }));
        alert("延長に失敗しました: " + errData.error);
        event.target.disabled = false;
        event.target.textContent = "+24h 延長";
      }
    } catch (err) {
      alert("エラー: " + err.message);
      event.target.disabled = false;
      event.target.textContent = "+24h 延長";
    }
  }

  if (event.target.classList.contains("temp-delete-btn")) {
    const key = event.target.dataset.key;
    if (!key) return;
    if (!confirm("この一時共有ファイルを待機時間前に即座に完全消滅させますか？")) return;

    try {
      event.target.disabled = true;
      event.target.textContent = "消滅中...";
      const res = await fetch(getApiUrl("/api/temp-delete"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        await fetchAndRenderR2Files();
      } else {
        alert("削除に失敗しました");
        event.target.disabled = false;
        event.target.textContent = "今すぐ消滅";
      }
    } catch (err) {
      alert("エラー: " + err.message);
    }
  }

  if (event.target.classList.contains("delete-button")) {
    const filename = event.target.dataset.filename;
    if (!filename) return;

    if (!confirm(`R2から「${filename}」を完全に削除しますか？`)) return;
    
    try {
      const response = await fetch(getApiUrl("/api/temp-delete"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key: filename }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
        throw new Error(errorData.error);
      }
      await fetchAndRenderR2Files(); // 成功したらリストを再読み込み
    } catch (error) {
      alert(`削除に失敗しました: ${error.message}`);
      console.error("R2 Delete failed:", error);
    }
  }
});

fileList.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-button")) {
    const index = Number(event.target.dataset.index);
    if (!isNaN(index) && index >= 0 && index < state.files.length) {
      // 対応するファイルを配列から削除
      state.files.splice(index, 1);
      render(); // UIを再描画
    }
  }
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

function render() {
  const cfOk = (localStorage.getItem("cfEndpoint") || "") !== "" && (localStorage.getItem("cfToken") || "") !== "";
  fileCount.textContent = `${state.files.length}件`;
  convertButton.disabled = state.files.length === 0;
  convertUploadButton.disabled = state.files.length === 0 || !cfOk;
  convertDownloadButton.disabled = state.files.length === 0;
  uploadOriginalButton.disabled = state.files.length === 0 || !cfOk;
  uploadRenameButton.disabled = state.files.length === 0 || !cfOk;
  updateZipButtonState();
  updateUploadAllButtonState();
  progressBar.value = state.results.length && state.files.length
    ? Math.round((state.results.length / state.files.length) * 100)
    : 0;
  statusText.textContent = state.files.length ? "準備完了" : "待機中";
  statusText.className = "";

  fileList.innerHTML = "";
  // 既存のObject URLをすべて破棄
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

  renderResults();
}

function renderResults() {
  resultList.innerHTML = "";
  if (!state.results.length) {
    const empty = document.createElement("div");
    empty.className = "item-meta";
    empty.textContent = "変換後のファイルがここに表示されます。";
    resultList.append(empty);
    return;
  }

  state.results.forEach(result => {
    if (!result) return; // 並列処理中のプレースホルダーをスキップ
    const saved = result.originalSize - result.size;
    const savedRate = result.originalSize ? Math.round((saved / result.originalSize) * 100) : 0;
    const item = document.createElement("article");
    item.className = "result-item";
    item.dataset.id = result.id; // 各結果を一意に識別するID

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
      metaHtml = `${formatBytes(result.originalSize)} -> ${formatBytes(result.size)} · ${savedRate}%`;
    }

    let warnNotice = "";
    if (result.size > KV_MAX_SIZE) {
      warnNotice = `<div style="font-size: 11px; color: var(--danger); font-weight: bold; margin-top: 2px;">⚠️ 25MB超のためアップロード不可（上限: 25MB）</div>`;
    } else if (result.size >= KV_WARN_SIZE) {
      warnNotice = `<div style="font-size: 11px; color: #ffb74d; margin-top: 2px;">⚠️ 15MB以上の大容量ファイルのため配信に影響が出る場合があります</div>`;
    }

    const targetUrl = result.isUploaded && result.proxyUrl ? result.proxyUrl : result.url;

    item.innerHTML = `
      <a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="画像を表示">
        ${thumbHtml}
      </a>
      <div>
        <div class="item-name">${escapeHtml(result.name)}</div>
        <div class="item-meta">${metaHtml}</div>
        ${warnNotice}
      </div>
      <div class="result-actions">
        ${createActionHtml(result)}
      </div>
    `;
    resultList.append(item);
  });
  updateZipButtonState();
  updateUploadAllButtonState();
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
    mimeType: formatSelect.value,
    quality: Number(qualityRange.value) / 100,
    name: createOutputName(file.name, formatSelect.value, index),
  };

  let finalBlob = null;
  let finalUrl = null;

  if (window.Worker) {
    try {
      const result = await convertImageInWorker(file, options);
      finalBlob = result.blob;
    } catch (error) {
      console.warn("Worker conversion failed. Falling back to main thread.", error);
    }
  }

  if (!finalBlob) {
    const image = await loadImage(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const context = canvas.getContext("2d", { alpha: true });
    context.drawImage(image, 0, 0);

    finalBlob = await canvasToBlob(canvas, options.mimeType, options.quality);
  }

  finalUrl = URL.createObjectURL(finalBlob);
  const outputRelativePath = file.relativePath 
    ? createOutputName(file.relativePath, formatSelect.value, index) 
    : options.name;

  return {
    id: crypto.randomUUID(),
    name: options.name,
    relativePath: outputRelativePath,
    url: finalUrl,
    previewUrl: finalUrl,
    blob: finalBlob,
    size: finalBlob.size,
    originalSize: file.size,
  };
}

function convertImageInWorker(file, options) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (event) => {
      worker.terminate();
      if (!event.data.ok) {
        reject(new Error(event.data.error || "変換に失敗しました"));
        return;
      }

      const blob = event.data.blob;
      const url = URL.createObjectURL(blob);
      resolve({
        id: crypto.randomUUID(),
        name: event.data.name,
        url,
        previewUrl: event.data.previewable ? url : "",
        blob,
        size: blob.size,
        originalSize: file.size,
      });
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Worker error"));
    };
    worker.postMessage({ file, options });
  });
}

function createActionHtml(result) {
  if (result.error) {
    return `<span class="error-text">失敗</span>`;
  }
  const downloadBtn = `<a href="${result.url}" download="${escapeHtml(result.name.split('/').pop())}" class="ghost-button">ダウンロード</a>`;

  if (result.isUploading) {
    return `<span class="status-text">アップロード中...</span> ${downloadBtn}`;
  }
  if (result.isUploaded) {
    return `
      <input type="text" class="url-output" value="${escapeHtml(result.proxyUrl)}" readonly>
      ${downloadBtn}
      <button type="button" class="ghost-button copy-button">コピー</button>
      <button type="button" class="ghost-button delete-button danger-button" aria-label="削除">&times;</button>
    `;
  }
  return `
    ${downloadBtn}
    <button type="button" class="primary-button upload-button">アップロード</button>
  `;
}

async function uploadImage(result) {
  if (result.size > KV_MAX_SIZE) {
    result.error = "25MBを超えるファイルはKVに保存できません（上限: 25MB）";
    renderResults();
    return;
  }

  result.isUploading = true;
  renderResults();

  try {
    const ttl = tempTtlSelect ? (tempTtlSelect.value || "259200") : "259200";
    const uploadUrl = getApiUrl(`/temp-upload?filename=${encodeURIComponent(result.name)}&ttl=${ttl}`);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: getRequestHeaders({
        "Content-Type": result.blob ? (result.blob.type || "application/octet-stream") : "application/octet-stream",
      }),
      body: result.blob,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
      throw new Error(errorData.error);
    }

    const data = await response.json();
    result.isUploaded = true;
    result.proxyUrl = getPublicUrl(data.url);
    result.storageKey = decodeURIComponent(new URL(data.url).pathname.slice(1));
    result.catboxFilename = result.proxyUrl;

    // テキスト作成支援パレットに挿入
    paletteFiles.unshift({ key: result.storageKey, url: result.proxyUrl });
    renderUrlPalette();

  } catch (error) {
    result.error = error.message;
    console.error("Upload failed:", error);
  } finally {
    result.isUploading = false;
    renderResults();
  }
}

async function uploadFile(file, customFilename = null) {
  if (file.size > KV_MAX_SIZE) {
    throw new Error(`'${file.name}' は25MBを超えているためアップロードできません（上限: 25MB）`);
  }

  const newFilename = customFilename || file.name;

  const ttl = tempTtlSelect ? (tempTtlSelect.value || "259200") : "259200";
  const uploadUrl = getApiUrl(`/temp-upload?filename=${encodeURIComponent(newFilename)}&ttl=${ttl}`);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: getRequestHeaders({
      "Content-Type": file.type || "application/octet-stream",
    }),
    body: file,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
    throw new Error(`'${file.name}' のアップロードに失敗: ${errorData.error}`);
  }

  const data = await response.json();
  paletteFiles.unshift({ key: decodeURIComponent(new URL(data.url).pathname.slice(1)), url: getPublicUrl(data.url) });
  renderUrlPalette();

  return data;
}

async function deleteImage(result) {
  if (!confirm(`「${result.name}」をサーバーから削除しますか？`)) return;

  try {
    const response = await fetch(getApiUrl("/api/temp-delete"), {
      method: "POST",
      headers: getRequestHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ key: result.storageKey }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
      throw new Error(errorData.error);
    }

    // UIから結果を削除
    const index = state.results.findIndex(r => r.id === result.id);
    if (index > -1) {
      URL.revokeObjectURL(result.url);
      if (result.previewUrl) URL.revokeObjectURL(result.previewUrl);
      state.results.splice(index, 1);
    }

  } catch (error) {
    result.error = error.message;
    alert(`削除に失敗しました: ${error.message}`);
    console.error("Delete failed:", error);
  } finally {
    renderResults();
    fetchAndRenderR2Files(); // ローカルの結果を削除した後、R2リストも更新
    updateZipButtonState();
    updateUploadAllButtonState();
  }
}

async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "コピー完了!";
    setTimeout(() => { button.textContent = "コピー"; }, 2000);
  } catch (err) {
    console.error("Copy failed: ", err);
    button.textContent = "失敗";
  }
}

async function loadSharedConfig() {
  try {
    const response = await fetch(getApiUrl("/api/config"), {
      headers: getRequestHeaders(),
    });
    if (response.ok) {
      const config = await response.json();
      if (config.storageLimit !== undefined) {
        const limitVal = String(config.storageLimit);
        if (storageLimitRange) storageLimitRange.value = limitVal;
        updateLimitOutput(limitVal);
        localStorage.setItem("storageLimit", limitVal);
      }
      if (config.autoCleanEnabled !== undefined) {
        if (autoCleanEnabled) autoCleanEnabled.checked = config.autoCleanEnabled;
        if (autoCleanDaysContainer) autoCleanDaysContainer.style.display = config.autoCleanEnabled ? "block" : "none";
        localStorage.setItem("autoCleanEnabled", config.autoCleanEnabled);
      }
      if (config.autoCleanDays !== undefined) {
        const daysVal = String(config.autoCleanDays);
        if (autoCleanDays) autoCleanDays.value = daysVal;
        if (autoCleanDaysOutput) autoCleanDaysOutput.textContent = `${daysVal}日`;
        localStorage.setItem("autoCleanDays", daysVal);
      }
    }
  } catch (error) {
    console.error("Failed to load shared config:", error);
  }
}

// 自動お掃除を実行する関数
async function runAutoCleanup() {
  if (hasCleanedOnStart || !autoCleanEnabled?.checked) return;
  hasCleanedOnStart = true;

  const banner = document.createElement("div");
  banner.className = "cleanup-status-banner";
  banner.innerHTML = `<span>🧹 古いファイルの自動お掃除を実行中...</span>`;
  
  r2FileList.parentNode.insertBefore(banner, r2FileList);

  try {
    const response = await fetch(getApiUrl("/api/cleanup"), {
      method: "POST",
      headers: getRequestHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.deletedFiles && data.deletedFiles.length > 0) {
        console.log(`Auto cleaned ${data.deletedFiles.length} files:`, data.deletedFiles);
        banner.innerHTML = `<span>✨ 自動お掃除が完了しました（${data.deletedFiles.length}件の古いファイルを削除）</span>`;
        setTimeout(() => {
          banner.remove();
          fetchAndRenderR2Files();
        }, 3000);
        return;
      }
    }
  } catch (error) {
    console.error("Auto cleanup failed:", error);
  }
  banner.remove();
}

function formatRemainingTime(seconds) {
  if (seconds <= 0) return "消滅済み (期限切れ)";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `あと ${days}日 ${hours}時間 で自動消滅`;
  } else if (hours > 0) {
    return `あと ${hours}時間 ${minutes}分 で自動消滅`;
  } else {
    return `あと ${minutes}分 で自動消滅`;
  }
}

async function fetchAndRenderR2Files() {
  if (!r2FileList) return;
  r2FileList.innerHTML = `<span class="status-text" style="padding: 18px;">読み込み中...</span>`;
  try {
    const response = await fetch(getApiUrl("/api/temp-files"), {
      headers: getRequestHeaders(),
    });
    if (!response.ok) {
      throw new Error("一時共有ファイル一覧の取得に失敗しました。");
    }
    const { files } = await response.json();

    // 5ch投稿用パレットの更新
    const publicFiles = files ? files.map(f => ({ ...f, url: getPublicUrl(f.url) })) : [];
    paletteFiles = publicFiles.map(f => ({ key: f.key, url: f.url }));
    renderUrlPalette();

    // 全体の合計容量の進捗メーター更新
    const totalSize = publicFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    state.r2TotalSize = totalSize;
    updateStorageUsageUI();

    r2FileList.innerHTML = "";
    if (!publicFiles.length) {
      r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px;">現在KVに保存中の一時ファイルはありません。</span>`;
      return;
    }

    // 残り時間が長い順
    publicFiles.sort((a, b) => b.remaining - a.remaining);

    publicFiles.forEach(file => {
      const item = document.createElement("article");
      item.className = "result-item";

      const ext = file.filename ? file.filename.split('.').pop().toLowerCase() : "";
      let thumbHtml = "";
      if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
        thumbHtml = `<img class="thumb" alt="" src="${escapeHtml(file.url)}" loading="lazy">`;
      } else if (["mp4", "webm", "mov"].includes(ext)) {
        thumbHtml = `<video class="thumb" src="${escapeHtml(file.url)}" preload="metadata" muted playsinline></video>`;
      } else {
        thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext.toUpperCase() || "FILE")}</div>`;
      }

      const timeText = formatRemainingTime(file.remaining);
      let sizeWarnNotice = "";
      if (file.size >= KV_WARN_SIZE) {
        sizeWarnNotice = `<div style="font-size: 11px; color: #ffb74d; margin-top: 2px;">⚠️ 15MB以上の大容量ファイルのため正常に配信・再キャッシュされない可能性があります</div>`;
      }

      item.innerHTML = `
        <input type="checkbox" class="r2-file-checkbox" data-key="${escapeHtml(file.key)}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); align-self: center; margin-right: 4px;">
        <a href="${escapeHtml(file.url)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="画像を表示">
          ${thumbHtml}
        </a>
        <div style="flex: 1; min-width: 0;">
          <div class="item-name" style="font-weight: 600; word-break: break-all;">${escapeHtml(file.filename)}</div>
          <div class="item-meta" style="color: #ff9800; font-weight: bold; margin-top: 4px; font-size: 13px;">⏳ ${escapeHtml(timeText)}</div>
          ${sizeWarnNotice}
        </div>
        <div class="result-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="ghost-button copy-button" data-url="${escapeHtml(file.url)}">URLコピー</button>
          <button type="button" class="ghost-button temp-extend-btn" data-key="${escapeHtml(file.key)}" title="有効期限を24時間延長します">+24h 延長</button>
          <button type="button" class="ghost-button danger-button temp-delete-btn" data-key="${escapeHtml(file.key)}">今すぐ消滅</button>
        </div>
      `;
      r2FileList.append(item);
    });

  } catch (error) {
    console.error("Fetch temp files UI error:", error);
    r2FileList.innerHTML = `<span class="item-meta error" style="padding: 18px;">一覧の取得に失敗しました: ${escapeHtml(error.message)}</span>`;
  }
}

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

render();
fetchAndRenderR2Files(); // 初期読み込み
