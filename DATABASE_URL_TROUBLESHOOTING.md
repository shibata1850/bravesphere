# DATABASE_URL トラブルシューティングガイド

## 🔍 現在の問題

サーバーログで以下のエラーが発生しています：
```
PostgresError: Tenant or user not found
ENOTFOUND db.vcldbeqidolnvamdgybp.supabase.co
```

デバッグログから、使用されている接続文字列が **間違った形式** であることが判明：
- 現在使用中: `db.vcldbeqidolnvamdgybp.supabase.co:6543`
- これは **Direct connection のホスト名** と **Transaction pooler のポート** が混在している

## ✅ 正しい DATABASE_URL の形式

Vercelのようなサーバーレス環境では、**Transaction pooler** の接続文字列を使用する必要があります：

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 重要なポイント
- ✅ ホスト名: `aws-0-ap-northeast-1.pooler.supabase.com`
- ✅ ポート: `6543`
- ❌ **間違った例**: `db.vcldbeqidolnvamdgybp.supabase.co:6543`

## 📋 Step 1: Supabaseで正しい接続文字列を取得

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを選択
3. **Settings** → **Database** をクリック
4. **Connection string** セクションで、以下を選択：
   - **Connection pooling** タブを選択（Session modeではなくTransaction mode）
   - **Mode**: `Transaction` を選択
   - **Connection string** の値をコピー

正しい形式の例：
```
postgresql://postgres.vcldbeqidolnvamdgybp:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

### 確認ポイント
- [ ] ホスト名に `pooler.supabase.com` が含まれている
- [ ] ポート番号が `:6543` である
- [ ] `[YOUR-PASSWORD]` をSupabaseの実際のパスワードに置き換えている

## 📋 Step 2: Vercel環境変数の確認と更新

### 2.1 Vercel Dashboardにアクセス

1. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
2. プロジェクト **bravesphere** を選択
3. **Settings** タブをクリック
4. 左メニューから **Environment Variables** を選択

### 2.2 DATABASE_URL を確認

1. `DATABASE_URL` という名前の環境変数を探す
2. 現在の値を確認（一部だけ表示されます）
3. 値が正しくない場合は、以下の手順で更新：

**更新手順：**
```
1. DATABASE_URLの右側にある「...」メニューをクリック
2. 「Edit」を選択
3. 正しい接続文字列を貼り付け
4. Environment を確認：
   ☑ Production
   ☑ Preview  ← これが重要！
   ☑ Development
5. 「Save」をクリック
```

### ⚠️ 重要：Previewにもチェックが必要

現在のブランチ `claude/fix-team-creation-error-011FsdG2xUtq7L3ypZeoKt1m` は **Preview** 環境で動作します。
**Preview** にチェックが入っていないと、正しい環境変数が読み込まれません！

## 📋 Step 3: 診断エンドポイントで確認

新しい診断エンドポイントを追加しました。デプロイ後、以下のURLにアクセスして環境変数を確認できます：

```
https://your-app.vercel.app/api/trpc/system.diagnostics
```

このエンドポイントは以下の情報を返します：
- `databaseUrl`: マスクされたDATABASE_URL（パスワードは隠されます）
- `databaseHost`: 接続先のホスト名とポート
- `environment`: NODE_ENVの値
- その他のSupabase環境変数の有無

### 期待される出力例（正しい場合）:
```json
{
  "result": {
    "data": {
      "environment": "production",
      "databaseUrl": "postgresql://postgres.vcldbeqidolnvamdgybp:***@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
      "databaseHost": "aws-0-ap-northeast-1.pooler.supabase.com:6543",
      "hasSupabaseUrl": true,
      "hasSupabaseAnonKey": true,
      "hasSupabaseServiceKey": true,
      "timestamp": "2025-11-21T..."
    }
  }
}
```

### ✅ 確認ポイント
- [ ] `databaseHost` に `pooler.supabase.com:6543` が表示されている
- [ ] `databaseHost` に `db.vcldbeqidolnvamdgybp.supabase.co` が表示されていない

## 📋 Step 4: 再デプロイ

環境変数を更新した後は、**必ず再デプロイ** が必要です。

### Option A: Vercel Dashboardから再デプロイ

1. Vercel Dashboard → プロジェクト選択
2. **Deployments** タブをクリック
3. 最新のデプロイを探す
4. 右側の「...」メニュー → **Redeploy** をクリック
5. **Use existing Build Cache** のチェックを**外す**（重要！）
6. 「Redeploy」をクリック

### Option B: Git pushで再デプロイ

```bash
# 現在のブランチで再デプロイを強制
git commit --allow-empty -m "Force redeploy to apply new DATABASE_URL"
git push -u origin claude/fix-team-creation-error-011FsdG2xUtq7L3ypZeoKt1m
```

## 📋 Step 5: 動作確認

1. 再デプロイが完了したら、まず診断エンドポイントにアクセス
2. `databaseHost` が正しいことを確認
3. チーム作成機能をテスト

## 🔧 よくある問題と解決方法

### 問題1: 「環境変数を更新したのにエラーが続く」
**原因**: ビルドキャッシュが古い値を使用している
**解決**: 再デプロイ時に「Use existing Build Cache」のチェックを外す

### 問題2: 「診断エンドポイントでも古いホスト名が表示される」
**原因**: Preview環境に環境変数が設定されていない
**解決**: Vercelの環境変数設定で「Preview」にチェックが入っているか確認

### 問題3: 「DATABASE_URLがSupabase Dashboardで見つからない」
**原因**: Session poolerを見ている
**解決**: **Connection pooling** タブで **Transaction mode** を選択

### 問題4: 「接続できるが動作が遅い」
**原因**: Direct connectionを使用している可能性
**解決**: Transaction poolerの接続文字列（ポート6543）を使用

## 📞 次のステップ

1. ✅ Step 1-2を完了して正しいDATABASE_URLを設定
2. ✅ Step 4で再デプロイ（Build Cacheを無効化）
3. ✅ Step 3の診断エンドポイントで確認
4. ✅ チーム作成をテスト
5. ❌ まだエラーが出る場合は、サーバーログと診断エンドポイントの結果を共有してください

## 🎯 まとめ

**現在の問題**: DATABASE_URLが間違った形式（Direct connection host + Transaction pooler port）

**解決方法**:
1. SupabaseでTransaction poolerの接続文字列を取得（`pooler.supabase.com:6543`）
2. Vercelの環境変数DATABASE_URLを更新（Production, **Preview**, Developmentすべてにチェック）
3. ビルドキャッシュなしで再デプロイ
4. 診断エンドポイントで確認
