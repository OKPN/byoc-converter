import QRCode from "qrcode";

const KV_MAX_SIZE = 25 * 1024 * 1024;  // 25MB
const KV_WARN_SIZE = 15 * 1024 * 1024; // 15MB

// --- 多言語 (i18n) 辞書 ---
const i18nDict = {
  ja: {
    siteTitle: "BYOC Converter",
    eyebrow: "ブラウザ内のみで画像をセキュアに変換処理!",
    whatIsSiteSummary: "❓ どのようなサイト？",
    whatIsSiteBody: "外部サーバを一切介さず、お使いのブラウザ内だけで画像をセキュアに変換・軽量化・Exif削除できるローカル専用ツールです。<br><span style=\"display: inline-block; margin-top: 6px; font-size: 12px; color: #a5b4fc;\">※（おまけ機能）ご自身のCloudflare情報を入力することで（これもブラウザ内のみにセキュア保存）、ファイルのアップロード・共有も可能です。</span>",
    inputFiles: "入力ファイル",
    addFolder: "フォルダを追加",
    dropText: "画像やフォルダをここにドロップ",
    orClick: "またはクリックしてファイルを選択",
    settings: "設定",
    outputFormat: "出力形式",
    quality: "品質",
    renameRule: "リネーム規則",
    originalName: "元ファイル名",
    seq01: "連番 (01)",
    seq001: "連番 (001)",
    random6: "ランダム (6文字)",
    retentionPeriod: "保存期間 (自動消滅タイマー)",
    ttl1d: "1日間 (24時間後消滅)",
    ttl3d: "3日間 (72時間後消滅)",
    ttl7d: "7日間 (168時間後消滅)",
    cfTitle: "☁️ Cloudflare 情報",
    cfEndpointLabel: "Worker エンドポイント URL",
    cfEndpointSub: "自分の Cloudflare Worker の URL",
    cfTokenLabel: "API トークン",
    cfTokenSub: "Worker の認証トークン（不正利用防止）",
    cfDomainLabel: "直リンク配信ドメイン",
    cfDomainSub: "未入力の場合は Worker URL をそのまま使用",
    btnSave: "保存する",
    btnShareQr: "📱 スマホへ共有",
    btnClear: "クリア",
    kvLimitNotice: "Cloudflare KVの仕様上、アップロードは1ファイルにつき<strong style=\"color: #fff;\">最大25MBまで</strong>となります。<br><span style=\"opacity: 0.9;\">画像を変換した場合、メタデータの保持に関しては保証できません。</span>",
    btnConvertUpload: "変換してアップロード",
    btnUploadRename: "リネームだけしてアップロード",
    btnUploadOriginal: "そのままアップロード",
    btnConvertOnly: "変換だけする",
    btnConvertDownload: "変換してダウンロード",
    outputFiles: "出力ファイル",
    statusWaiting: "待機中",
    btnZipDownload: "ZIPで一括ダウンロード",
    btnUploadAll: "すべてアップロード",
    textComposerHeading: "💬 テキスト作成支援",
    r2Heading: "⚡ 一時共有（KVキャッシュ）内のファイル",
    usagePrefix: "使用量",
    limitPrefix: "上限",
    btnReload: "更新",
    btnBatchExtend: "選択を一括+24h延長",
    btnBatchDelete: "選択削除",
    copyUrl: "URLコピー",
    extend24h: "+24h 延長",
    deleteNow: "今すぐ消滅",
    copied: "コピー完了!",
    failed: "失敗",
    extended: "延長中...",
    deleting: "消滅中...",
    btnPromptCopy: "文章をコピーする",
    promptSelect: "-- 定型文を選択 --",
    promptNew: "🆕 新しい定型文を追加...",
    promptSave: "定型文を保存",
    promptDelete: "削除",
  },
  en: {
    siteTitle: "BYOC Converter",
    eyebrow: "Secure client-side image processing right inside your browser!",
    whatIsSiteSummary: "❓ What is this site?",
    whatIsSiteBody: "A privacy-first local tool to convert, compress, and strip Exif metadata directly inside your browser with zero server uploads.<br><span style=\"display: inline-block; margin-top: 6px; font-size: 12px; color: #a5b4fc;\">*(Optional) Input your personal Cloudflare credentials (stored safely in local browser storage) to upload & share files.</span>",
    inputFiles: "Input Files",
    addFolder: "Add Folder",
    dropText: "Drop images or folders here",
    orClick: "or click to select files",
    settings: "Settings",
    outputFormat: "Output Format",
    quality: "Quality",
    renameRule: "Rename Rule",
    originalName: "Original Name",
    seq01: "Seq (01)",
    seq001: "Seq (001)",
    random6: "Random (6 chars)",
    retentionPeriod: "Retention Period (Auto-Expiration)",
    ttl1d: "1 Day (expires in 24h)",
    ttl3d: "3 Days (expires in 72h)",
    ttl7d: "7 Days (expires in 168h)",
    cfTitle: "☁️ Cloudflare Credentials",
    cfEndpointLabel: "Worker Endpoint URL",
    cfEndpointSub: "URL of your Cloudflare Worker",
    cfTokenLabel: "API Token",
    cfTokenSub: "Worker authentication bearer token",
    cfDomainLabel: "Custom Direct Domain",
    cfDomainSub: "Uses Worker URL if left empty",
    btnSave: "Save Settings",
    btnShareQr: "📱 Share to Phone",
    btnClear: "Clear",
    kvLimitNotice: "Due to Cloudflare KV specs, max file size is <strong style=\"color: #fff;\">25MB per file</strong>.<br><span style=\"opacity: 0.9;\">Metadata retention is not guaranteed when converted.</span>",
    btnConvertUpload: "Convert & Upload",
    btnUploadRename: "Rename & Upload Only",
    btnUploadOriginal: "Upload As-Is",
    btnConvertOnly: "Convert Only",
    btnConvertDownload: "Convert & Download",
    outputFiles: "Output Files",
    statusWaiting: "Idle",
    btnZipDownload: "Batch ZIP Download",
    btnUploadAll: "Upload All",
    textComposerHeading: "💬 Text Composer Helper",
    r2Heading: "⚡ Temporary Files (KV Cache)",
    usagePrefix: "Storage Used",
    limitPrefix: "Limit",
    btnReload: "Refresh",
    btnBatchExtend: "Batch Extend +24h",
    btnBatchDelete: "Batch Delete",
    copyUrl: "Copy URL",
    extend24h: "+24h Extend",
    deleteNow: "Delete Now",
    copied: "Copied!",
    failed: "Failed",
    extended: "Extending...",
    deleting: "Deleting...",
    btnPromptCopy: "Copy Text",
    promptSelect: "-- Select Template --",
    promptNew: "🆕 Add New Template...",
    promptSave: "Save Template",
    promptDelete: "Delete",
  }
};

