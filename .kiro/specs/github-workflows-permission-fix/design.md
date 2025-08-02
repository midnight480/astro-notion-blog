# Design Document

## Overview

GitHub Actionsワークフローを統合・簡素化し、権限エラーを解決する。`format.yml`と`lint.yml`を完全に削除し、`deploy-workers.yml`にlintとformatチェック機能を統合することで、単一の包括的なCI/CDパイプラインを実現する。これにより、重複の排除、権限エラーの解決、メンテナンス性の向上を図る。

## Architecture

### Current Architecture
```
Separate workflows:
- format.yml: Format + auto-commit (権限エラー発生)
- lint.yml: ESLint check only
- deploy-workers.yml: Build + test + deploy

Problems:
- 重複した依存関係インストール
- 権限エラー
- メンテナンス負荷
```

### New Architecture
```
Unified deploy-workers.yml workflow:
1. Validate environment
2. Build and test job:
   - Checkout code
   - Setup Node.js
   - Install dependencies
   - Run lint check (NEW)
   - Run format check (NEW)
   - Build application
   - Run tests
   - Upload artifacts
3. Deploy jobs (staging/production)
```

## Components and Interfaces

### Removed Components
- `format.yml`: 完全削除
- `lint.yml`: 完全削除

### Modified Components

#### 1. deploy-workers.yml Workflow
- **Before**: Build + test + deploy のみ
- **After**: Lint + format check + build + test + deploy
- **Interface**: GitHub Actions workflow file
- **Responsibility**: 全てのCI/CDプロセスの統合管理

#### 2. Package.json Scripts
新しく追加が必要：
- `npm run format:check`: フォーマットをチェック（CI用）

既存のスクリプト活用：
- `npm run format`: コードをフォーマット（手動実行用）
- `npm run lint`: ESLintチェック（CI用）

## Data Models

### Workflow Configuration
```yaml
# format.yml の新しい構造
name: Format Check
on: [push, pull_request]
permissions:
  contents: read  # 読み取り専用に変更
jobs:
  format-check:
    steps:
      - checkout
      - setup-node
      - install-deps
      - format-check  # 新しいステップ
```

### Error Response Model
```
フォーマットエラー時の出力:
- ファイル名
- 行番号
- 期待される形式
- 修正コマンド
```

## Error Handling

### Formatting Violations
1. **Detection**: Prettierがフォーマット違反を検出
2. **Reporting**: 詳細なエラーメッセージを表示
3. **Resolution**: 開発者に手動修正を促す

### Workflow Failures
1. **Format Check Failure**: 明確なエラーメッセージとともにワークフロー失敗
2. **Dependency Issues**: Node.js/npm関連のエラーハンドリング
3. **Permission Issues**: 読み取り専用権限により権限エラーを回避

## Testing Strategy

### Unit Testing
- フォーマットチェック機能のテスト
- 各種ファイルタイプでのフォーマット検証

### Integration Testing  
1. **Workflow Testing**: GitHub Actionsでのワークフロー実行テスト
2. **Format Validation**: 様々なコード状態でのフォーマットチェック
3. **Error Scenarios**: フォーマット違反時の適切なエラー表示

### Manual Testing
1. **Developer Experience**: 手動フォーマットワークフローの使いやすさ
2. **CI/CD Pipeline**: 新しいワークフローの動作確認
3. **Error Messages**: エラーメッセージの分かりやすさ

## Implementation Plan

### Phase 1: Script Preparation
1. `package.json`にフォーマットチェック用スクリプト追加
2. 新しいスクリプトの動作確認

### Phase 2: Workflow Integration
1. `deploy-workers.yml`にlintとformatチェックステップを追加
2. 新しいステップの動作確認

### Phase 3: Cleanup
1. `format.yml`の完全削除
2. `lint.yml`の完全削除
3. 統合されたワークフローのテスト実行

## Security Considerations

### Permission Reduction
- `contents: write` → `contents: read`に変更
- 自動コミット機能の削除により、意図しないコード変更を防止

### Manual Control
- 開発者が明示的にフォーマットを実行
- コード変更の透明性向上
- レビュープロセスでのフォーマット確認

## Migration Strategy

### Backward Compatibility
- 既存の`npm run format`コマンドは継続使用可能
- 開発者の既存ワークフローへの影響を最小化

### Communication Plan
1. チーム内での変更通知
2. 新しいワークフローの説明
3. 手動フォーマット手順の共有