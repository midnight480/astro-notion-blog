# Implementation Plan

- [x] 1. 環境変数検証システムの実装
  - 環境変数の分類と検証スクリプトを作成
  - 必須・推奨・任意環境変数の定義とデフォルト値設定
  - GitHub Actionsでの環境変数検証プロセスの統合
  - _Requirements: 4.4, 6.4, 8.4_

- [x] 2. Wrangler設定ファイルの作成
  - wrangler.tomlファイルの作成と基本設定
  - 本番環境とステージング環境の設定分離
  - ルーティング設定とアセットディレクトリの指定
  - _Requirements: 4.1, 4.2_

- [ ] 3. Cloudflare Workers用ミドルウェアの実装
- [x] 3.1 Pages Functions APIからWorkers APIへの変換
  - 現在のfunctions/_middleware.tsをWorkers形式に書き換え
  - PagesFunction型からWorkers fetch関数形式への変更
  - 環境変数アクセス方法の更新
  - _Requirements: 2.1, 2.2_

- [x] 3.2 カスタムドメインリダイレクト機能の実装
  - *.pages.devからmidnight480.comへの301リダイレクト処理
  - パスとクエリパラメータの保持機能
  - エラーハンドリングとフォールバック処理の実装
  - _Requirements: 2.4, 2.5, 2.6_

- [x] 3.3 セキュリティヘッダーの設定
  - X-Frame-Options、X-Content-Type-Options等のセキュリティヘッダー実装
  - X-Robots-TagによるAI Bot制限の設定
  - Cache-Control設定の実装
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4. Astro設定のWorkers対応
- [x] 4.1 astro.config.mjsの更新
  - Cloudflare Workers用アダプターの追加
  - 環境変数検出ロジックの更新（CF_PAGES → CF_WORKERS）
  - サイトURL生成処理のWorkers環境対応
  - _Requirements: 5.1, 5.2_

- [x] 4.2 package.jsonの更新
  - wranglerとCloudflare Workers関連依存関係の追加
  - デプロイ用スクリプトの追加
  - 環境変数検証スクリプトの統合
  - _Requirements: 4.1, 4.2_

- [ ] 5. GitHub Actions デプロイワークフローの実装
- [x] 5.1 GitHub設定の確認と準備
  - GitHub CLIを使用してリポジトリ設定の確認
  - GitHub Secretsの設定状況確認（gh secret list）
  - Actions権限とワークフロー設定の確認
  - _Requirements: 8.1, 8.4_

- [x] 5.2 基本的なワークフロー設定
  - .github/workflows/deploy.ymlファイルの作成
  - Node.js 22.16.0環境の設定
  - npm依存関係のインストールとキャッシュ設定
  - _Requirements: 8.1, 8.2_

- [x] 5.3 NX Cloud連携の実装
  - GitHub CLIでNX_CLOUD_ACCESS_TOKENの設定確認
  - NX Cloud初期化とアクセストークン設定
  - ビルドキャッシュ機能の統合
  - 並列ビルド処理の設定
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5.4 Wranglerデプロイの実装
  - GitHub CLIでCloudflare関連Secretsの確認
  - Cloudflare API認証の設定
  - Workers環境へのデプロイコマンド実装
  - 環境変数の適切な受け渡し
  - _Requirements: 8.3, 8.4_

- [ ] 6. 環境変数管理システムの実装
- [x] 6.1 環境変数検証スクリプトの作成
  - scripts/validate-env.tsファイルの実装
  - 必須・推奨・任意環境変数の分類処理
  - デフォルト値適用とエラーハンドリング
  - _Requirements: 4.4, 6.4_

- [x] 6.2 Workers環境変数の設定
  - GitHub CLIで現在のSecrets設定確認（gh secret list）
  - wrangler secretコマンドによる機密情報設定
  - 本番環境とステージング環境の変数分離
  - 環境変数の暗号化と安全な管理
  - _Requirements: 4.3_

- [ ] 7. テストシステムの実装
- [x] 7.1 ミドルウェア機能のテスト
  - リダイレクト処理の単体テスト作成
  - セキュリティヘッダー設定のテスト
  - エラーハンドリングのテスト
  - _Requirements: 7.1, 7.3_

- [x] 7.2 ビルドプロセスのテスト
  - 環境変数検証のテスト
  - NX Cloud連携のテスト
  - Astro設定変更のテスト
  - _Requirements: 7.1, 6.4_

- [x] 7.3 E2Eテストの実装
  - サイト全体の動作確認テスト
  - パフォーマンステストの実装
  - セキュリティ設定の確認テスト
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 8. 段階的移行の実行
- [x] 8.1 ローカル環境での動作確認
  - wrangler pages devを使用したローカルテスト
  - 全機能の動作確認
  - パフォーマンス測定
  - _Requirements: 9.1_

- [x] 8.2 ステージング環境でのテスト
  - テスト用Workers環境へのデプロイ
  - 本番環境と同等の設定でのテスト
  - 外部サービス連携の確認
  - _Requirements: 9.1_

- [x] 8.3 DNS設定の更新
  - 現在のCNAME設定の確認（Pages向け）
  - Workers用のCNAME設定への変更
  - DNS伝播の確認とテスト
  - _Requirements: 9.3_

- [x] 8.4 本番環境への移行
  - 本番環境へのデプロイ実行
  - DNS切り替え後の動作確認
  - 移行後のモニタリング開始
  - _Requirements: 9.3_

- [ ] 9. DNS設定変更の詳細手順
- [x] 9.1 現在のDNS設定確認
  - Cloudflare DNSダッシュボードでCNAME設定確認
  - 現在のPages向けCNAME（例：xxx.pages.dev）の記録
  - TTL設定とプロキシ状態の確認
  - _Requirements: 9.3_

- [x] 9.2 Workers用DNS設定への変更
  - CNAMEをWorkers用エンドポイントに変更
  - カスタムドメインのWorkers環境での設定
  - SSL証明書の自動更新確認
  - _Requirements: 9.3_

- [ ] 10. 移行後の最適化と監視
- [x] 10.1 パフォーマンス最適化
  - Workers環境でのパフォーマンス測定
  - キャッシュ設定の最適化
  - レスポンス時間の改善
  - _Requirements: 1.2_

- [x] 10.2 監視とログ設定
  - Workers環境でのログ出力設定
  - エラー監視とアラート設定
  - パフォーマンス監視の実装
  - _Requirements: 1.1, 1.2_

- [ ] 11. ドキュメント更新と移行完了
- [x] 11.1 README.mdの更新
  - 新しいデプロイメント手順の記載
  - 環境変数設定方法の更新
  - DNS設定変更手順の追加
  - トラブルシューティングガイドの追加
  - _Requirements: 9.1, 9.2_

- [x] 11.2 移行完了の確認
  - 全機能の最終動作確認
  - DNS設定変更後の動作確認
  - 旧環境からの完全移行確認
  - 移行プロセスの文書化
  - _Requirements: 9.3_