# Vercel環境変数設定ガイド

Vercelのプロジェクト設定 → Environment Variables で以下の環境変数を設定してください。

## 必須環境変数

### データベース
```
DATABASE_URL=postgresql://user:password@host:port/database
```
Supabaseのデータベース接続文字列（Supabase Dashboard → Project Settings → Database → Connection string → Transaction mode）

**重要**: Supabaseの「Transaction」モード（`postgresql://`で始まる接続文字列）を使用してください。Session Poolingは使用できません。

### Supabase認証
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```
Supabase Dashboard → Project Settings → API から取得

### JWT Secret
```
JWT_SECRET=your-random-secret-string
```
ランダムな文字列（例: `openssl rand -base64 32` で生成）

### アプリケーション設定
```
VITE_APP_ID=your-app-id
VITE_APP_TITLE=BRAVE SPHERE
VITE_APP_LOGO=https://your-logo-url.com/logo.png
NODE_ENV=production
```

### OAuth設定
```
OAUTH_SERVER_URL=https://your-oauth-server.com
OWNER_OPEN_ID=your-owner-id
```

### Forge API（Manus内部API）
```
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### Analytics（オプション）
```
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

## 将来のAPI統合用（現在は不要）

### Google Cloud Video Intelligence API
```
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
```

### Gemini API
```
GEMINI_API_KEY=your-gemini-api-key
```

## 設定手順

1. Vercel Dashboard → プロジェクト選択
2. Settings → Environment Variables
3. 上記の環境変数を追加
4. Environment: Production, Preview, Development すべてにチェック
5. Save

## 注意事項

- `VITE_` で始まる環境変数はクライアントサイドで使用されます（公開情報のみ）
- `SUPABASE_SERVICE_KEY` などの秘密鍵は絶対にクライアントサイドに公開しないでください
- 環境変数を変更した後は、Vercelで再デプロイが必要です

