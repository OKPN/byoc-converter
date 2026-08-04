# BYOC Publisher

端末内で画像を変換・メタデータ除去してから、自分の Cloudflare Worker と KV に一時アップロードする静的Webアプリです。アプリ運営者はファイルもAPIトークンも保持しません。

## 仕組み

```text
Browser (GitHub Pages) -> Your Cloudflare Worker -> Your TEMP_KV
```

画像変換はブラウザ内の WebAssembly で行われます。ファイルは Worker の TTL に従って自動削除されます。

## 使い方

1. [byoc-worker](https://github.com/OKPN/byoc-worker) を自分の Cloudflare アカウントへデプロイします。
2. 公開した BYOC Publisher を開きます。
3. **Cloudflare 情報** に以下を入力して保存します。
   - Worker エンドポイント URL（例: `https://byoc-worker.<account>.workers.dev`）
   - Worker に設定した `API_TOKEN`
   - 直リンク配信ドメイン（任意。未入力時は Worker URL を使用）
4. 画像または動画をアップロードします。

入力した API トークンはブラウザの `localStorage` にのみ保存され、リポジトリや GitHub Pages には送信・保存されません。共有PCでは、利用後に **クリア** を押してください。

## 開発

```bash
npm install
npm run build
npm run preview
```

GitHub Pages 用のワークフローは `main` への push で実行されます。GitHub で **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定してください。

## 制限

Cloudflare KV の値サイズ制限に合わせ、1ファイルあたり25MBまでです。大きな動画を扱う場合は、Worker を Cloudflare R2 ベースに置き換えてください。