// --- アプリケーション状態 ---
const state = {
  files: [],
  results: [],
  r2TotalSize: 0,
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

// ☁️ Cloudflare 情報フォーム要素
const cfEndpoint = document.querySelector("#cfEndpoint");
const cfToken = document.querySelector("#cfToken");
const cfDirectDomain = document.querySelector("#cfDirectDomain");
const cfStatus = document.querySelector("#cfStatus");
const cfSettingsAccordion = document.querySelector("#cfSettingsAccordion");
const cfSaveButton = document.querySelector("#cfSaveButton");
const cfClearButton = document.querySelector("#cfClearButton");
const cfShareQrButton = document.querySelector("#cfShareQrButton");

// QRコードモーダル要素
const qrModal = document.querySelector("#qrModal");
const qrCanvas = document.querySelector("#qrCanvas");
const closeQrModalButton = document.querySelector("#closeQrModalButton");

// 言語切替セレクト
const langSelect = document.querySelector("#langSelect");

function getAppLanguage() {
  const saved = localStorage.getItem("appLang");
  if (saved && (saved === "ja" || saved === "en")) return saved;
  return navigator.language.startsWith("ja") ? "ja" : "en";
}

function setAppLanguage(lang) {
  localStorage.setItem("appLang", lang);
  if (langSelect) langSelect.value = lang;
  updateUiTranslations(lang);
}

function updateUiTranslations(lang) {
  const dict = i18nDict[lang] || i18nDict.ja;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = dict[key];
      } else if (el.dataset.i18nHtml === "true") {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });
  render();
}

langSelect?.addEventListener("change", (e) => {
  setAppLanguage(e.target.value);
});

// アクションボタン
const convertButton = document.querySelector("#convertButton");
const convertUploadButton = document.querySelector("#convertUploadButton");
const uploadRenameButton = document.querySelector("#uploadRenameButton");
const uploadOriginalButton = document.querySelector("#uploadOriginalButton");
const convertDownloadButton = document.querySelector("#convertDownloadButton");
const zipButton = document.querySelector("#zipButton");
const uploadAllButton = document.querySelector("#uploadAllButton");
const clearButton = document.querySelector("#clearButton");

// 設定要素
const progressBar = document.querySelector("#progressBar");
const qualityRange = document.querySelector("#qualityRange");
const qualityOutput = document.querySelector("#qualityOutput");
const formatSelect = document.querySelector("#formatSelect");
const renamePattern = document.querySelector("#renamePattern");
const clearRenamePattern = document.querySelector("#clearRenamePattern");
const tempTtlSelect = document.querySelector("#tempTtlSelect");

