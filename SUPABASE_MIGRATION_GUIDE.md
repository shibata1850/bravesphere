# Supabaseデータベースマイグレーション手順

PostgreSQL移行後、Supabaseでデータベーステーブルを作成する必要があります。

## 🚨 重要：次のステップ

**現在のエラー原因**: Supabaseにテーブルがまだ作成されていないため、チーム作成時にエラーが発生しています。

## 手順

### 1. Supabase SQLエディタを開く

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニューから **SQL Editor** をクリック

### 2. 既存テーブルをクリーンアップ（必要な場合のみ）

もし既にMySQLスキーマで作成されたテーブルが存在する場合、以下のSQLで削除してください：

```sql
-- 警告: これは全てのデータを削除します
DROP TABLE IF EXISTS analyzedEvents CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS lineups CASCADE;
DROP TABLE IF EXISTS measurements CASCADE;
DROP TABLE IF EXISTS pdf_settings CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS playlistEvents CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS team_practices CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS training_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS videoAnalysisJobs CASCADE;
DROP TABLE IF EXISTS videoKeyFrames CASCADE;
DROP TABLE IF EXISTS videoTrackingData CASCADE;

-- 既存のENUMも削除
DROP TYPE IF EXISTS "analysisStatus" CASCADE;
DROP TYPE IF EXISTS "dataType" CASCADE;
DROP TYPE IF EXISTS "eventType" CASCADE;
DROP TYPE IF EXISTS "frameType" CASCADE;
DROP TYPE IF EXISTS "jobStatus" CASCADE;
DROP TYPE IF EXISTS "role" CASCADE;
DROP TYPE IF EXISTS "shotType" CASCADE;
```

### 3. マイグレーションSQLを実行

**`drizzle/0000_noisy_wither.sql`の全内容**をコピーして、SQL Editorに貼り付けて実行してください。

### 4. テーブルの作成確認

SQLを実行後、以下のクエリでテーブルが作成されたか確認：

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

以下の17個のテーブルが表示されれば成功です：
- analyzedEvents
- events
- games
- lineups
- measurements
- pdf_settings
- players
- playlistEvents
- playlists
- stats
- team_practices
- teams
- training_logs
- users
- videoAnalysisJobs
- videoKeyFrames
- videoTrackingData

## トラブルシューティング

### エラー: "type already exists"

既にENUM型が存在している場合は、上記のクリーンアップSQLでDROP TYPEを実行してください。

### エラー: "relation already exists"

既にテーブルが存在している場合は、クリーンアップSQLでDROP TABLEを実行するか、既存のテーブルを使用してください。

### 接続エラー

Vercelの環境変数`DATABASE_URL`が正しく設定されているか確認してください：
```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

**注意**: SupabaseのDATABASE_URLには `?sslmode=require` などのSSLパラメータが必要な場合があります。

## 完了後

マイグレーション完了後、Vercelで再デプロイすると、チーム作成機能が正常に動作するはずです。

---

## デバッグのヒント

次回エラーが発生した場合は、以下の情報を共有してください：

1. **ブラウザのコンソールエラー**
   - DevTools → Console タブのエラーメッセージ

2. **ネットワークエラーの詳細**
   - DevTools → Network タブ
   - 失敗したリクエストをクリック
   - Response タブの内容

これにより、問題をより正確に診断できます。
