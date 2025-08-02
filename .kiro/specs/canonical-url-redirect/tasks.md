# Implementation Plan

- [x] 1. Cloudflare Pages Functions middlewareの実装
  - `functions/_middleware.ts`ファイルを作成し、Cloudflareの独自ドメインからカスタムドメインへの301リダイレクト機能を実装
  - パスとクエリパラメータを保持したリダイレクト処理を含める
  - エラーハンドリングとフォールバック処理を実装
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 動的robots.txt生成機能の実装
  - `src/pages/robots.txt.ts`ファイルを作成し、アクセス元ドメインに応じて異なるrobots.txtを配信する機能を実装
  - Cloudflareドメインでは制限的な設定、カスタムドメインでは通常の設定を返すロジックを実装
  - 既存の`public/robots.txt`との整合性を保つ
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. Enhanced Canonical URLコンポーネントの実装
  - `src/components/CanonicalUrl.astro`コンポーネントを作成し、常にカスタムドメインを指すcanonical URLを生成
  - 環境変数を活用した柔軟なドメイン設定を実装
  - 既存のLayout.astroとの統合準備
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 4. Layout.astroのSEOメタタグ強化
  - 既存のLayout.astroファイルを更新し、Enhanced Canonical URLコンポーネントを統合
  - Open GraphのURLメタタグを常にカスタムドメインを指すように修正
  - 追加のSEOシグナル（alternate meta tag）を実装
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 5. 環境変数とタイプ定義の整備
  - 必要な環境変数の型定義を`src/server-constants.ts`に追加
  - Cloudflare Pages Functions用の環境変数インターフェースを定義
  - 設定の一元管理とタイプセーフティを確保
  - _Requirements: 1.1, 2.1, 4.1_

- [x] 6. リダイレクト機能のテスト実装
  - リダイレクト処理のユニットテストを作成
  - ドメイン判定ロジックのテストケースを実装
  - URL生成とパラメータ保持のテストを作成
  - _Requirements: 5.1, 5.2_

- [x] 7. SEO検証ツールの実装
  - Canonical URLの正確性を検証するテストスクリプトを作成
  - robots.txtの動的生成をテストする機能を実装
  - リダイレクトチェーンの検証ツールを作成
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. 統合テストとE2Eテストの実装
  - 異なるドメインでのアクセステストを作成
  - Cloudflare Pages Functions のローカルテスト環境を構築
  - 実際のリダイレクト動作の検証テストを実装
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. ドキュメントとモニタリング設定の作成
  - 実装した機能の使用方法とトラブルシューティングガイドを作成
  - Google Search Console での監視設定手順を文書化
  - パフォーマンス監視とエラー追跡の設定方法を記載
  - _Requirements: 5.3_

- [x] 10. 本番環境デプロイと検証
  - 全ての実装をまとめて本番環境にデプロイ
  - リダイレクト機能の動作確認を実施
  - SEO効果の初期測定とベースライン設定
  - 必要に応じた微調整と最適化
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.1, 4.2, 4.3, 5.3_