# BYOC Converter

A privacy-focused, browser-based local image conversion studio with optional Cloudflare KV temporary backup storage.

---

## ⚡ Features

- **100% Client-Side Local Processing**: Convert images to WebP, JPEG, or JXL right inside your browser without uploading raw files to external servers.
- **Privacy First (Exif Stripping)**: Automatically strip sensitive GPS and Exif metadata on conversion.
- **Optional Cloudflare KV Backup**: Safely upload converted or raw files to your personal Cloudflare Worker/KV with auto-expiring TTLs (24 hours to 7 days).
- **Text Composer & Link Palette**: Integrated 5ch/forum text helper with 1-click thumbnail/link insertion.
- **Robust Clipboard Support**: Reliable copy buttons with multi-tier fallback mechanism.

---

## 🛠️ Usage

1. Open **[BYOC Converter](https://okpn.github.io/byoc-converter/)** in any modern web browser.
2. Drag & drop images or folders.
3. Configure format (WebP/JPEG/JXL), quality, and rename rules.
4. Convert locally, or optionally input your Cloudflare Worker URL + Token in **☁️ Cloudflare Settings** for temporary sharing.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
