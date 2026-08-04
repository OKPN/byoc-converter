# Image Press (File Publisher)

A lightweight, serverless frontend client that transforms Cloudflare R2 (or S3-compatible object storage) into a fully functional, self-hosted file uploader. 

It is designed as a minimal, all-in-one web panel for developers who want to host their own private file/image sharing client with zero server maintenance overhead.

---

## Concept & Architecture

The application operates on a "heavy frontend, light backend" serverless architecture:

1. **Frontend (The Client)**: Runs entirely in the browser. It handles client-side image optimization (converting to WebP/JPEG/JXL via WebAssembly), Exif metadata stripping (for privacy protection), and interactive URL formatting for forum/blog posts.
2. **Backend (The Storage)**: Powered by Cloudflare Workers and Cloudflare R2. The Workers script acts as a minimal proxy API to read, write, and manage files directly in the R2 bucket.

```
[Local File] ──> [Frontend (Wasm Optimization & Strip)] ──> [Workers API] ──> [Cloudflare R2 Bucket]
```

---

## Key Features

- **Local Compression & Privacy Protection**: Converts images to WebP, JPEG, or JXL locally using WebAssembly. All metadata (GPS coordinates, camera EXIF, AI generation parameters) is stripped before upload.
- **Direct Integration with Storage**: List, rename (including prefixing with `keep/` to pin files), delete, and bulk-select-delete files inside your R2 bucket.
- **Text & Post Composer**: Features an interactive URL insertion palette. Select templates (e.g., greetings) and instantly inject file URLs into the text cursor or `{url}` placeholder for easy copying to forums (like 5ch).
- **Auto Cleanup**: Automatically checks and cleans up expired files that aren't marked as persistent (`keep/`), ensuring your storage usage stays within limit.
- **Serverless & Cost-Efficient**: Runs entirely within the free tiers of Cloudflare Workers and R2.

---

## Prerequisites & Setup

This project is intended for self-hosting. To deploy it, you will need:
- A Cloudflare account.
- An R2 Bucket configured with a public URL (or custom domain).
- A Workers service running `server.js` bound to your R2 bucket.

### Building and Deploying

1. Copy `.env.example` to `.env` and fill in your default Workers endpoint and R2 public URL.
2. Build the project and deploy the assets using Wrangler:

```bash
# Install dependencies
npm install

# Build static assets
npm run build

# Deploy to Cloudflare Workers / Pages
npx wrangler deploy
```

### Security (Access Control)
To restrict upload access to yourself:
1. Set the `API_TOKEN` environment variable on your Cloudflare Workers service dashboard.
2. Enter the same token in the **⚙️ Advanced Settings** section on the web interface.