// KVキャッシュ一覧 & 容量メーター
const r2FileList = document.querySelector("#r2FileList");
const deleteSelectedR2FilesButton = document.querySelector("#deleteSelectedR2FilesButton");
const extendSelectedR2FilesButton = document.querySelector("#extendSelectedR2FilesButton");
const reloadR2FilesButton = document.querySelector("#reloadR2FilesButton");
const storageUsage = document.querySelector("#storageUsage");
const storageUsageBar = document.querySelector("#storageUsageBar");
const storageUsageText = document.querySelector("#storageUsageText");
const storageLimitRange = document.querySelector("#storageLimitRange");
const storageLimitOutput = document.querySelector("#storageLimitOutput");

// テキスト作成支援
const templateSelect = document.querySelector("#templateSelect");
const saveTemplateButton = document.querySelector("#saveTemplateButton");
const deleteTemplateButton = document.querySelector("#deleteTemplateButton");
const paletteList = document.querySelector("#paletteList");
const composerTextarea = document.querySelector("#composerTextarea");
const clearComposerButton = document.querySelector("#clearComposerButton");
const copyComposerTextButton = document.querySelector("#copyComposerTextButton");

let paletteFiles = []; // パレットに表示するKVファイル一覧をキャッシュ

const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/jxl": "jxl",
};

const defaultTemplates = {
  "morning": { name: "朝の挨拶", text: "おはよー！\n{url}" },
  "noon": { name: "昼の挨拶", text: "こんにちは！\n{url}" },
  "night": { name: "夜の挨拶", text: "おつかれさま！\n{url}" }
};

// --- 安全な動的接続ヘルパー（ハードコードなし・localStorageから取得） ---

function getApiUrl(path) {
  const endpoint = (localStorage.getItem("cfEndpoint") || "").replace(/\/$/, "");
  if (!endpoint) return path;
  const relativePath = path.startsWith("/") ? path : `/${path}`;
  return `${endpoint}${relativePath}`;
}

