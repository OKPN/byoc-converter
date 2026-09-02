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
    retentionPeriod: "保存期間",
    ttl1h: "1時間 (1時間後消滅)",
    ttl12h: "12時間 (12時間後消滅)",
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
    kvLimitNotice: "画像を変換した場合、メタデータの保持に関しては保証できません。Cloudflare KVの仕様上、アップロードは1ファイルにつき<strong style=\"color: #fff;\">最大25MBまで</strong>となります。",
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
    btnReload: "🔄 更新",
    btnBatchExtend: "選択を一括+24h延長",
    btnBatchDelete: "選択削除",
    copyUrl: "URLコピー",
    extend24h: "+24h 延長",
    deleteNow: "今すぐ消滅",
    sisterApp: "姉妹サービス: BYORR Converter ↗",
    copied: "コピー完了!",
    failed: "失敗",
    extended: "延長中...",
    deleting: "消滅中...",
    composerPlaceholder: "ここにチャット等に投稿する文章を書きます。上の画像をクリックしてURLを挿入したり、定型文をロードできます。",
    btnPromptCopy: "文章をコピーする",
    promptSelect: "-- 定型文を選択 --",
    promptNew: "🆕 新しい定型文を追加...",
    promptSave: "定型文を保存",
    promptDelete: "削除",
    btnSaveShort: "保存",
    btnCancelShort: "戻る",
    timeRemainingDays: "あと {d}日 {h}時間 で自動消滅",
    timeRemainingHours: "あと {h}時間 {m}分 で自動消滅",
    timeRemainingMinutes: "あと {m}分 で自動消滅",
    timeExpired: "消滅済み (期限切れ)",
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
    retentionPeriod: "Retention Period",
    ttl1h: "1 Hour (expires in 1h)",
    ttl12h: "12 Hours (expires in 12h)",
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
    kvLimitNotice: "Metadata retention is not guaranteed when converted. Due to Cloudflare KV specs, max file size is <strong style=\"color: #fff;\">25MB per file</strong>.",
    btnConvertUpload: "Convert & Upload",
    btnUploadRename: "Rename & Upload Only",
    btnUploadOriginal: "Upload As-Is",
    nonConverted: "Unconverted",
    rateReduced: "{rate}% reduced",
    rateIncreased: "{rate}% increased",
    rateUnchanged: "0% unchanged",
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
    btnReload: "🔄 Refresh",
    btnBatchExtend: "Batch Extend +24h",
    btnBatchDelete: "Batch Delete",
    copyUrl: "Copy URL",
    extend24h: "+24h Extend",
    deleteNow: "Delete Now",
    sisterApp: "Sister App: BYORR Converter ↗",
    copied: "Copied!",
    failed: "Failed",
    extended: "Extending...",
    deleting: "Deleting...",
    composerPlaceholder: "Write your message for chat or forums here. Click an image above to insert its URL or load a template.",
    btnPromptCopy: "Copy Text",
    promptSelect: "-- Select Template --",
    promptNew: "🆕 Add New Template...",
    promptSave: "Save Template",
    promptDelete: "Delete",
    btnSaveShort: "Save",
    btnCancelShort: "Cancel",
    timeRemainingDays: "Auto-expires in {d}d {h}h",
    timeRemainingHours: "Auto-expires in {h}h {m}m",
    timeRemainingMinutes: "Auto-expires in {m}m",
    timeExpired: "Expired",
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
const cfUploadToken = document.querySelector("#cfUploadToken");
const cfDirectDomain = document.querySelector("#cfDirectDomain");
const civitaiUsername = document.querySelector("#civitaiUsername");
const cfStatus = document.querySelector("#cfStatus");
const cfSettingsAccordion = document.querySelector("#cfSettingsAccordion");
const cfSaveButton = document.querySelector("#cfSaveButton");
const cfClearButton = document.querySelector("#cfClearButton");
const cfShareQrButton = document.querySelector("#cfShareQrButton");

// 🎨 Civitai ギャラリー要素
const civitaiPanel = document.querySelector("#civitaiPanel");
const civitaiGalleryList = document.querySelector("#civitaiGalleryList");
const reloadCivitaiButton = document.querySelector("#reloadCivitaiButton");
const civitaiProfileLink = document.querySelector("#civitaiProfileLink");

function openCivitaiIntent(mediaUrl, title = "") {
  if (!mediaUrl) return;
  const intentUrl = `https://civitai.com/intent/post?mediaUrl=${encodeURIComponent(mediaUrl)}${title ? `&title=${encodeURIComponent(title)}` : ""}`;
  window.open(intentUrl, "_blank", "noopener,noreferrer");
}

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
const enableConvertCheck = document.querySelector("#enableConvertCheck");
const enableRenameCheck = document.querySelector("#enableRenameCheck");
const enableZipCheck = document.querySelector("#enableZipCheck");
const convertSettingsArea = document.querySelector("#convertSettingsArea");
const renameSettingsArea = document.querySelector("#renameSettingsArea");
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
let civitaiPaletteFiles = []; // パレットに表示するCivitaiファイル一覧をキャッシュ

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

