# BRAVE SPHERE - TODO

## 🎯 動画解析機能の実装

### Phase 1: データベーススキーマ拡張
- [x] videoTrackingDataテーブルの作成（Video Intelligence APIの生データ保存）
- [x] videoAnalysisJobsテーブルの作成（解析ジョブの状態管理）
- [x] analyzedEventsテーブルの作成（Geminiが検出したイベント保存）
- [x] videoKeyFramesテーブルの作成（キーフレーム画像保存）
- [x] gamesテーブルにvideoPath, analysisStatusフィールド追加（既存）

### Phase 2: Google Cloud Video Intelligence API統合
- [x] @google-cloud/video-intelligenceパッケージのインストール
- [x] Google Cloud認証設定（環境変数）
- [x] 動画アップロード機能の実装（YouTube URL → ダウンロード → S3）
- [x] Video Intelligence API呼び出し機能の実装
- [x] オブジェクト追跡（ボール、選手）の実装
- [x] テキスト検出（スコアボード、ゲームクロック）の実装
- [ ] 生データのデータベース保存（次のフェーズで実装）

### Phase 3: Gemini APIによるイベント分析
- [x] Gemini APIプロンプトの設計（イベント検出用）
- [x] キーフレーム抽出機能の実装
- [x] Video Intelligence APIデータ → Gemini入力形式への変換
- [x] Gemini APIによるイベント推論の実装
- [x] ショット試行・成功/失敗の検出
- [x] アシスト、リバウンド、スティールの推定
- [ ] 検出イベントのデータベース保存（次のフェーズで実装）

### Phase 4: データベース操作関数の実装（API不要）
- [x] videoAnalysisJobsの操作関数（作成、更新、取得）
- [x] videoTrackingDataの操作関数（保存、取得）
- [x] analyzedEventsの操作関数（保存、取得、更新）
- [x] videoKeyFramesの操作関数（保存、取得）

### Phase 5: バックエンドAPIの実装（API不要）
- [x] 解析ジョブ作成API（createJob）
- [x] 解析ジョブステータス取得API（getJobStatus）
- [x] 手動イベント登録API（createManualEvent）
- [x] イベント一覧取得API（getGameEvents）
- [x] イベント更新・delete API（updateEvent, deleteEvent, verifyEvent）

### Phase 6: フロントエンドUIの実装（API不要）
- [x] 試合詳細ページにVideoAnalysisPanelコンポーネント追加
- [x] 解析ステータス表示（プログレスバー）
- [x] イベントタイムライン表示
- [x] 手動イベント追加ダイアログ
- [x] イベント検証・削除機能

### Phase 7: テストとチェックポイント保存
- [x] 手動イベント登録のテスト（UI実装完了）
- [x] タイムライン表示のテスト（UI実装完了）
- [x] チェックポイント保存（version: 2d8b5c7b）

### Phase 8: API統合（将来実装）
- [ ] Google Cloud Video Intelligence APIの認証情報追加
- [ ] Gemini APIの認証情報追加
- [ ] 自動解析パイプラインの実装
- [ ] バックグラウンドジョブの実装
## 📝 既存機能（実装済み）

### 認証システム
- [x] Supabase Auth統合
- [x] ログイン/登録ページ
- [x] 認証フック（useAuth）

### チーム管理
- [x] チーム作成・編集・削除
- [x] チーム一覧表示
- [x] チーム詳細ページ

### 選手管理
- [x] 選手登録（基本情報：名前、背番号、ポジション、身長）
- [x] 選手編集・削除
- [x] 選手一覧表示

### 試合管理
- [x] 試合登録（YouTube URL対応）
- [x] 試合一覧表示
- [x] 試合詳細ページ
- [x] YouTube動画埋め込み表示

### 練習管理
- [x] 練習予定の作成
- [x] 練習一覧表示（今後/過去の分離）

## 🐛 既知の問題

- なし（現時点）

## 💡 将来的な機能拡張

- [ ] 選手の詳細プロフィール（体重、オフェンス/ディフェンスタイプ、スキル評価）
- [ ] ローカル動画ファイルのアップロード対応
- [ ] リアルタイム解析（ライブ配信対応）
- [ ] カスタムYOLOモデルによる高精度解析
- [ ] 戦術パターン認識の高度化
- [ ] チーム間の比較分析
- [ ] シーズン通算統計



## 🚀 Vercelへの移行作業

### 移行タスク
- [x] vercel.json設定ファイルの作成
- [x] Serverless Functions用のAPIエンドポイント作成 (api/trpc.ts)
- [x] ビルド設定の調整 (package.json)
- [x] 環境変数の設定ガイド作成 (VERCEL_ENV_SETUP.md)
- [ ] GitHubへのプッシュとVercelデプロイ確認