function buildPublicFileUrl(filenameOrUrl) {
  const directDomain = (localStorage.getItem("cfDirectDomain") || "").trim().replace(/\/$/, "");
  const endpoint = (localStorage.getItem("cfEndpoint") || "").trim().replace(/\/$/, "");
  const baseUrl = directDomain || endpoint;

  if (!filenameOrUrl) return baseUrl;

  let path = filenameOrUrl;
  if (typeof filenameOrUrl === "string" && (filenameOrUrl.startsWith("http://") || filenameOrUrl.startsWith("https://"))) {
    try {
      path = new URL(filenameOrUrl).pathname;
    } catch {
      path = filenameOrUrl;
    }
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${cleanPath}` : filenameOrUrl;
}

function getPublicUrl(workerUrl) {
  return buildPublicFileUrl(workerUrl);
}

function getRequestHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };
  const token = (localStorage.getItem("cfToken") || "").trim();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

function updateCfStatus() {
  const endpoint = (localStorage.getItem("cfEndpoint") || "").trim();
  const token    = (localStorage.getItem("cfToken") || "").trim();
  const isConfigured = endpoint !== "" && token !== "";

  if (cfStatus) {
    if (isConfigured) {
      cfStatus.innerHTML = `<span style="color: #4caf50;">✅ 設定済み: ${escapeHtml(endpoint)}</span>`;
    } else {
      cfStatus.innerHTML = `<span style="color: var(--danger);">⚠️ Worker URL と API トークンを入力して保存してください</span>`;
    }
  }

  const uploadButtons = [convertUploadButton, uploadRenameButton, uploadOriginalButton];
  if (!isConfigured) {
    uploadButtons.forEach(btn => { if (btn) btn.disabled = true; });
    if (cfSettingsAccordion && state.files.length === 0) cfSettingsAccordion.open = true;
  }
  return isConfigured;
}

// --- 設定の読み込みと初期化 ---

function loadSettings() {
  // Cloudflare 情報を localStorage から復元
  const savedEndpoint = localStorage.getItem("cfEndpoint") || "";
  const savedToken    = localStorage.getItem("cfToken")    || "";
  const savedDirect   = localStorage.getItem("cfDirectDomain") || "";

  if (cfEndpoint) cfEndpoint.value = savedEndpoint;
  if (cfToken)    cfToken.value    = savedToken;
  if (cfDirectDomain) cfDirectDomain.value = savedDirect;

  updateCfStatus();

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

  const savedLimit = localStorage.getItem("storageLimit") || "1000";
  if (storageLimitRange) storageLimitRange.value = savedLimit;
  updateLimitOutput(savedLimit);

  const savedTempTtl = localStorage.getItem("tempTtlSelect");
  if (savedTempTtl && tempTtlSelect) {
    tempTtlSelect.value = savedTempTtl;
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

function checkAndApplyHashSync() {
  try {
    const hash = window.location.hash || "";
    if (hash.startsWith("#sync=")) {
      const encoded = hash.substring(6);
      if (encoded) {
        const jsonStr = decodeURIComponent(atob(encoded));
        const payload = JSON.parse(jsonStr);

        if (payload && payload.e && payload.t) {
          localStorage.setItem("cfEndpoint", payload.e);
          localStorage.setItem("cfToken", payload.t);
          if (payload.d) {
            localStorage.setItem("cfDirectDomain", payload.d);
          } else {
            localStorage.removeItem("cfDirectDomain");
          }

          // 即座に URL から #sync=... を消去して痕跡を消す！
          history.replaceState(null, "", window.location.pathname + window.location.search);
        }
      }
    }
  } catch (err) {
    console.error("Failed to parse sync hash:", err);
  }
}

// 起動時の初期ロード & ハッシュ同期チェック & 多言語適用
checkAndApplyHashSync();
loadSettings();
setAppLanguage(getAppLanguage());
if (localStorage.getItem("cfEndpoint") && localStorage.getItem("cfToken")) {
  fetchAndRenderR2Files();
}

// --- ☁️ Cloudflare 情報のイベントハンドラ ---

let cfAutoFetchTimer = null;

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

  const isConfigured = updateCfStatus();
  render();

  // Worker URL と API トークンの両方が入力完了したら、400ms 後に自動で KV ファイル一覧を取得・更新
  if (cfAutoFetchTimer) clearTimeout(cfAutoFetchTimer);
  if (isConfigured) {
    cfAutoFetchTimer = setTimeout(() => {
      fetchAndRenderR2Files();
    }, 400);
  }
};

cfEndpoint?.addEventListener("input", saveCfSettingsAuto);
cfToken?.addEventListener("input", saveCfSettingsAuto);
cfDirectDomain?.addEventListener("input", saveCfSettingsAuto);

cfSaveButton?.addEventListener("click", () => {
  const endpoint = cfEndpoint?.value?.trim() || "";
  const token    = cfToken?.value?.trim()    || "";

  if (!endpoint || !token) {
    if (cfStatus) cfStatus.innerHTML = `<span style="color: var(--danger);">⚠️ Worker URL と API トークンは必須です</span>`;
    return;
  }

  saveCfSettingsAuto();
  if (cfSettingsAccordion) cfSettingsAccordion.open = false;
  fetchAndRenderR2Files();
});

cfClearButton?.addEventListener("click", () => {
  localStorage.removeItem("cfEndpoint");
  localStorage.removeItem("cfToken");
  localStorage.removeItem("cfDirectDomain");

  if (cfEndpoint) cfEndpoint.value = "";
  if (cfToken)    cfToken.value    = "";
  if (cfDirectDomain) cfDirectDomain.value = "";

  updateCfStatus();
  render();
  fetchAndRenderR2Files(); // クリア時も表示を更新
  if (cfSettingsAccordion) cfSettingsAccordion.open = true;
});

// --- 📱 可視光スキャン（QRコード）同期ハンドラ ---
cfShareQrButton?.addEventListener("click", async () => {
  const endpoint = (localStorage.getItem("cfEndpoint") || cfEndpoint?.value || "").trim();
  const token    = (localStorage.getItem("cfToken") || cfToken?.value || "").trim();
  const direct   = (localStorage.getItem("cfDirectDomain") || cfDirectDomain?.value || "").trim();

  if (!endpoint || !token) {
    alert("⚠️ Worker URL と API トークンを保存してから画面共有を押してください。");
    return;
  }

  try {
    const payload = { e: endpoint, t: token };
    if (direct) payload.d = direct;

    const jsonStr = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(jsonStr));

    const syncUrl = `${window.location.origin}${window.location.pathname}#sync=${encoded}`;

    if (qrCanvas) {
      await QRCode.toCanvas(qrCanvas, syncUrl, {
        width: 220,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      });
    }

    if (qrModal) qrModal.style.display = "grid";
  } catch (err) {
    console.error("QR Code generation error:", err);
    alert("QRコードの生成に失敗しました。");
  }
});

closeQrModalButton?.addEventListener("click", () => {
  if (qrModal) qrModal.style.display = "none";
});

qrModal?.addEventListener("click", (e) => {
  if (e.target === qrModal) {
    qrModal.style.display = "none";
  }
});

// --- UIイベントリスナー ---

qualityRange?.addEventListener("input", () => {
  if (qualityOutput) qualityOutput.textContent = qualityRange.value;
  localStorage.setItem("qualityRange", qualityRange.value);
});

formatSelect?.addEventListener("change", () => {
  localStorage.setItem("formatSelect", formatSelect.value);
});