function extractStorageKey(rawUrl) {
  if (!rawUrl) return "";
  try {
    if (typeof rawUrl === "string" && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))) {
      return decodeURIComponent(new URL(rawUrl).pathname.replace(/^\//, ""));
    }
  } catch (e) {}
  return decodeURIComponent(String(rawUrl).replace(/^\//, ""));
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
  const uploadToken = (localStorage.getItem("cfUploadToken") || cfUploadToken?.value || "").trim();
  const isConfigured = endpoint !== "" && token !== "";

  if (cfStatus) {
    if (isConfigured) {
      cfStatus.innerHTML = `<span style="color: #4caf50;">✅ 設定済み: ${escapeHtml(endpoint)}</span>`;
    } else {
      cfStatus.innerHTML = `<span style="color: var(--danger);">⚠️ Worker URL と API トークンを入力して保存してください</span>`;
    }
  }

  const dedicatedUploadInput = document.querySelector("#dedicatedUploadApiUrl");
  if (dedicatedUploadInput) {
    const uploadApiUrl = endpoint ? `${endpoint.replace(/\/$/, "")}/api/upload` : "";
    dedicatedUploadInput.value = uploadApiUrl;
  }

  const uploadButtons = [convertUploadButton, uploadRenameButton, uploadOriginalButton];
  if (!isConfigured) {
    uploadButtons.forEach(btn => { if (btn) btn.disabled = true; });
  }
  return isConfigured;
}

function updateCivitaiStatus() {
  const username = (localStorage.getItem("civitaiUsername") || civitaiUsername?.value || "").trim();
  if (civitaiProfileLink) {
    civitaiProfileLink.href = username ? `https://civitai.com/user/${encodeURIComponent(username)}/images` : "https://civitai.com";
  }
  return username !== "";
}

async function fetchAndRenderCivitaiGallery() {
  const username = (localStorage.getItem("civitaiUsername") || civitaiUsername?.value || "").trim();
  if (!civitaiGalleryList) return;

  const lang = getAppLanguage();
  const dict = i18nDict[lang] || i18nDict.ja;

  if (!username) {
    civitaiGalleryList.innerHTML = `<span class="item-meta" style="padding: 18px; color: var(--muted); text-align: center; display: block;">Civitai ユーザー名を入力すると、ここに投稿済みの動画・画像一覧（永久直リンク）が表示されます。</span>`;
    return;
  }

  civitaiGalleryList.innerHTML = `<span class="status-text" style="padding: 18px;">Civitai からメディアを取得中 (${escapeHtml(username)})...</span>`;

  try {
    const res = await fetch(`https://civitai.com/api/v1/images?username=${encodeURIComponent(username)}&limit=50&sort=Newest&browsingLevel=31&nsfw=true`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    const items = data.items || [];

    civitaiPaletteFiles = items.map(item => {
      const isVideo = item.type === "video";
      const directUrl = item.url;
      const previewSrc = isVideo ? directUrl : (directUrl.includes("/original=true/") ? directUrl.replace("/original=true/", "/width=450/") : directUrl);
      return {
        key: `Civitai ID:${item.id}`,
        url: directUrl,
        previewUrl: previewSrc,
        isVideo,
        isCivitai: true,
      };
    });
    renderUrlPalette();

    civitaiGalleryList.innerHTML = "";
    if (items.length === 0) {
      civitaiGalleryList.innerHTML = `<span class="item-meta" style="padding: 18px;">Civitai に投稿されたメディアが見つかりませんでした。</span>`;
      return;
    }

    items.forEach(item => {
      const article = document.createElement("article");
      article.className = "result-item";

      const isVideo = item.type === "video";
      const directUrl = item.url;
      const civitaiPostPageUrl = `https://civitai.com/images/${item.id}`;

      let thumbHtml = "";
      if (isVideo) {
        thumbHtml = `<video class="thumb" src="${escapeHtml(directUrl)}" preload="metadata" muted playsinline style="object-fit: cover; pointer-events: none;"></video>`;
      } else {
        const previewSrc = directUrl.includes("/original=true/") ? directUrl.replace("/original=true/", "/width=450/") : directUrl;
        thumbHtml = `<img class="thumb" alt="" src="${escapeHtml(previewSrc)}" loading="lazy">`;
      }

      const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "";
      const dimensions = item.width && item.height ? `${item.width}×${item.height}` : "";

      article.innerHTML = `
        <a href="${escapeHtml(directUrl)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="直リンクを表示">
          ${thumbHtml}
        </a>
        <div class="item-info-container" style="flex: 1; min-width: 0;">
          <div class="item-name-row" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="item-name" style="font-weight: 600; font-size: 12px; font-family: monospace;">ID: ${escapeHtml(String(item.id))}</span>
            <span class="format-badge" style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8;">${isVideo ? "🎬 VIDEO" : "🖼️ IMAGE"}</span>
            ${item.nsfwLevel && item.nsfwLevel !== "None" ? `<span style="font-size: 10px; padding: 1px 5px; border-radius: 4px; background: rgba(244, 63, 94, 0.15); color: #f43f5e; font-weight: bold;">${escapeHtml(item.nsfwLevel)}</span>` : ""}
            ${dimensions ? `<span style="color: #64748b; font-size: 11px;">${escapeHtml(dimensions)}</span>` : ""}
          </div>
          <div class="item-meta" style="color: var(--muted); margin-top: 4px; font-size: 11px;">
            投稿日: ${escapeHtml(dateStr)} · <a href="${escapeHtml(civitaiPostPageUrl)}" target="_blank" rel="noopener noreferrer" style="color: #818cf8; text-decoration: none;">Civitai 投稿ページ ↗</a>
          </div>
        </div>
        <div class="result-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="ghost-button civitai-copy-btn" data-url="${escapeHtml(directUrl)}">${escapeHtml(dict.copyUrl || "URLコピー")}</button>
          <a href="${escapeHtml(civitaiPostPageUrl)}" target="_blank" rel="noopener noreferrer" class="ghost-button" style="font-size: 11px; padding: 4px 8px; text-decoration: none; color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); display: inline-flex; align-items: center; justify-content: center;" title="Civitai で投稿の編集・削除を行う">🗑️ 削除/確認 ↗</a>
        </div>
      `;

      civitaiGalleryList.append(article);
    });
  } catch (err) {
    console.error("Civitai gallery fetch error:", err);
    civitaiGalleryList.innerHTML = `<span class="item-meta error" style="padding: 18px; color: var(--danger);">Civitai ギャラリーの取得に失敗しました: ${escapeHtml(err.message)}</span>`;
  }
}

// --- 設定の読み込みと初期化 ---

function loadSettings() {
  // Cloudflare 情報を localStorage から復元
  const savedEndpoint    = localStorage.getItem("cfEndpoint") || "";
  const savedToken       = localStorage.getItem("cfToken")    || "";
  const savedUploadToken = localStorage.getItem("cfUploadToken") || "";
  const savedDirect      = localStorage.getItem("cfDirectDomain") || "";
  const savedCivitaiUser = localStorage.getItem("civitaiUsername") || "";

  if (cfEndpoint)    cfEndpoint.value    = savedEndpoint;
  if (cfToken)       cfToken.value       = savedToken;
  if (cfUploadToken) cfUploadToken.value = savedUploadToken;
  if (cfDirectDomain) cfDirectDomain.value = savedDirect;
  if (civitaiUsername) civitaiUsername.value = savedCivitaiUser;

  updateCfStatus();
  updateCivitaiStatus();

  const savedEnableConvert = localStorage.getItem("enableConvert");
  if (savedEnableConvert !== null && enableConvertCheck) {
    enableConvertCheck.checked = savedEnableConvert === "true";
  }
  if (convertSettingsArea && enableConvertCheck) {
    convertSettingsArea.classList.toggle("is-disabled-area", !enableConvertCheck.checked);
  }

  const savedEnableRename = localStorage.getItem("enableRename");
  if (savedEnableRename !== null && enableRenameCheck) {
    enableRenameCheck.checked = savedEnableRename === "true";
  }
  if (renameSettingsArea && enableRenameCheck) {
    renameSettingsArea.classList.toggle("is-disabled-area", !enableRenameCheck.checked);
  }

  const savedEnableZip = localStorage.getItem("enableZip");
  if (savedEnableZip !== null && enableZipCheck) {
    enableZipCheck.checked = savedEnableZip === "true";
  }

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
  const lang = getAppLanguage();
  const dict = i18nDict[lang] || i18nDict.ja;
  let savedTemplates = {};
  try {
    savedTemplates = JSON.parse(localStorage.getItem("composerTemplates") || "{}");
  } catch (e) {
    savedTemplates = {};
  }
  
  const templates = { ...defaultTemplates, ...savedTemplates };
  if (!templateSelect) return;
  
  templateSelect.innerHTML = `<option value="">${escapeHtml(dict.promptSelect)}</option>`;
  for (const [key, item] of Object.entries(templates)) {
    const opt = document.createElement("option");
    opt.value = key;
    opt.dataset.text = item.text;
    opt.textContent = item.name;
    templateSelect.append(opt);
  }

  const optCustom = document.createElement("option");
  optCustom.value = "__new__";
  optCustom.textContent = dict.promptNew;
  templateSelect.append(optCustom);

  if (selectedValue) {
    templateSelect.value = selectedValue;
  }
}

// --- 🔐 PINコードによる暗号化/復号化ヘルパー ---
function encryptPayloadWithPin(payloadObj, pin) {
  const jsonStr = JSON.stringify(payloadObj);
  let result = "";
  for (let i = 0; i < jsonStr.length; i++) {
    const charCode = jsonStr.charCodeAt(i) ^ pin.charCodeAt(i % pin.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(encodeURIComponent(result));
}

function decryptPayloadWithPin(encodedStr, pin) {
  try {
    const raw = decodeURIComponent(atob(encodedStr));
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ pin.charCodeAt(i % pin.length);
      result += String.fromCharCode(charCode);
    }
    return JSON.parse(result);
  } catch {
    return null;
  }
}

function generateRandom6DigitPin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// PINコード付き暗号化バックアップURLの自動発行
async function generatePinBackupUrl() {
  const endpoint = (localStorage.getItem("cfEndpoint") || cfEndpoint?.value || "").trim();
  const token    = (localStorage.getItem("cfToken") || cfToken?.value || "").trim();
  const direct   = (localStorage.getItem("cfDirectDomain") || cfDirectDomain?.value || "").trim();

  if (!endpoint || !token) {
    alert("⚠️ Worker URL と API トークンを入力して保存してから発行してください");
    return;
  }

  const autoPin = generateRandom6DigitPin();
  const payload = {
    e: endpoint,
    t: token,
    d: direct,
  };

  const encrypted = encryptPayloadWithPin(payload, autoPin);
  const backupUrl = `${window.location.origin}${window.location.pathname}#enc=${encrypted}`;

  try {
    await navigator.clipboard.writeText(backupUrl);
  } catch (err) {
    console.error("Clipboard copy error:", err);
  }

  const pinDisplayModal = document.querySelector("#pinDisplayModal");
  const generatedPinText = document.querySelector("#generatedPinText");
  const backupUrlTextarea = document.querySelector("#backupUrlTextarea");

  if (generatedPinText) generatedPinText.textContent = autoPin;
  if (backupUrlTextarea) backupUrlTextarea.value = backupUrl;
  if (pinDisplayModal) pinDisplayModal.style.display = "grid";
}

let pendingEncryptedHash = "";

function checkAndApplyHashSync() {
  try {
    const hash = window.location.hash || "";

    // 暗号化バックアップURLの復元検知
    if (hash.startsWith("#enc=")) {
      pendingEncryptedHash = hash.replace("#enc=", "");
      const pinModal = document.querySelector("#pinModal");
      const pinInput = document.querySelector("#pinInput");
      const pinErrorNotice = document.querySelector("#pinErrorNotice");
      if (pinInput) pinInput.value = "";
      if (pinErrorNotice) pinErrorNotice.textContent = "";
      if (pinModal) pinModal.style.display = "grid";
      return;
    }

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

          if (cfEndpoint) cfEndpoint.value = payload.e;
          if (cfToken) cfToken.value = payload.t;
          if (cfDirectDomain) cfDirectDomain.value = payload.d || "";

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
fetchAndRenderCivitaiGallery();

// --- ☁️ Cloudflare 情報のイベントハンドラ ---

let cfAutoFetchTimer = null;

const saveCfSettingsAuto = () => {
  const endpoint    = cfEndpoint?.value?.trim() || "";
  const token       = cfToken?.value?.trim()    || "";
  const uploadToken = cfUploadToken?.value?.trim() || "";
  const direct      = cfDirectDomain?.value?.trim() || "";

  if (endpoint) {
    localStorage.setItem("cfEndpoint", endpoint);
  }
  if (token) {
    localStorage.setItem("cfToken", token);
  }
  if (uploadToken) {
    localStorage.setItem("cfUploadToken", uploadToken);
  } else {
    localStorage.removeItem("cfUploadToken");
  }
  if (direct) {
    localStorage.setItem("cfDirectDomain", direct);
  }

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
cfUploadToken?.addEventListener("input", saveCfSettingsAuto);
cfDirectDomain?.addEventListener("input", saveCfSettingsAuto);

// 🎨 Civitai ユーザー名の独立イベントリスナー (インライン入力時に自動保存 & ギャラリー更新)
let civitaiFetchTimer = null;
civitaiUsername?.addEventListener("input", () => {
  const cUser = civitaiUsername?.value?.trim() || "";
  if (cUser) {
    localStorage.setItem("civitaiUsername", cUser);
  } else {
    localStorage.removeItem("civitaiUsername");
  }
  updateCivitaiStatus();

  if (civitaiFetchTimer) clearTimeout(civitaiFetchTimer);
  civitaiFetchTimer = setTimeout(() => {
    fetchAndRenderCivitaiGallery();
  }, 400);
});

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
  localStorage.removeItem("cfUploadToken");
  localStorage.removeItem("cfDirectDomain");

  if (cfEndpoint)    cfEndpoint.value    = "";
  if (cfToken)       cfToken.value       = "";
  if (cfUploadToken) cfUploadToken.value = "";
  if (cfDirectDomain) cfDirectDomain.value = "";

  updateCfStatus();
  render();
  fetchAndRenderR2Files(); // クリア時も表示を更新
  if (cfSettingsAccordion) cfSettingsAccordion.open = true;
});

const copyUploadApiUrlBtn = document.querySelector("#copyUploadApiUrlBtn");
const copyCurlCmdBtn = document.querySelector("#copyCurlCmdBtn");

copyUploadApiUrlBtn?.addEventListener("click", () => {
  const dedicatedUploadInput = document.querySelector("#dedicatedUploadApiUrl");
  if (!dedicatedUploadInput || !dedicatedUploadInput.value) {
    alert("⚠️ Worker エンドポイント URL を設定してください。");
    return;
  }
  copyToClipboard(dedicatedUploadInput.value);
  alert("📋 投稿 API エンドポイント URL をコピーしました！");
});

copyCurlCmdBtn?.addEventListener("click", () => {
  const dedicatedUploadInput = document.querySelector("#dedicatedUploadApiUrl");
  const uploadToken = (localStorage.getItem("cfUploadToken") || cfUploadToken?.value || "").trim();
  const adminToken = (localStorage.getItem("cfToken") || cfToken?.value || "").trim();
  const token = uploadToken || adminToken || "YOUR_UPLOAD_TOKEN";

  if (!dedicatedUploadInput || !dedicatedUploadInput.value) {
    alert("⚠️ Worker エンドポイント URL を設定してください。");
    return;
  }
  const curlCmd = `curl -X POST "${dedicatedUploadInput.value}" \\
  -H "Authorization: Bearer ${token}" \\
  -F "file=@/path/to/image.jpg"`;
  copyToClipboard(curlCmd);
  alert("💻 curl コマンド例をコピーしました！");
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

enableConvertCheck?.addEventListener("change", () => {
  const isChecked = enableConvertCheck.checked;
  localStorage.setItem("enableConvert", String(isChecked));
  if (convertSettingsArea) {
    convertSettingsArea.classList.toggle("is-disabled-area", !isChecked);
  }
  render();
  updateRenamePreview();
});

enableRenameCheck?.addEventListener("change", () => {
  const isChecked = enableRenameCheck.checked;
  localStorage.setItem("enableRename", String(isChecked));
  if (renameSettingsArea) {
    renameSettingsArea.classList.toggle("is-disabled-area", !isChecked);
  }
  render();
  updateRenamePreview();
});

enableZipCheck?.addEventListener("change", () => {
  const isChecked = enableZipCheck.checked;
  localStorage.setItem("enableZip", String(isChecked));
});

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
  updateRenamePreview();
});

clearRenamePattern?.addEventListener("click", () => {
  if (renamePattern) {
    renamePattern.value = "";
    renamePattern.focus();
    localStorage.setItem("renamePattern", "");
    updateRenamePreview();
  }
});

formatSelect?.addEventListener("change", () => {
  updateRenamePreview();
});

document.querySelector(".pattern-helpers")?.addEventListener("click", (event) => {
  const target = event.target;
  if (target.classList.contains("tag-button")) {
    const insertText = target.dataset.insert;
    if (!insertText || !renamePattern) return;

    const start = renamePattern.selectionStart ?? renamePattern.value.length;
    const end = renamePattern.selectionEnd ?? renamePattern.value.length;
    const text = renamePattern.value;

    const newText = text.substring(0, start) + insertText + text.substring(end);
    renamePattern.value = newText;

    renamePattern.focus();
    const newPos = start + insertText.length;
    renamePattern.setSelectionRange(newPos, newPos);

    localStorage.setItem("renamePattern", renamePattern.value.trim());
    updateRenamePreview();
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
  const hasFiles = state.files.length > 0;
  const isConvertOn = enableConvertCheck?.checked ?? true;
  const isRenameOn = enableRenameCheck?.checked ?? true;
  const canProcessLocal = isConvertOn || isRenameOn;

  if (fileInput) fileInput.disabled = locked;
  if (dropzone) dropzone.classList.toggle("is-disabled", locked);
  if (clearButton) clearButton.disabled = locked;
  if (convertButton) convertButton.disabled = locked || !hasFiles || !canProcessLocal;
  if (convertDownloadButton) convertDownloadButton.disabled = locked || !hasFiles || !canProcessLocal;
  if (convertUploadButton) convertUploadButton.disabled = locked || !hasFiles || !cfOk;
  if (locked && uploadAllButton) uploadAllButton.disabled = true;
}

function updateRenamePreview() {
  const previewText = document.querySelector("#renamePreviewText");
  if (!previewText) return;

  const firstFile = state.files[0];
  const firstExt = firstFile ? (firstFile.name.split('.').pop() || "") : "";
  const isFirstImage = firstFile
    ? (firstFile.type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp"].includes(firstExt.toLowerCase()))
    : true;

  const isRenameOn = enableRenameCheck?.checked ?? true;
  const isConvertOn = enableConvertCheck?.checked ?? true;

  // 画像以外（MP3等）なら変換設定に関わらず元拡張子を維持
  const ext = (isConvertOn && isFirstImage)
    ? (extensions[formatSelect?.value || "image/webp"] || "webp")
    : (firstExt || "ext");

  const dummyName = firstFile ? firstFile.name.replace(/\.[^.]+$/, "") : "sample";

  if (!isRenameOn) {
    previewText.textContent = `${dummyName}.${ext}`;
    return;
  }

  const rawPattern = renamePattern?.value;
  const pattern = (rawPattern !== undefined && rawPattern !== "") ? rawPattern : "{name}";
  
  let previewName = pattern.replaceAll("{name}", dummyName);

  previewName = previewName.replace(/\{rand[ao]m(?::(\d+))?\}/g, (match, digits) => {
    const len = digits ? parseInt(digits, 10) : 6;
    return "a8Kx21".slice(0, Math.min(len, 6)).padEnd(len, "x");
  });

  previewName = previewName.replace(/\{num(?::(\d+))?\}/g, (match, digits) => {
    const targetLength = digits ? parseInt(digits, 10) : 1;
    return "1".padStart(targetLength, "0");
  });

  previewName = previewName.replace(/[\\/:*?"<>|]/g, "-");
  previewText.textContent = `${previewName}.${ext}`;
}

function render() {
  const cfOk = updateCfStatus();
  const hasFiles = state.files.length > 0;
  if (fileCount) fileCount.textContent = `${state.files.length}件`;

  const isConvertOn = enableConvertCheck?.checked ?? true;
  const isRenameOn = enableRenameCheck?.checked ?? true;
  const canProcessLocal = isConvertOn || isRenameOn;

  if (convertDownloadButton) convertDownloadButton.disabled = !hasFiles || !canProcessLocal;
  if (convertUploadButton) convertUploadButton.disabled = !hasFiles || !cfOk;

  if (dropzone) {
    dropzone.classList.toggle("has-files", hasFiles);
  }

  updateRenamePreview();

  if (fileList) {
    fileList.innerHTML = "";
    const lang = getAppLanguage();
    const dict = i18nDict[lang] || i18nDict.ja;

    state.files.forEach((file, index) => {
      const result = state.results[index];
      const item = document.createElement("article");
      item.className = "file-item unified-file-card";
      if (result) item.dataset.id = result.id;
      
      let thumbHtml = "";
      const currentName = result ? result.name : file.name;
      const ext = currentName.split('.').pop().toLowerCase();
      const isVideo = (file.type && file.type.startsWith("video/")) || ["mp4", "webm", "ogv", "mov", "m4v"].includes(ext);

      if (result && result.previewUrl) {
        thumbHtml = `<img class="thumb" alt="" src="${result.previewUrl}">`;
      } else if (file.type.startsWith("image/")) {
        thumbHtml = `<img class="thumb" alt="" src="${URL.createObjectURL(file)}">`;
      } else if (isVideo) {
        const videoSrc = result && result.proxyUrl ? result.proxyUrl : URL.createObjectURL(file);
        thumbHtml = `<video class="thumb" src="${videoSrc}#t=0.5" preload="metadata" muted playsinline style="object-fit: cover; pointer-events: none;"></video>`;
      } else {
        thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext.toUpperCase())}</div>`;
      }

      let metaHtml = "";
      let warnNotice = "";

      if (result) {
        const saved = result.originalSize - result.size;
        const savedRate = result.originalSize ? Math.round((saved / result.originalSize) * 100) : 0;

        if (result.isNonImage) {
          metaHtml = `${formatBytes(result.size)} · ${escapeHtml(dict.nonConverted)}`;
        } else {
          let rateText = "";
          if (savedRate > 0) {
            const template = dict.rateReduced || "{rate}% 削減";
            rateText = `<span style="color: #4caf50; font-weight: bold;">${escapeHtml(template.replace("{rate}", String(savedRate)))}</span>`;
          } else if (savedRate < 0) {
            const absRate = Math.abs(savedRate);
            const template = dict.rateIncreased || "{rate}% 増加";
            rateText = `<span style="color: #ff5252; font-weight: bold;">${escapeHtml(template.replace("{rate}", String(absRate)))}</span>`;
          } else {
            rateText = `<span style="color: var(--muted);">${escapeHtml(dict.rateUnchanged || "0% 変化なし")}</span>`;
          }
          metaHtml = `${formatBytes(result.originalSize)} ➔ <strong style="color: #fff;">${formatBytes(result.size)}</strong> (${rateText})`;
        }

        if (result.size > KV_MAX_SIZE) {
          warnNotice = `<div style="font-size: 11px; color: var(--danger); font-weight: bold; margin-top: 2px;">⚠️ 25MB超のためアップロード不可</div>`;
        }
      } else {
        metaHtml = `${formatBytes(file.size)} · <span style="color: var(--muted);">待機中</span>`;
      }

      const targetUrl = result ? (result.isUploaded && result.proxyUrl ? result.proxyUrl : result.url) : null;
      const thumbWrapper = targetUrl
        ? `<a href="${escapeHtml(targetUrl)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="表示">${thumbHtml}</a>`
        : thumbHtml;

      item.innerHTML = `
        ${thumbWrapper}
        <div class="item-info-col" style="flex: 1; min-width: 0;">
          <div class="item-name" style="font-weight: 600; font-size: 13px;">${escapeHtml(currentName)}</div>
          <div class="item-meta" style="font-size: 11px; margin-top: 2px;">${metaHtml}</div>
          ${warnNotice}
        </div>
        <div class="item-actions-col" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
          ${createCardActionHtml(file, result, index)}
          <button type="button" class="ghost-button delete-button danger-button" data-index="${index}" aria-label="削除" title="一覧から削除" style="min-width: 28px; height: 28px; padding: 0 6px; font-size: 14px; line-height: 1;">&times;</button>
        </div>
      `;
      fileList.append(item);
    });
  }
}

function renderResults() {
  render();
}

function createCardActionHtml(file, result, index) {
  const lang = getAppLanguage();
  const dict = i18nDict[lang] || i18nDict.ja;

  const currentName = result ? result.name : file.name;
  const ext = currentName.split('.').pop().toLowerCase();
  const isCivitaiSupported = ["jpg", "jpeg", "png", "webp", "mp4", "webm"].includes(ext);

  const isConvertOn = enableConvertCheck?.checked ?? true;
  const isRenameOn = enableRenameCheck?.checked ?? true;
  const cfOk = updateCfStatus();
  const currentSize = result ? result.size : file.size;
  const isOverKvLimit = currentSize > KV_MAX_SIZE;
  const isCivitaiValid = isCivitaiSupported && cfOk && !isOverKvLimit;

  const civitaiBtnDisabled = !isCivitaiValid ? "disabled" : "";
  let civitaiBtnTitle = "リネームを無視して変換・一時共有し、Civitaiの投稿画面を開く";
  if (!cfOk) {
    civitaiBtnTitle = "Cloudflare未設定のためCivitai自動連携は利用できません（Worker URLとトークンを設定してください）";
  } else if (!isCivitaiSupported) {
    civitaiBtnTitle = "Civitai非対応フォーマット（画像: JPG/PNG/WebP, 動画: MP4/WebM のみ）";
  } else if (isOverKvLimit) {
    civitaiBtnTitle = "25MB超のため一時共有不可（上限: 25MB）";
  }

  const civitaiBtnStyle = isCivitaiValid
    ? "color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); font-size: 11px; padding: 0 8px; height: 28px;"
    : "opacity: 0.35; font-size: 11px; padding: 0 8px; height: 28px; cursor: not-allowed;";

  const dlBtnDisabled = (!canProcessLocal && !result) ? "disabled" : "";
  const dlBtnTitle = (!canProcessLocal && !result)
    ? "変換・リネームが両方オフのためダウンロード無効"
    : "ダウンロード";

  const upBtnDisabled = (isOverKvLimit || !cfOk) ? "disabled" : "";
  let upBtnTitle = "このファイルだけ変換してCloudflareへアップロード";
  if (!cfOk) {
    upBtnTitle = "Cloudflare未設定のためアップロード不可";
  } else if (isOverKvLimit) {
    upBtnTitle = "25MB超のためCloudflare KVへアップロード不可（上限: 25MB）";
  }
  const upBtnStyle = (!isOverKvLimit && cfOk)
    ? "font-size: 11px; padding: 0 8px; height: 28px;"
    : "opacity: 0.35; font-size: 11px; padding: 0 8px; height: 28px; cursor: not-allowed;";

  if (result && result.isUploading) {
    return `<span class="status-text saving" style="font-size: 11px;">アップロード中...</span>`;
  }

  if (result && result.isUploaded) {
    return `
      <input type="text" class="url-output" value="${escapeHtml(result.proxyUrl)}" readonly style="width: 140px; font-size: 11px; height: 28px; padding: 0 6px;">
      <button type="button" class="ghost-button copy-button" style="font-size: 11px; padding: 0 8px; height: 28px;">${escapeHtml(dict.copyUrl)}</button>
      <button type="button" class="ghost-button download-single-btn" data-index="${index}" style="font-size: 11px; padding: 0 8px; height: 28px;" title="${dlBtnTitle}" ${dlBtnDisabled}>📥 DL</button>
      <button type="button" class="ghost-button civitai-post-btn" style="${civitaiBtnStyle}" data-index="${index}" title="${civitaiBtnTitle}" ${civitaiBtnDisabled}>🎨 Civitai</button>
    `;
  }

  // 待機中または変換完了（未アップロード）時
  return `
    <button type="button" class="ghost-button download-single-btn" data-index="${index}" style="font-size: 11px; padding: 0 8px; height: 28px;" title="${dlBtnTitle}" ${dlBtnDisabled}>📥 DL</button>
    <button type="button" class="ghost-button upload-single-btn" data-index="${index}" style="${upBtnStyle}" title="${upBtnTitle}" ${upBtnDisabled}>☁️ UP</button>
    <button type="button" class="ghost-button civitai-post-btn" style="${civitaiBtnStyle}" data-index="${index}" title="${civitaiBtnTitle}" ${civitaiBtnDisabled}>🎨 Civitai</button>
  `;
}

fileList?.addEventListener("click", async (event) => {
  const target = event.target;
  const card = target.closest(".unified-file-card");
  if (!card) return;

  const index = Number(target.dataset.index);

  // 1. 削除ボタン
  if (target.classList.contains("delete-button")) {
    if (!isNaN(index) && index >= 0 && index < state.files.length) {
      const removedResult = state.results[index];
      if (removedResult) {
        if (removedResult.url) URL.revokeObjectURL(removedResult.url);
        if (removedResult.previewUrl) URL.revokeObjectURL(removedResult.previewUrl);
      }
      state.files.splice(index, 1);
      state.results.splice(index, 1);
      render();
    }
    return;
  }

  // 2. 単体ダウンロード
  if (target.classList.contains("download-single-btn")) {
    if (isNaN(index) || index < 0 || index >= state.files.length) return;
    const file = state.files[index];
    let result = state.results[index];

    target.disabled = true;
    target.textContent = "...";
    try {
      if (!result) {
        result = await convertImage(file, index);
        state.results[index] = result;
      }
      downloadUrl(result.url, result.name);
    } catch (e) {
      console.error(e);
      alert("ダウンロードに失敗しました: " + e.message);
    } finally {
      target.disabled = false;
      target.textContent = "📥 DL";
      render();
    }
    return;
  }

  // 3. 単体アップロード
  if (target.classList.contains("upload-single-btn")) {
    if (isNaN(index) || index < 0 || index >= state.files.length) return;
    const file = state.files[index];
    let result = state.results[index];

    target.disabled = true;
    target.textContent = "UP中...";
    try {
      if (!result) {
        result = await convertImage(file, index);
        state.results[index] = result;
      }
      const success = await uploadImage(result);
      if (success) {
        await fetchAndRenderR2Files();
      }
    } catch (e) {
      console.error(e);
      alert("アップロードに失敗しました: " + e.message);
    } finally {
      render();
    }
    return;
  }

  // 4. URL コピー
  if (target.classList.contains("copy-button")) {
    const result = state.results[index];
    const inputUrl = card.querySelector(".url-output")?.value;
    const urlToCopy = result?.proxyUrl || inputUrl;
    await copyToClipboard(urlToCopy, target);
    return;
  }

  // 5. Civitai 転送（A案: リネーム無視で変換 ➔ 一時共有 ➔ Civitai Intent 自動セット起動）
  if (target.classList.contains("civitai-post-btn")) {
    if (isNaN(index) || index < 0 || index >= state.files.length) return;
    const file = state.files[index];
    let result = state.results[index];

    if (!updateCfStatus()) {
      alert("⚠️ Cloudflare 接続設定（Worker URLとAPIトークン）を設定して保存してください。");
      return;
    }

    target.disabled = true;
    target.textContent = "転送中...";

    try {
      // 1. リネーム設定は無視して元ファイル名ベースで確実に変換
      if (!result || !result.isUploaded) {
        const isConvertOn = enableConvertCheck?.checked ?? true;
        const dotIndex = file.name.lastIndexOf(".");
        const fileExt = dotIndex > 0 ? file.name.slice(dotIndex + 1).toLowerCase() : "";
        const isImage = file.type?.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp"].includes(fileExt);

        let finalName = file.name;
        if (isConvertOn && isImage) {
          const baseName = dotIndex > 0 ? file.name.slice(0, dotIndex) : file.name;
          const targetExt = extensions[formatSelect?.value || "image/webp"] || "webp";
          finalName = `${baseName}.${targetExt}`;
        }

        if (!result) {
          result = await convertImage(file, index);
          result.name = finalName;
          state.results[index] = result;
        } else {
          result.name = finalName;
        }

        const success = await uploadImage(result);
        if (!success || !result.proxyUrl) {
          throw new Error("Cloudflare への一時アップロードに失敗しました。接続設定をご確認ください。");
        }
        await fetchAndRenderR2Files();
      }

      // 2. Civitai Intent API を開く（画像とプロンプトが自動セットされる！）
      const mediaUrl = result.proxyUrl;
      const mediaName = file.name;
      openCivitaiIntent(mediaUrl, mediaName);

    } catch (e) {
      console.error("Civitai post error:", e);
      alert(e.message);
    } finally {
      target.disabled = false;
      target.textContent = "🎨 Civitai";
      render();
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
    updateUploadAllButtonState();
  }
}

async function convertImage(file, index = 0) {
  const dotIndex = file.name.lastIndexOf(".");
  const fileExt = dotIndex > 0 ? file.name.slice(dotIndex + 1).toLowerCase() : "";
  const isImageMime = file.type && file.type.startsWith("image/");
  const isImageExt = ["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp", "jxl"].includes(fileExt);
  const isImage = isImageMime || isImageExt;

  const isConvertOn = enableConvertCheck?.checked ?? true;

  if (!isImage || !isConvertOn) {
    const url = URL.createObjectURL(file);
    const outputName = createOutputName(file.name, null, index);
    return {
      id: crypto.randomUUID(),
      name: outputName,
      relativePath: file.relativePath || file.name,
      url,
      previewUrl: isImage ? url : "",
      blob: file,
      size: file.size,
      originalSize: file.size,
      isNonImage: !isImage,
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
  if (!result || !result.blob) return;

  if (!updateCfStatus()) {
    alert("Worker URL と API トークンを設定してください");
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
    const pwdInput = document.querySelector("#tempPasswordInput");
    const password = pwdInput ? pwdInput.value.trim() : "";
    const uploadUrl = getApiUrl(`/temp-upload?filename=${encodeURIComponent(result.name)}&ttl=${ttl}${password ? `&password=${encodeURIComponent(password)}` : ""}`);

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: getRequestHeaders({
        "Content-Type": result.blob ? (result.blob.type || "application/octet-stream") : "application/octet-stream",
        ...(password ? { "X-Upload-Password": password } : {}),
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
    result.storageKey = extractStorageKey(data.url || data.key || result.name);

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
  const pwdInput = document.querySelector("#tempPasswordInput");
  const password = pwdInput ? pwdInput.value.trim() : "";
  const uploadUrl = getApiUrl(`/temp-upload?filename=${encodeURIComponent(newFilename)}&ttl=${ttl}${password ? `&password=${encodeURIComponent(password)}` : ""}`);

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: getRequestHeaders({
      "Content-Type": file.type || "application/octet-stream",
      ...(password ? { "X-Upload-Password": password } : {}),
    }),
    body: file,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "サーバーエラー" }));
    throw new Error(`'${file.name}' のアップロードに失敗: ${errorData.error}`);
  }

  const data = await response.json();
  const publicUrl = getPublicUrl(data.url);
  const key = extractStorageKey(data.url || data.key || file.name);
  paletteFiles.unshift({ key, url: publicUrl });
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

  const isZipOn = enableZipCheck?.checked ?? false;
  const validResults = state.results.filter(r => r && r.blob);

  if (isZipOn && validResults.length > 0) {
    if (statusText) statusText.textContent = "ZIP作成中...";
    try {
      const zipEntries = [];
      for (const result of validResults) {
        const arrayBuffer = await result.blob.arrayBuffer();
        zipEntries.push({
          name: result.name,
          data: new Uint8Array(arrayBuffer),
        });
      }
      const zipBytes = createZip(zipEntries);
      const zipBlob = new Blob([zipBytes], { type: "application/zip" });
      const zipUrl = URL.createObjectURL(zipBlob);
      downloadUrl(zipUrl, "converted-images.zip");
      setTimeout(() => URL.revokeObjectURL(zipUrl), 1500);
      if (statusText) statusText.textContent = "ZIP一括ダウンロード完了";
    } catch (err) {
      console.error("ZIP creation error:", err);
      alert("ZIP作成に失敗しました。個別ダウンロードに切り替えます。");
      for (const result of validResults) {
        if (result && result.url) {
          downloadUrl(result.url, result.name);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
  } else {
    if (statusText) statusText.textContent = "ダウンロード中...";
    for (const result of state.results) {
      if (result && result.url) {
        downloadUrl(result.url, result.name);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    if (statusText) statusText.textContent = "ダウンロード完了";
  }
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
  const cfOk = updateCfStatus();
  const unuploaded = state.results ? state.results.filter(r => r && !r.isUploaded && !r.isUploading) : [];
  if (uploadAllButton) {
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
  const lang = getAppLanguage();
  const dict = i18nDict[lang] || i18nDict.ja;
  const endpoint = (localStorage.getItem("cfEndpoint") || "").trim();
  const token    = (localStorage.getItem("cfToken") || "").trim();

  if (!endpoint || !token) {
    r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px; color: var(--muted); display: block; text-align: center;">Cloudflare未接続</span>`;
    return;
  }

  r2FileList.innerHTML = `<span class="status-text" style="padding: 18px;">${escapeHtml(dict.r2Loading || "読み込み中...")}</span>`;
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
      r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px; color: #38bdf8; font-weight: 600; display: block; text-align: center;">Cloudflare接続成功</span>`;
      return;
    }

    publicFiles.sort((a, b) => b.remaining - a.remaining);

    publicFiles.forEach(file => {
      const item = document.createElement("article");
      item.className = "result-item";

      const ext = file.filename ? file.filename.split('.').pop().toLowerCase() : "";
      let thumbHtml = "";
      if (file.hasPassword) {
        thumbHtml = `<div class="thumb format-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 22px; display: flex; align-items: center; justify-content: center;" title="パスワード保護">🔒</div>`;
      } else if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) {
        thumbHtml = `<img class="thumb" alt="" src="${escapeHtml(file.url)}" loading="lazy">`;
      } else if (["mp4", "webm", "ogv", "mov", "m4v"].includes(ext)) {
        thumbHtml = `<video class="thumb" src="${escapeHtml(file.url)}#t=0.5" preload="metadata" muted playsinline style="object-fit: cover; pointer-events: none;"></video>`;
      } else {
        thumbHtml = `<div class="thumb format-badge">${escapeHtml(ext.toUpperCase() || "FILE")}</div>`;
      }

      const timeText = formatRemainingTime(file.remaining);

      item.innerHTML = `
        <input type="checkbox" class="r2-file-checkbox" data-key="${escapeHtml(file.key)}" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent); align-self: center; margin-right: 4px;">
        <a href="${escapeHtml(file.url)}" target="_blank" rel="noopener noreferrer" class="thumb-link" title="View">
          ${thumbHtml}
        </a>
        <div style="flex: 1; min-width: 0;">
          <div class="item-name-row" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
            <span class="item-name" style="font-weight: 600; word-break: break-all;">${escapeHtml(file.filename)}</span>
            <span style="color: #64748b; font-size: 11px; white-space: nowrap;">${formatBytes(file.size)}</span>
            <button type="button" class="rename-file-btn" data-key="${escapeHtml(file.key)}" title="ファイル名を変更" style="background: none; border: none; cursor: pointer; padding: 2px 4px; font-size: 14px; opacity: 0.8; transition: opacity 0.15s; line-height: 1;">✏️</button>
            ${file.hasPassword ? `<span class="password-badge" style="background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); font-size: 10px; padding: 1px 6px; border-radius: 4px; font-weight: 600;">🔒 ${file.password ? `パスワード: ${escapeHtml(file.password)}` : "パスワード保護"}</span>` : ""}
          </div>
          <div class="item-meta" style="color: #ff9800; font-weight: bold; margin-top: 4px; font-size: 13px;">⏳ ${escapeHtml(timeText)}</div>
        </div>
        <div class="result-actions" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <button type="button" class="ghost-button copy-button" data-url="${escapeHtml(file.url)}">${escapeHtml(dict.copyUrl)}</button>
          ${!file.hasPassword ? `<button type="button" class="ghost-button civitai-r2-post-btn" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.4);" data-url="${escapeHtml(file.url)}" data-name="${escapeHtml(file.filename)}" title="Civitai の投稿画面を開く">🎨 Civitai</button>` : ""}
          <button type="button" class="ghost-button temp-extend-btn" data-key="${escapeHtml(file.key)}">${escapeHtml(dict.extend24h)}</button>
          <button type="button" class="ghost-button danger-button temp-delete-btn" data-key="${escapeHtml(file.key)}">${escapeHtml(dict.deleteNow)}</button>
        </div>
      `;
      r2FileList.append(item);
    });

    updateSelectedR2ActionButtonsState();
  } catch (error) {
    console.error("Fetch temp files UI error:", error);
    r2FileList.innerHTML = `<span class="item-meta" style="padding: 18px; color: var(--muted); display: block; text-align: center;">Cloudflare未接続</span>`;
    updateSelectedR2ActionButtonsState();
  }
}

function formatRemainingTime(seconds) {
  const lang = getAppLanguage();
  const dict = i18nDict[lang] || i18nDict.ja;
  const expiredText = dict.timeExpired || "消滅済み (期限切れ)";
  if (seconds <= 0) return expiredText;

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  const tDays = dict.timeRemainingDays || "あと {d}日 {h}時間 で自動消滅";
  const tHours = dict.timeRemainingHours || "あと {h}時間 {m}分 で自動消滅";
  const tMinutes = dict.timeRemainingMinutes || "あと {m}分 で自動消滅";

  if (days > 0) return tDays.replace("{d}", days).replace("{h}", hours);
  if (hours > 0) return tHours.replace("{h}", hours).replace("{m}", minutes);
  return tMinutes.replace("{m}", minutes);
}

function renderUrlPalette() {
  if (!paletteList) return;
  paletteList.innerHTML = "";
  
  const allPaletteFiles = [...paletteFiles, ...civitaiPaletteFiles];

  if (allPaletteFiles.length === 0) {
    paletteList.innerHTML = `<span style="font-size: 11px; color: var(--muted); padding: 8px;">一時共有またはCivitaiのメディアがありません。</span>`;
    return;
  }
  
  allPaletteFiles.forEach(file => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = file.isCivitai ? "palette-chip civitai-palette-chip" : "palette-chip";
    btn.dataset.url = file.url;
    btn.title = `${file.key} (クリックでURL挿入)`;
    btn.style.position = "relative";
    
    const ext = file.key ? file.key.split('.').pop().toLowerCase() : "";
    const isVideo = file.isVideo || ["mp4", "webm", "ogv", "mov", "m4v"].includes(ext);
    const isImage = !isVideo && (file.previewUrl || ["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext) || file.isCivitai);

    if (isVideo) {
      const video = document.createElement("video");
      video.src = `${file.url}#t=0.5`;
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("referrerpolicy", "no-referrer");
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.pointerEvents = "none";
      btn.append(video);
    } else if (isImage) {
      const img = document.createElement("img");
      img.src = file.previewUrl || file.url;
      img.alt = "";
      img.loading = "lazy";
      img.setAttribute("referrerpolicy", "no-referrer");
      btn.append(img);
    } else {
      btn.className += " format-badge";
      btn.textContent = ext.toUpperCase() || "FILE";
    }

    if (file.isCivitai) {
      const badge = document.createElement("span");
      badge.className = "palette-chip-badge";
      badge.textContent = "🎨";
      btn.append(badge);
    }
    
    btn.addEventListener("click", async () => {
      let finalInsertUrl = file.url;
      // Civitai の URL の場合、真の blobs-b2 直リンク URL を取得可能なら自動解決
      if (file.isCivitai) {
        const endpoint = (localStorage.getItem("cfEndpoint") || cfEndpoint?.value || "").trim().replace(/\/$/, "");
        if (endpoint) {
          try {
            const resolveApi = `${endpoint}/api/resolve-url?url=${encodeURIComponent(file.url)}`;
            const res = await fetch(resolveApi);
            if (res.ok) {
              const data = await res.json();
              if (data && data.url) finalInsertUrl = data.url;
            }
          } catch (e) {
            console.warn("Resolve URL fallback:", e);
          }
        }
      }
      insertAtCursor(finalInsertUrl);
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

  if (target.classList.contains("rename-file-btn") || target.closest(".rename-file-btn")) {
    const btn = target.classList.contains("rename-file-btn") ? target : target.closest(".rename-file-btn");
    const oldKey = btn.dataset.key;
    if (!oldKey) return;

    const row = btn.closest(".item-name-row");
    if (!row) return;

    const lastDotIndex = oldKey.lastIndexOf(".");
    const baseName = lastDotIndex > 0 ? oldKey.substring(0, lastDotIndex) : oldKey;
    const ext = lastDotIndex > 0 ? oldKey.substring(lastDotIndex) : "";

    const lang = getAppLanguage();
    const dict = i18nDict[lang] || i18nDict.ja;
    const saveText = dict.btnSaveShort || (lang === "en" ? "Save" : "保存");
    const cancelText = dict.btnCancelShort || (lang === "en" ? "Cancel" : "戻る");

    const originalHtml = row.innerHTML;

    row.innerHTML = `
      <div class="rename-inline-form" style="display: flex; align-items: center; gap: 6px; flex: 1; flex-wrap: wrap;">
        <input type="text" class="rename-input" value="${escapeHtml(baseName)}" style="flex: 1; min-width: 110px; height: 32px; border: 1px solid var(--border); border-radius: 4px; background: #121316; color: var(--text); padding: 0 8px; font-size: 13px; outline: none;">
        <span class="rename-ext" style="font-size: 13px; color: var(--muted); font-weight: bold;">${escapeHtml(ext)}</span>
        <button type="button" class="primary-button rename-save-btn" data-key="${escapeHtml(oldKey)}" style="min-height: 32px; padding: 0 10px; font-size: 12px; font-weight: bold;">${escapeHtml(saveText)}</button>
        <button type="button" class="ghost-button rename-cancel-btn" style="min-height: 32px; padding: 0 10px; font-size: 12px;">${escapeHtml(cancelText)}</button>
      </div>
    `;

    const input = row.querySelector(".rename-input");
    const saveBtn = row.querySelector(".rename-save-btn");
    const cancelBtn = row.querySelector(".rename-cancel-btn");

    if (input) {
      input.focus();
      input.select();

      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          saveBtn?.click();
        } else if (e.key === "Escape") {
          e.preventDefault();
          cancelBtn?.click();
        }
      });
    }

    cancelBtn?.addEventListener("click", () => {
      row.innerHTML = originalHtml;
    });

    saveBtn?.addEventListener("click", async () => {
      const newBaseName = input?.value?.trim();
      if (!newBaseName || newBaseName === baseName) {
        row.innerHTML = originalHtml;
        return;
      }

      const finalNewName = newBaseName + ext;

      try {
        saveBtn.disabled = true;
        saveBtn.textContent = "...";
        const response = await fetch(getApiUrl("/api/temp-rename"), {
          method: "POST",
          headers: getRequestHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ oldKey, newName: finalNewName }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "リネームエラー" }));
          throw new Error(err.error || "リネームに失敗しました");
        }

        await fetchAndRenderR2Files();
      } catch (err) {
        alert("エラー: " + err.message);
        row.innerHTML = originalHtml;
      }
    });
    return;
  }

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

  if (target.classList.contains("civitai-r2-post-btn")) {
    const mediaUrl = target.dataset.url;
    const name = target.dataset.name;
    openCivitaiIntent(mediaUrl, name);
  }
});

// Civitai ギャラリーのイベント
reloadCivitaiButton?.addEventListener("click", () => {
  fetchAndRenderCivitaiGallery();
});

civitaiGalleryList?.addEventListener("click", async (event) => {
  const target = event.target;
  if (target.classList.contains("civitai-copy-btn")) {
    const rawUrl = target.dataset.url;
    if (!rawUrl) return;

    try {
      target.textContent = "解決中...";
      
      // Worker の /api/resolve-url を使って 301 先の真の blobs-b2 直リンク URL を確実に取得
      const endpoint = (localStorage.getItem("cfEndpoint") || cfEndpoint?.value || "").trim().replace(/\/$/, "");
      let finalUrl = rawUrl;
      
      if (endpoint) {
        const resolveApi = `${endpoint}/api/resolve-url?url=${encodeURIComponent(rawUrl)}`;
        const res = await fetch(resolveApi);
        if (res.ok) {
          const data = await res.json();
          if (data && data.url) {
            finalUrl = data.url;
          }
        }
      } else {
        const res = await fetch(rawUrl);
        if (res.url) finalUrl = res.url;
      }

      target.dataset.url = finalUrl; // 次回以降のためにキャッシュ
      await copyToClipboard(finalUrl, target);
    } catch (err) {
      console.warn("Failed to resolve redirect, falling back to raw url:", err);
      await copyToClipboard(rawUrl, target);
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

  const isRenameOn = enableRenameCheck?.checked ?? true;
  const isConvertOn = enableConvertCheck?.checked ?? true;

  let safeBase = baseName;

  if (isRenameOn) {
    const pattern = renamePattern?.value?.trim() || "{name}";
    safeBase = pattern.replaceAll("{name}", baseName);

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
  }

  const isImageMime = mimeType && (mimeType in extensions);
  const ext = (isConvertOn && isImageMime)
    ? extensions[mimeType]
    : (originalExt || "bin");

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

// 🔗 PIN付きバックアップURL発行ボタン
const cfBackupUrlButton = document.querySelector("#cfBackupUrlButton");
cfBackupUrlButton?.addEventListener("click", generatePinBackupUrl);

// PIN入力復元モーダルの処理
const submitPinButton = document.querySelector("#submitPinButton");
const cancelPinButton = document.querySelector("#cancelPinButton");
const pinInput = document.querySelector("#pinInput");
const pinErrorNotice = document.querySelector("#pinErrorNotice");
const pinModal = document.querySelector("#pinModal");

submitPinButton?.addEventListener("click", () => {
  const pin = pinInput?.value?.trim() || "";
  if (!pin) {
    if (pinErrorNotice) pinErrorNotice.textContent = "PINコードを入力してください";
    return;
  }

  const payload = decryptPayloadWithPin(pendingEncryptedHash, pin);
  if (!payload || !payload.e || !payload.t) {
    if (pinErrorNotice) pinErrorNotice.textContent = "⚠️ PINコードが正しくないか、データが破損しています";
    return;
  }

  localStorage.setItem("cfEndpoint", payload.e);
  localStorage.setItem("cfToken", payload.t);
  if (payload.d) {
    localStorage.setItem("cfDirectDomain", payload.d);
  } else {
    localStorage.removeItem("cfDirectDomain");
  }

  if (cfEndpoint) cfEndpoint.value = payload.e;
  if (cfToken) cfToken.value = payload.t;
  if (cfDirectDomain) cfDirectDomain.value = payload.d || "";

  updateCfStatus();
  render();

  // URL から #enc=... を即座に消去
  try {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  } catch (e) {}

  if (pinModal) pinModal.style.display = "none";
  alert("🎉 PIN認証に成功しました！Cloudflare 接続設定を完全に復元・保存いたしました");
});

cancelPinButton?.addEventListener("click", () => {
  if (pinModal) pinModal.style.display = "none";
});

pinInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    submitPinButton?.click();
  }
});

const closePinDisplayModalButton = document.querySelector("#closePinDisplayModalButton");
if (closePinDisplayModalButton) {
  closePinDisplayModalButton.addEventListener("click", () => {
    const pinDisplayModal = document.querySelector("#pinDisplayModal");
    if (pinDisplayModal) pinDisplayModal.style.display = "none";
  });
}

render();

