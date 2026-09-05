# 🖼️ BYOC Converter

A privacy-first, browser-local image optimization, Exif stripping, and format conversion studio with an optional self-hosted Cloudflare Workers/KV temporary cloud sharing integration.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Cloudflare%20Pages-orange?style=for-the-badge&logo=cloudflare)](https://byoc-converter.pages.dev)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Zero-Dollar CDN Guide](https://img.shields.io/badge/Guide-Free%20R2%20CDN-brightgreen?style=for-the-badge)](docs/FREE_R2_PAGES_CDN_GUIDE.md)

---

## ✨ Features

- **🔐 100% Local Browser Processing**: Image optimization and Exif metadata stripping happen entirely inside your browser (Canvas / WebAssembly). Your files are **never uploaded** to any third-party servers during conversion.
- **⚡ Fast & Versatile Format Conversion**: Convert images to **WebP**, **JPEG**, or **JXL** with real-time quality tuning and batch renaming rules (`{name}`, `{num:2}`, `{randam:6}`).
- **🎬 Video Thumbnail Generation**: Automatically generates static frame previews for video files (`.mp4`, `.webm`, `.mov`, `.m4v`).
- **📦 ZIP Batch Download**: Package all processed images into a single ZIP file with a single click.
- **🌐 Full i18n Support (JA / EN)**: Dynamic Japanese and English UI switching with automatic browser language detection and `localStorage` memory.
- **📱 Optical QR Code Sync (`#sync=...`)**: Seamlessly transfer API credentials between devices via encrypted URL hash QR codes that automatically purge themselves from browser history upon scanning.

---

## 💡 Optional Feature: Self-Hosted Cloud Sharing (BYOK Architecture)

While BYOC Converter is primarily a local image optimization tool, it includes an optional **Bring Your Own Key (BYOK)** feature:

- **Self-Hosted Storage**: Connect your own [Cloudflare Worker](https://github.com/OKPN/byoc-worker) & KV storage to turn the converter into a private, ephemeral file uploader with auto-expiring links (1 to 7 days).
- **Zero Maintainer Cost**: Leverages Cloudflare's generous free tier (100,000 requests/day per account).
- **Complete Privacy & Legal Discretion**: Your data remains exclusively in your own Cloudflare account.

---

## 🚀 Free R2 Media CDN (No Custom Domain Required)

Want to serve images/videos with direct links without paying for a custom domain?  
Check out our step-by-step recipe on setting up a 100% free Cloudflare Pages edge proxy:

👉 **[📖 Zero-Dollar R2 Image CDN via Cloudflare Pages Guide](docs/FREE_R2_PAGES_CDN_GUIDE.md)**

---

## 🚀 Quick Start

No installation required! Access the web application directly in any modern browser:

👉 **[https://byoc-converter.pages.dev](https://byoc-converter.pages.dev)**

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/OKPN/byoc-converter.git
cd byoc-converter

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

---

## ⚙️ Backend Setup (Optional)

To enable temporary cloud uploads, deploy your own instance of the backend worker:

👉 **[BYOC Worker GitHub Repository](https://github.com/OKPN/byoc-worker)**

*(Note: If you wish to serve files via a custom domain e.g. `img.yourdomain.com`, simply assign a Custom Domain under Workers Settings in your Cloudflare Dashboard.)*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
