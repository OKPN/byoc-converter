import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// パブリック配信ドメイン (d.k7m.f5.si) でアクセスされた場合、トップページやアセットへのアクセスを拒否してUI画面を完全隠蔽
app.use("*", async (c, next) => {
  const host = c.req.header("host") || "";
  const path = c.req.path;
  if (host.includes("d.k7m.f5.si") && !host.includes("d-pub.k7m.f5.si")) {
    if (path === "/" || path === "/index.html" || path.startsWith("/assets/")) {
      return c.text("404 Not Found", 404);
    }
  }
  await next();
});

// CORSを有効にする（フロントエンドドメインとAPIドメインが異なる場合の通信エラーを防ぐ）
const corsMiddleware = cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});
app.use("/api/*", corsMiddleware);
app.use("/temp-upload", corsMiddleware);

// 全てのAPIリクエストでAuthorizationヘッダーをチェックするミドルウェア
app.use("/api/*", async (c, next) => {
  const expectedToken = c.env.API_TOKEN;
  // 環境変数 API_TOKEN が設定されていない場合は、認証なしでアクセスを許可する（後方互換性）
  if (!expectedToken) {
    return await next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  const token = authHeader.substring(7);
  if (token !== expectedToken) {
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }

  await next();
});

// 1. アップロード中継API (PUT /api/upload/*)
app.put("/api/upload/*", async (c) => {
  try {
    const path = c.req.path;
    const filename = decodeURIComponent(path.replace(/^\/api\/upload\//, ""));
    if (!filename) {
      return c.json({ error: "No filename provided" }, 400);
    }
    const contentType = c.req.header("Content-Type") || "application/octet-stream";

    // R2にファイルをストリームで直接アップロード
    const object = await c.env.IMAGE_BUCKET.put(filename, c.req.raw.body, {
      httpMetadata: { contentType },
    });

    // R2バケットに設定したカスタムドメインのURLを生成
    const publicUrl = `https://f.k7m.f5.si/${object.key}`;

    // フロントエンドにURLとファイル名を返す
    return c.json({
      url: publicUrl,
      filename: object.key, // R2のオブジェクトキー（ファイル名）
    });
  } catch (error) {
    console.error("Upload API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 2. 削除中継API (POST /api/delete)
app.post("/api/delete", async (c) => {
  try {
    const { filename } = await c.req.json();
    if (!filename) {
      return c.json({ error: "No filename provided" }, 400);
    }

    // R2からファイルを削除
    await c.env.IMAGE_BUCKET.delete(filename);

    // Cloudflareのエッジキャッシュをパージする
    const zoneId = c.env.CLOUDFLARE_ZONE_ID;
    const apiToken = c.env.CLOUDFLARE_API_TOKEN;
    const urlToPurge = `https://f.k7m.f5.si/${filename}`;

    if (zoneId && apiToken) {
      console.log(`Purging cache for: ${urlToPurge}`);
      const purgeResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: [urlToPurge] }),
      });

      if (!purgeResponse.ok) {
        console.error("Cache purge failed:", await purgeResponse.text());
        // ここではエラーを投げず、ログ出力に留める（ファイル削除は成功しているため）
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Delete API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 3. R2ファイル一覧取得API (GET /api/files)
app.get("/api/files", async (c) => {
  try {
    const list = await c.env.IMAGE_BUCKET.list();
    const files = list.objects
      .filter(obj => !obj.key.startsWith(".system/"))
      .map(obj => {
        return { key: obj.key, size: obj.size, uploaded: obj.uploaded, url: `https://f.k7m.f5.si/${obj.key}` };
      });

    return c.json({ files });
  } catch (error) {
    console.error("List files API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 4. R2ファイル名変更API (POST /api/rename)
app.post("/api/rename", async (c) => {
  try {
    const { from, to } = await c.req.json();
    if (!from || !to) {
      return c.json({ error: "Missing source (from) or destination (to) filename" }, 400);
    }

    // 1. R2から元オブジェクトを取得
    const sourceObject = await c.env.IMAGE_BUCKET.get(from);
    if (!sourceObject) {
      return c.json({ error: `Source file '${from}' not found` }, 404);
    }

    // 2. 新しいファイル名で複製（PUT）
    const contentType = sourceObject.httpMetadata?.contentType || "application/octet-stream";
    await c.env.IMAGE_BUCKET.put(to, sourceObject.body, {
      httpMetadata: { contentType },
    });

    // 3. 元のファイルを削除
    await c.env.IMAGE_BUCKET.delete(from);

    // 4. Cloudflareエッジキャッシュのパージ（設定されている場合）
    const zoneId = c.env.CLOUDFLARE_ZONE_ID;
    const apiToken = c.env.CLOUDFLARE_API_TOKEN;
    if (zoneId && apiToken) {
      const urlToPurgeFrom = `https://f.k7m.f5.si/${from}`;
      const urlToPurgeTo = `https://f.k7m.f5.si/${to}`;
      console.log(`Purging cache for renamed files: ${urlToPurgeFrom}, ${urlToPurgeTo}`);
      
      try {
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: [urlToPurgeFrom, urlToPurgeTo] }),
        });
      } catch (purgeError) {
        console.error("Cache purge during rename failed:", purgeError);
      }
    }

    const publicUrl = `https://f.k7m.f5.si/${to}`;
    return c.json({ success: true, url: publicUrl, filename: to });
  } catch (error) {
    console.error("Rename API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 5. 設定取得API (GET /api/config)
app.get("/api/config", async (c) => {
  try {
    const configObject = await c.env.IMAGE_BUCKET.get(".system/config.json");
    if (!configObject) {
      return c.json({ storageLimit: 10000, autoCleanEnabled: false, autoCleanDays: 7 });
    }
    const configText = await configObject.text();
    const config = JSON.parse(configText);
    return c.json({
      storageLimit: config.storageLimit !== undefined ? config.storageLimit : 10000,
      autoCleanEnabled: config.autoCleanEnabled !== undefined ? config.autoCleanEnabled : false,
      autoCleanDays: config.autoCleanDays !== undefined ? config.autoCleanDays : 7,
    });
  } catch (error) {
    console.error("Get config API error:", error);
    return c.json({ storageLimit: 10000, autoCleanEnabled: false, autoCleanDays: 7 });
  }
});

// 6. 設定保存API (POST /api/config)
app.post("/api/config", async (c) => {
  try {
    const config = await c.req.json();
    
    let currentConfig = { storageLimit: 10000, autoCleanEnabled: false, autoCleanDays: 7 };
    const configObject = await c.env.IMAGE_BUCKET.get(".system/config.json");
    if (configObject) {
      try {
        currentConfig = JSON.parse(await configObject.text());
      } catch (e) {}
    }

    if (config.storageLimit !== undefined) currentConfig.storageLimit = Number(config.storageLimit);
    if (config.autoCleanEnabled !== undefined) currentConfig.autoCleanEnabled = Boolean(config.autoCleanEnabled);
    if (config.autoCleanDays !== undefined) currentConfig.autoCleanDays = Number(config.autoCleanDays);

    const configJson = JSON.stringify(currentConfig);

    await c.env.IMAGE_BUCKET.put(".system/config.json", configJson, {
      httpMetadata: { contentType: "application/json" },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Save config API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 7. 古いファイルのお掃除API (POST /api/cleanup)
app.post("/api/cleanup", async (c) => {
  try {
    const configObject = await c.env.IMAGE_BUCKET.get(".system/config.json");
    if (!configObject) {
      return c.json({ success: true, deletedFiles: [], message: "No config found, cleanup skipped." });
    }
    const config = JSON.parse(await configObject.text());
    if (!config.autoCleanEnabled) {
      return c.json({ success: true, deletedFiles: [], message: "Auto clean is disabled." });
    }

    const cleanDays = Number(config.autoCleanDays) || 7;
    const thresholdDate = new Date(Date.now() - cleanDays * 24 * 60 * 60 * 1000);

    const list = await c.env.IMAGE_BUCKET.list();
    const deletedFiles = [];
    const urlsToPurge = [];

    const zoneId = c.env.CLOUDFLARE_ZONE_ID;
    const apiToken = c.env.CLOUDFLARE_API_TOKEN;

    for (const obj of list.objects) {
      if (obj.key.startsWith(".system/") || obj.key.startsWith("keep/")) {
        continue;
      }

      const uploadedDate = new Date(obj.uploaded);
      if (uploadedDate < thresholdDate) {
        await c.env.IMAGE_BUCKET.delete(obj.key);
        deletedFiles.push(obj.key);
        urlsToPurge.push(`https://f.k7m.f5.si/${obj.key}`);
      }
    }

    if (deletedFiles.length > 0 && zoneId && apiToken) {
      try {
        console.log(`Purging cache for ${deletedFiles.length} cleaned files.`);
        await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ files: urlsToPurge }),
        });
      } catch (purgeError) {
        console.error("Cache purge during cleanup failed:", purgeError);
      }
    }

    return c.json({ success: true, deletedFiles });
  } catch (error) {
    console.error("Cleanup API error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// -------------------------------------------------------------
// 一時共有専用サービス: Cloudflare KV (自動消滅TTL付き)
// R2ストレージは使わず、KVの有効期限機能で全自動消滅します
// -------------------------------------------------------------

// 1. 一時共有アップロード受取 (POST /temp-upload)
app.post("/temp-upload", async (c) => {
  try {
    // 認証チェック（API_TOKEN が設定されている場合のみ）
    const expectedToken = c.env.API_TOKEN;
    if (expectedToken) {
      const authHeader = c.req.header("Authorization");
      const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";
      if (token !== expectedToken) {
        return c.json({ error: "Unauthorized: Invalid token" }, 401);
      }
    }

    const rawFilename = c.req.query("filename") || "file";
    const ttl = Math.max(60, parseInt(c.req.query("ttl") || "259200", 10));
    const contentType = c.req.header("Content-Type") || "application/octet-stream";

    // ファイル名から危険な文字(/, \)を除去
    const baseFilename = rawFilename.replace(/[\/\\]/g, "_");

    // 同名ファイルがすでにKVに存在する場合はランダム接頭辞を付与して上書きを回避
    let shortKey = baseFilename;
    const existing = await c.env.TEMP_KV.get(`temp_${shortKey}`, "arrayBuffer");
    if (existing) {
      const randPrefix = Math.random().toString(36).substring(2, 6);
      shortKey = `${randPrefix}-${baseFilename}`;
    }
    const kvKey = `temp_${shortKey}`;

    const host = c.req.header("host") || "";
    const publicOrigin = host.includes("d-pub.k7m.f5.si")
      ? "https://d.k7m.f5.si"
      : new URL(c.req.url).origin;
    const targetUrl = `${publicOrigin}/${encodeURIComponent(shortKey)}`;

    const body = await c.req.raw.arrayBuffer();
    const MAX_KV_BYTES = 25 * 1024 * 1024; // 25MB
    if (body.byteLength > MAX_KV_BYTES) {
      return c.json({ error: "ファイルサイズがKV上限(25MB)を超えています。" }, 413);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const expiration = nowSeconds + ttl;

    // Cloudflare KV に TTL（有効期限）付きで保存！
    await c.env.TEMP_KV.put(kvKey, body, {
      expirationTtl: ttl,
      metadata: {
        contentType,
        filename: shortKey,
        expiration,
      },
    });

    return c.json({
      success: true,
      url: targetUrl,
      ttl: ttl,
    });
  } catch (error) {
    console.error("KV Temp upload error:", error);
    return c.json({ error: error.message }, 500);
  }
});

const getContentTypeFromFilename = (filename, fallback = "application/octet-stream") => {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    m4v: "video/mp4",
    avi: "video/x-msvideo",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
  };
  return mimeTypes[ext] || fallback;
};

// 2. 一時共有ファイル配信 (GET /:shortKey および GET /d/:shortKey)
const handleTempFetch = async (c, rawShortKey) => {
  try {
    const shortKey = decodeURIComponent(rawShortKey);
    const kvKey = `temp_${shortKey}`;
    const { value, metadata } = await c.env.TEMP_KV.getWithMetadata(kvKey, "arrayBuffer");

    if (!value) {
      return c.text("404 Not Found - この一時ファイルは指定された保持期限が切れたため完全自動消滅しました。", 404);
    }

    let contentType = (metadata && metadata.contentType && metadata.contentType !== "application/octet-stream")
      ? metadata.contentType
      : getContentTypeFromFilename(shortKey);

    const totalBytes = value.byteLength;
    const rangeHeader = c.req.header("Range");

    // HTTP Range リクエスト対応 (動画再生・ストリーミングに必須)
    if (rangeHeader && rangeHeader.startsWith("bytes=")) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10) || 0;
      const end = parts[1] ? parseInt(parts[1], 10) : totalBytes - 1;

      if (start >= totalBytes || end >= totalBytes || start > end) {
        return new Response("Requested Range Not Satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${totalBytes}` },
        });
      }

      const chunk = value.slice(start, end + 1);
      return new Response(chunk, {
        status: 206,
        headers: {
          "Content-Type": contentType,
          "Content-Range": `bytes ${start}-${end}/${totalBytes}`,
          "Content-Length": String(chunk.byteLength),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=86400",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response(value, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(totalBytes),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("KV Temp fetch error:", error);
    return c.text("500 Internal Server Error", 500);
  }
};

app.get("/d/:shortKey", async (c) => handleTempFetch(c, c.req.param("shortKey")));
app.get("/:shortKey", async (c) => {
  const shortKey = c.req.param("shortKey");
  if (shortKey === "favicon.ico" || shortKey === "sw.js" || shortKey === "manifest.json" || shortKey.startsWith("api")) {
    return c.notFound();
  }
  return handleTempFetch(c, shortKey);
});

// 3. 一時共有ファイル一覧取得 API (GET /api/temp-files)
app.get("/api/temp-files", async (c) => {
  try {
    const list = await c.env.TEMP_KV.list({ prefix: "temp_" });
    const nowSeconds = Math.floor(Date.now() / 1000);
    const host = c.req.header("host") || "";
    const publicOrigin = host.includes("d-pub.k7m.f5.si")
      ? "https://d.k7m.f5.si"
      : new URL(c.req.url).origin;

    const filesPromises = list.keys.map(async (k) => {
      const shortKey = k.name.replace(/^temp_/, "");
      const { value, metadata } = await c.env.TEMP_KV.getWithMetadata(k.name, "arrayBuffer");
      const size = value ? value.byteLength : 0;
      const expiration = k.expiration || 0;
      const remaining = Math.max(0, expiration - nowSeconds);
      return {
        key: shortKey,
        filename: (metadata && metadata.filename) ? metadata.filename : shortKey,
        contentType: (metadata && metadata.contentType) ? metadata.contentType : "application/octet-stream",
        url: `${publicOrigin}/${shortKey}`,
        size,
        expiration,
        remaining,
      };
    });

    const files = await Promise.all(filesPromises);
    return c.json({ success: true, files });
  } catch (error) {
    console.error("Fetch temp files error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 4. 一時共有ファイル手動削除 API (POST /api/temp-delete)
app.post("/api/temp-delete", async (c) => {
  try {
    const { key } = await c.req.json();
    if (!key) return c.json({ error: "No key provided" }, 400);
    await c.env.TEMP_KV.delete(`temp_${key}`);
    return c.json({ success: true });
  } catch (error) {
    console.error("Delete temp file error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// 5. 一時共有ファイル有効期限24時間延長 API (POST /api/temp-extend)
app.post("/api/temp-extend", async (c) => {
  try {
    const { key } = await c.req.json();
    if (!key) return c.json({ error: "No key provided" }, 400);

    const kvKey = `temp_${key}`;
    const { value, metadata } = await c.env.TEMP_KV.getWithMetadata(kvKey, "arrayBuffer");
    if (!value) {
      return c.json({ error: "ファイルが見つかりません（すでに期限切れ消滅しています）" }, 404);
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const currentExp = (metadata && metadata.expiration) ? metadata.expiration : (nowSeconds + 86400);
    const newExp = Math.max(nowSeconds + 60, currentExp + 86400);
    const newTtl = newExp - nowSeconds;

    await c.env.TEMP_KV.put(kvKey, value, {
      expirationTtl: newTtl,
      metadata: {
        ...metadata,
        expiration: newExp,
      },
    });

    return c.json({ success: true, newRemaining: newTtl });
  } catch (error) {
    console.error("Extend temp file error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default {
  async fetch(request, env, ctx) {
    const host = request.headers.get("host") || "";
    const url = new URL(request.url);

    // パブリック直リンクドメイン (d.k7m.f5.si) の場合、トップページやアセットアクセスは絶対 404 で遮断して画面を隠蔽
    if (host.includes("d.k7m.f5.si") && !host.includes("d-pub.k7m.f5.si")) {
      if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname.startsWith("/assets/")) {
        return new Response("404 Not Found", { status: 404 });
      }
    }

    const response = await app.fetch(request, env, ctx);
    if (response.status === 404 && env.ASSETS) {
      if (host.includes("d.k7m.f5.si") && !host.includes("d-pub.k7m.f5.si")) {
        return new Response("404 Not Found", { status: 404 });
      }
      return env.ASSETS.fetch(request);
    }
    return response;
  },
};