tempTtlSelect?.addEventListener("change", () => {
  if (tempTtlSelect) {
    localStorage.setItem("tempTtlSelect", tempTtlSelect.value);
  }
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

storageLimitRange?.addEventListener("input", () => {
  const val = storageLimitRange.value;
  updateLimitOutput(val);
  localStorage.setItem("storageLimit", val);
  updateStorageUsageUI();
});

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
  const cfOk = updateCfStatus();
  if (fileInput) fileInput.disabled = locked;
  if (dropzone) dropzone.classList.toggle("is-disabled", locked);
  if (clearButton) clearButton.disabled = locked;
  if (convertButton) convertButton.disabled = locked || state.files.length === 0;
  if (convertUploadButton) convertUploadButton.disabled = locked || state.files.length === 0 || !cfOk;
  if (convertDownloadButton) convertDownloadButton.disabled = locked || state.files.length === 0;
  if (uploadOriginalButton) uploadOriginalButton.disabled = locked || state.files.length === 0 || !cfOk;
  if (uploadRenameButton) uploadRenameButton.disabled = locked || state.files.length === 0 || !cfOk;
  if (locked && uploadAllButton) uploadAllButton.disabled = true;
}

function render() {
  const cfOk = updateCfStatus();
  const hasFiles = state.files.length > 0;
  if (fileCount) fileCount.textContent = `${state.files.length}件`;

  if (convertButton) convertButton.disabled = !hasFiles;
  if (convertUploadButton) convertUploadButton.disabled = !hasFiles || !cfOk;
  if (convertDownloadButton) convertDownloadButton.disabled = !hasFiles;
  if (uploadOriginalButton) uploadOriginalButton.disabled = !hasFiles || !cfOk;
  if (uploadRenameButton) uploadRenameButton.disabled = !hasFiles || !cfOk;

  updateZipButtonState();
  updateUploadAllButtonState();

  if (progressBar) {
    progressBar.value = state.results.length && state.files.length
      ? Math.round((state.results.length / state.files.length) * 100)
      : 0;
  }
  if (statusText) {
    statusText.textContent = hasFiles ? "準備完了" : "待機中";
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
    item.dataset.id = result.id;

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

    let warnNotice = "";
    if (result.size > KV_MAX_SIZE) {
      warnNotice = `<div style="font-size: 11px; color: var(--danger); font-weight: bold; margin-top: 2px;">⚠️ 25MB超のためアップロード不可（上限: 25MB）</div>`;
    } else if (result.size >= KV_WARN_SIZE) {
      warnNotice = `<div style="font-size: 11px; color: #ffb74d; margin-top: 2px;">⚠️ 15MB以上の大容量ファイル</div>`;
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

function createActionHtml(result) {
  const downloadBtn = `<button type="button" class="secondary-button download-single-btn" data-url="${escapeHtml(result.url)}" data-name="${escapeHtml(result.name)}">ダウンロード</button>`;

  if (result.isUploading) {
    return `<span class="status-text saving">アップロード中...</span>`;
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

resultList?.addEventListener("click", async (event) => {
  const target = event.target;
  const resultId = target.closest(".result-item")?.dataset.id;
  if (!resultId) return;

  const result = state.results.find(r => r && r.id === resultId);
  if (!result) return;

  if (target.classList.contains("download-single-btn")) {
    const url = target.dataset.url;
    const name = target.dataset.name;
    if (url && name) downloadUrl(url, name);
  }

  if (target.classList.contains("upload-button")) {
    await uploadImage(result);
  }

  if (target.classList.contains("copy-button")) {
    const item = target.closest(".result-item");
    const inputUrl = item?.querySelector(".url-output")?.value;
    const urlToCopy = result.proxyUrl || inputUrl || target.dataset.url;
    await copyToClipboard(urlToCopy, target);
  }

  if (target.classList.contains("delete-button")) {
    await deleteImage(result);
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
    updateUploadAllButtonState();
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

// --- アップロード処理 (ユーザーのlocalStorageから動的に送信) ---

async function uploadImage(result) {
  if (!updateCfStatus()) {
    alert("Worker URL と API トークンを「☁️ Cloudflare 情報」に入力して保存してください。");
    return;
  }

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
      throw new Error(errorData.error || "アップロードエラー");
    }

    const data = await response.json();
    result.isUploaded = true;
    result.proxyUrl = getPublicUrl(data.url);
    result.storageKey = decodeURIComponent(new URL(data.url).pathname.slice(1));

    paletteFiles.unshift({ key: result.storageKey, url: result.proxyUrl });
    renderUrlPalette();

    await fetchAndRenderR2Files();

  } catch (error) {
    result.error = error.message;
    alert(`アップロード失敗: ${error.message}`);
    console.error("Upload failed:", error);
  } finally {
    result.isUploading = false;
    renderResults();
  }
}

async function uploadFile(file, customFilename = null) {
  if (!updateCfStatus()) {
    throw new Error("Worker URL と API トークンを設定してください");
  }

  if (file.size > KV_MAX_SIZE) {
    throw new Error(`'${file.name}' は25MBを超えているためアップロードできません`);
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
  const publicUrl = getPublicUrl(data.url);
  paletteFiles.unshift({ key: decodeURIComponent(new URL(data.url).pathname.slice(1)), url: publicUrl });
  renderUrlPalette();

  return data;
}

// ボタンイベントリスナー群

convertButton?.addEventListener("click", async () => {
  await runConversion();
});

convertUploadButton?.addEventListener("click", async () => {
  if (!state.files.length) return;
  const success = await runConversion();
  if (!success) return;

  const targets = state.results.filter(r => r && !r.isUploaded && !r.isUploading);
  if (targets.length === 0) return;

  setUiLock(true);
  if (statusText) {
    statusText.className = "saving";
    statusText.textContent = `アップロード中 (0/${targets.length})`;
  }
  if (progressBar) progressBar.value = 0;

  try {
    for (let i = 0; i < targets.length; i++) {
      const result = targets[i];
      if (statusText) statusText.textContent = `アップロード中 (${i + 1}/${targets.length})`;
      await uploadImage(result);
      if (progressBar) progressBar.value = Math.round(((i + 1) / targets.length) * 100);
    }
    if (statusText) statusText.textContent = "一括アップロード完了";
  } catch (error) {
    console.error("Upload failed:", error);
    if (statusText) {
      statusText.textContent = `アップロード失敗: ${error.message}`;
      statusText.className = "error";
    }
  } finally {
    setUiLock(false);
    updateUploadAllButtonState();
    await fetchAndRenderR2Files();
  }
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

uploadOriginalButton?.addEventListener("click", async () => {
  if (!state.files.length) return;
  setUiLock(true);
  if (statusText) {
    statusText.textContent = `アップロード中 (0/${state.files.length})`;
    statusText.className = "saving";
  }
  if (progressBar) progressBar.value = 0;

  try {
    let completedCount = 0;
    for (const file of state.files) {
      await uploadFile(file);
      completedCount++;
      if (statusText) statusText.textContent = `アップロード中 (${completedCount}/${state.files.length})`;
      if (progressBar) progressBar.value = Math.round((completedCount / state.files.length) * 100);
    }
    if (statusText) statusText.textContent = "そのままアップロード完了";
    state.files = [];
    render();
    await fetchAndRenderR2Files();
  } catch (error) {
    console.error(error);
    if (statusText) {
      statusText.textContent = error.message;
      statusText.className = "error";
    }
  } finally {
    setUiLock(false);
  }
});

uploadRenameButton?.addEventListener("click", async () => {
  if (!state.files.length) return;
  setUiLock(true);
  if (statusText) {
    statusText.textContent = `アップロード中 (0/${state.files.length})`;
    statusText.className = "saving";
  }
  if (progressBar) progressBar.value = 0;

  try {
    let completedCount = 0;
    for (let index = 0; index < state.files.length; index++) {
      const file = state.files[index];
      const newFilename = createOutputName(file.name, null, index);
      await uploadFile(file, newFilename);
      completedCount++;
      if (statusText) statusText.textContent = `アップロード中 (${completedCount}/${state.files.length})`;
      if (progressBar) progressBar.value = Math.round((completedCount / state.files.length) * 100);
    }
    if (statusText) statusText.textContent = "リネームアップロード完了";
    state.files = [];
    render();
    await fetchAndRenderR2Files();
  } catch (error) {
    console.error(error);
    if (statusText) {
      statusText.textContent = error.message;
      statusText.className = "error";
    }
  } finally {
    setUiLock(false);
  }
});

function updateZipButtonState() {
  if (zipButton) {
    const unuploaded = state.results ? state.results.filter(r => r && !r.isUploaded) : [];
    zipButton.disabled = unuploaded.length === 0;
  }
}

function updateUploadAllButtonState() {
  if (uploadAllButton) {
    const cfOk = updateCfStatus();
    const unuploaded = state.results ? state.results.filter(r => r && !r.isUploaded && !r.isUploading) : [];
    uploadAllButton.disabled = unuploaded.length === 0 || !cfOk;
  }
}

uploadAllButton?.addEventListener("click", async () => {
  const targets = state.results ? state.results.filter(r => r && !r.isUploaded && !r.isUploading) : [];
  if (targets.length === 0) return;

  const validTargets = targets.filter(r => r.size <= KV_MAX_SIZE);
  if (validTargets.length === 0) return;

  setUiLock(true);
  if (statusText) {
    statusText.className = "saving";
    statusText.textContent = `一括アップロード中 (0/${validTargets.length})`;
  }
  if (progressBar) progressBar.value = 0;

  try {
    for (let i = 0; i < validTargets.length; i++) {
      const result = validTargets[i];
      if (statusText) statusText.textContent = `一括アップロード中 (${i + 1}/${validTargets.length})`;
      await uploadImage(result);
      if (progressBar) progressBar.value = Math.round(((i + 1) / validTargets.length) * 100);
    }
    if (statusText) statusText.textContent = "一括アップロード完了";
  } catch (error) {
    console.error(error);
    if (statusText) {
      statusText.textContent = `一括アップロード失敗: ${error.message}`;
      statusText.className = "error";
    }
  } finally {
    setUiLock(false);
    updateUploadAllButtonState();
    await fetchAndRenderR2Files();
  }
});

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

// --- KV キャッシュ一覧 & パレット関数 ---

reloadR2FilesButton?.addEventListener("click", fetchAndRenderR2Files);

async function fetchAndRenderR2Files() {
  if (!r2FileList) return;
  const endpoint = (localStorage.getItem("cfEndpoint") || "").trim();
  const token    = (localStorage.getItem("cfToken") || "").trim();

  if (!endpoint || !token) {
    r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px; color: var(--muted);">「☁️ Cloudflare 情報」に Worker URL と API トークンを設定して保存すると、KV内の一覧が表示されます。</span>`;
    return;
  }

  r2FileList.innerHTML = `<span class="status-text" style="padding: 18px;">読み込み中...</span>`;
  try {
    const response = await fetch(getApiUrl("/api/temp-files"), {
      headers: getRequestHeaders(),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: `HTTP ${response.status} ${response.statusText}` }));
      throw new Error(errData.error || `HTTP ${response.status}`);
    }
    const { files } = await response.json();

    const publicFiles = files ? files.map(f => ({ ...f, url: buildPublicFileUrl(f.url || f.key || f.filename) })) : [];
    paletteFiles = publicFiles.map(f => ({ key: f.key, url: f.url }));
    renderUrlPalette();

    const totalSize = publicFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    state.r2TotalSize = totalSize;
    updateStorageUsageUI();

    r2FileList.innerHTML = "";
    if (!publicFiles.length) {
      r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px;">現在KVに保存中の一時ファイルはありません。</span>`;
      return;
    }

    publicFiles.sort((a, b) => b.remaining - a.remaining);

    publicFiles.forEach(file => {
      const item = document.createElement("article");
      item.className = "result-item";

      const ext = file.filename ? file.filename.split('.').pop().toLowerCase() : "";
      let thumbHtml = "";
      if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) {
        thumbHtml = `<img class="thumb" alt="" src="${escapeHtml(file.url)}" loading="lazy">`;
      } else if (["mp4", "webm", "ogv", "mov", "m4v"].includes(ext)) {
        thumbHtml = `<video class="thumb" src="${escapeHtml(file.url)}#t=0.5" preload="metadata" muted playsinline style="object-fit: cover; pointer-events: none;"></video>`;
      } else {
        thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext.toUpperCase() || "FILE")}</div>`;
      }

      const timeText = formatRemainingTime(file.remaining);

      item.innerHTML = `
        <input type="checkbox" class="r2-file-checkbox" data-key="${escapeHtml(file.key)}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); align-self: center; margin-right: 4px;">
        <a href="${escapeHtml(file.url)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="表示">
          ${thumbHtml}
        </a>
        <div style="flex: 1; min-width: 0;">
          <div class="item-name" style="font-weight: 600; word-break: break-all;">${escapeHtml(file.filename)}</div>
          <div class="item-meta" style="color: #ff9800; font-weight: bold; margin-top: 4px; font-size: 13px;">⏳ ${escapeHtml(timeText)}</div>
        </div>
        <div class="result-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="ghost-button copy-button" data-url="${escapeHtml(file.url)}">URLコピー</button>
          <button type="button" class="ghost-button temp-extend-btn" data-key="${escapeHtml(file.key)}" title="有効期限を24時間延長">+24h 延長</button>
          <button type="button" class="ghost-button danger-button temp-delete-btn" data-key="${escapeHtml(file.key)}">今すぐ消滅</button>
        </div>
      `;
      r2FileList.append(item);
    });

    updateSelectedR2ActionButtonsState();
  } catch (error) {
    console.error("Fetch temp files UI error:", error);
    r2FileList.innerHTML = `<span class="item-meta error" style="padding: 18px; color: var(--danger);">一覧の取得に失敗しました: ${escapeHtml(error.message)}</span>`;
    updateSelectedR2ActionButtonsState();
  }
}

function formatRemainingTime(seconds) {
  if (seconds <= 0) return "消滅済み (期限切れ)";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `あと ${days}日 ${hours}時間 で自動消滅`;
  if (hours > 0) return `あと ${hours}時間 ${minutes}分 で自動消滅`;
  return `あと ${minutes}分 で自動消滅`;
}

function renderUrlPalette() {
  if (!paletteList) return;
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
  if (!composerTextarea) return;
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

function updateSelectedR2ActionButtonsState() {
  if (!r2FileList) return;
  const checkedBoxes = r2FileList.querySelectorAll(".r2-file-checkbox:checked");
  const count = checkedBoxes.length;
  if (deleteSelectedR2FilesButton) {
    deleteSelectedR2FilesButton.style.display = count > 0 ? "inline-block" : "none";
    deleteSelectedR2FilesButton.textContent = `選択削除 (${count})`;
  }
  if (extendSelectedR2FilesButton) {
    extendSelectedR2FilesButton.style.display = count > 0 ? "inline-block" : "none";
    extendSelectedR2FilesButton.textContent = `選択を一括+24h延長 (${count})`;
  }
}

extendSelectedR2FilesButton?.addEventListener("click", async () => {
  if (!r2FileList || !extendSelectedR2FilesButton) return;
  const checkedBoxes = Array.from(r2FileList.querySelectorAll(".r2-file-checkbox:checked"));
  const count = checkedBoxes.length;
  if (count === 0) return;

  if (!confirm(`選択された ${count} 件のファイルを一括で +24時間 延長しますか？`)) return;

  extendSelectedR2FilesButton.disabled = true;
  extendSelectedR2FilesButton.textContent = "一括延長中...";

  try {
    const extendPromises = checkedBoxes.map(async (checkbox) => {
      const key = checkbox.dataset.key;
      return fetch(getApiUrl("/api/temp-extend"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
    });

    await Promise.all(extendPromises);
    await fetchAndRenderR2Files();
  } catch (error) {
    console.error("Batch extend error:", error);
    alert("一括延長処理中にエラーが発生しました。");
  } finally {
    if (extendSelectedR2FilesButton) extendSelectedR2FilesButton.disabled = false;
    updateSelectedR2ActionButtonsState();
  }
});

r2FileList?.addEventListener("change", (event) => {
  if (event.target.classList.contains("r2-file-checkbox")) {
    updateSelectedR2ActionButtonsState();
  }
});

r2FileList?.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("copy-button")) {
    const url = target.dataset.url || target.closest(".result-item")?.querySelector("a.thumb-link")?.href;
    if (url) await copyToClipboard(url, target);
  }

  if (target.classList.contains("temp-extend-btn")) {
    const key = target.dataset.key;
    if (!key) return;

    try {
      target.disabled = true;
      target.textContent = "延長中...";
      const res = await fetch(getApiUrl("/api/temp-extend"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        await fetchAndRenderR2Files();
      } else {
        alert("延長に失敗しました");
        target.disabled = false;
        target.textContent = "+24h 延長";
      }
    } catch (err) {
      alert("エラー: " + err.message);
      target.disabled = false;
      target.textContent = "+24h 延長";
    }
  }

  if (target.classList.contains("temp-delete-btn")) {
    const key = target.dataset.key;
    if (!key) return;
    if (!confirm("この一時共有ファイルを待機時間前に即座に完全消滅させますか？")) return;

    try {
      target.disabled = true;
      target.textContent = "消滅中...";
      const res = await fetch(getApiUrl("/api/temp-delete"), {
        method: "POST",
        headers: getRequestHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        await fetchAndRenderR2Files();
      } else {
        alert("削除に失敗しました");
        target.disabled = false;
        target.textContent = "今すぐ消滅";
      }
    } catch (err) {
      alert("エラー: " + err.message);
    }
  }
});

function updateDeleteSelectedButtonState() {
  if (!r2FileList || !deleteSelectedR2FilesButton) return;
  const checkedBoxes = r2FileList.querySelectorAll(".r2-file-checkbox:checked");
  const count = checkedBoxes.length;
  if (count > 0) {
    deleteSelectedR2FilesButton.style.display = "inline-block";
    deleteSelectedR2FilesButton.textContent = `選択削除 (${count})`;
  } else {
    deleteSelectedR2FilesButton.style.display = "none";
  }
}

deleteSelectedR2FilesButton?.addEventListener("click", async () => {
  if (!r2FileList || !deleteSelectedR2FilesButton) return;
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
        throw new Error("削除エラー");
      }
    });

    await Promise.all(deletePromises);
  } catch (error) {
    alert(`削除中にエラーが発生しました: ${error.message}`);
  } finally {
    deleteSelectedR2FilesButton.disabled = false;
    await fetchAndRenderR2Files();
    updateSelectedR2ActionButtonsState();
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

async function copyToClipboard(text, button) {
  if (!text) return;
  let success = false;

  // 1. モダン API (navigator.clipboard)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, trying fallback:", err);
    }
  }

  // 2. フォールバック (textarea + execCommand)
  if (!success) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      success = document.execCommand("copy");
      document.body.removeChild(textarea);
    } catch (err) {
      console.error("execCommand copy fallback failed:", err);
    }
  }

  if (button) {
    const originalText = button.textContent;
    if (success) {
      button.textContent = "コピー完了!";
      button.style.color = "#4caf50";
      setTimeout(() => {
        button.textContent = originalText;
        button.style.color = "";
      }, 2000);
    } else {
      button.textContent = "失敗";
      button.style.color = "var(--danger)";
      setTimeout(() => {
        button.textContent = originalText;
        button.style.color = "";
      }, 2000);
    }
  }
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
