# Design Document

## Overview

Cloudflare PagesからCloudflare Workers Static Assetsへの移行は、現在のAstro Notion Blogの機能を維持しながら、より柔軟で最新のCloudflareプラットフォームを活用するための重要なアップグレードです。

この移行では、静的サイト生成の利点を保ちつつ、Workers環境特有の機能を活用してパフォーマンスとメンテナンス性を向上させます。

## Architecture

### 現在のアーキテクチャ (Cloudflare Pages)
```
GitHub Repository
    ↓ (Push to main)
Cloudflare Pages Build
    ↓
Static Site Generation (Astro)
    ↓
Pages Functions (_middleware.ts)
    ↓
Static Asset Delivery
```

### 移行後のアーキテクチャ (Cloudflare Workers)
```
GitHub Repository
    ↓ (Push to main)
GitHub Actions + Wrangler
    ↓
Static Site Generation (Astro)
    ↓
Workers Static Assets
    ↓
Workers Runtime (Middleware)
    ↓
Static Asset Delivery
```

### 主要な変更点
1. **ビルドプロセス**: Cloudflare Pages Build → GitHub Actions + Wrangler
2. **ミドルウェア**: Pages Functions → Workers Runtime
3. **設定管理**: `public/_headers` → `wrangler.toml` + プログラマティック設定
4. **環境変数**: Pages環境変数 → Workers環境変数

## Components and Interfaces

### 1. ミドルウェア変換

**現在のPages Functions形式:**
```typescript
// functions/_middleware.ts
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  // リダイレクト処理
}
```

**新しいWorkers形式:**
```typescript
// functions/_middleware.ts (Workers版)
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Workers APIを使用したリダイレクト処理
    const url = new URL(request.url);
    
    if (url.hostname.includes('.pages.dev')) {
      const customDomain = env.CUSTOM_DOMAIN || 'midnight480.com';
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = customDomain;
      redirectUrl.protocol = 'https:';
      
      return Response.redirect(redirectUrl.toString(), 301);
    }
    
    // 静的アセットの処理
    return env.ASSETS.fetch(request);
  }
}
```

### 2. Astro設定の更新

**現在の設定:**
```javascript
// astro.config.mjs
const getSite = function () {
  if (process.env.CF_PAGES) {
    // Pages特有の処理
  }
}
```

**新しい設定:**
```javascript
// astro.config.mjs
import cloudflare from '@astrojs/cloudflare';

const getSite = function () {
  if (process.env.CF_WORKERS) {
    // Workers特有の処理
  }
  
  if (process.env.CLOUDFLARE_ACCOUNT_ID) {
    // Workers環境での処理
  }
}

export default defineConfig({
  output: 'static',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  // 既存の設定...
});
```

### 3. デプロイメント設定

**新しいwrangler.toml:**
```toml
name = "astro-notion-blog"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "astro-notion-blog-production"
vars = { ENVIRONMENT = "production" }

[[env.production.routes]]
pattern = "midnight480.com/*"

[env.staging]
name = "astro-notion-blog-staging"
vars = { ENVIRONMENT = "staging" }

[[env.staging.routes]]
pattern = "staging.midnight480.com/*"

[build]
command = "npm run build"
cwd = "."
watch_dir = "src"

[assets]
directory = "./dist"
```

### 4. GitHub Actions設定

**新しい.github/workflows/deploy.yml:**
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.16.0'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup NX Cloud
        run: npx nx g @nrwl/nx-cloud:init
        env:
          NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}
      
      - name: Build with cache
        run: npm run build:cached
        env:
          NOTION_API_SECRET: ${{ secrets.NOTION_API_SECRET }}
          DATABASE_ID: ${{ secrets.DATABASE_ID }}
          CUSTOM_DOMAIN: ${{ secrets.CUSTOM_DOMAIN }}
      
      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=astro-notion-blog
```

## Data Models

### 環境変数マッピング

#### Cloudflare Pages → GitHub Secrets移行

| 現在のPages環境変数 | 移行先GitHub Secrets | Workers環境変数 | 用途 |
|-------------------|-------------------|----------------|------|
| `NOTION_API_SECRET` | `NOTION_API_SECRET` | `NOTION_API_SECRET` | Notion API認証 |
| `DATABASE_ID` | `DATABASE_ID` | `DATABASE_ID` | NotionデータベースID |
| `CUSTOM_DOMAIN` | `CUSTOM_DOMAIN` | `CUSTOM_DOMAIN` | カスタムドメイン設定 |
| `NX_CLOUD_ACCESS_TOKEN` | `NX_CLOUD_ACCESS_TOKEN` | - | NX Cloudビルドキャッシュ |
| - | `CLOUDFLARE_API_TOKEN` | - | Workers API認証 |
| - | `CLOUDFLARE_ACCOUNT_ID` | - | Cloudflareアカウント識別 |

#### プラットフォーム検出変数

| Pages環境変数 | Workers環境変数 | 用途 |
|--------------|----------------|------|
| `CF_PAGES` | `CF_WORKERS` | プラットフォーム検出 |
| `CF_PAGES_URL` | `CF_PAGES_URL` | サイトURL生成 |
| `CF_PAGES_BRANCH` | `CF_PAGES_BRANCH` | ブランチ検出 |

#### 移行手順
1. **Cloudflare Pagesの環境変数を確認**
   - Pages ダッシュボード → Settings → Environment variables
   - 現在設定されている全ての変数をリストアップ

2. **GitHub Secretsに移行**
   - GitHub Repository → Settings → Secrets and variables → Actions
   - 各環境変数をRepository secretsとして追加

3. **GitHub Actionsで使用**
   ```yaml
   env:
     NOTION_API_SECRET: ${{ secrets.NOTION_API_SECRET }}
     DATABASE_ID: ${{ secrets.DATABASE_ID }}
     CUSTOM_DOMAIN: ${{ secrets.CUSTOM_DOMAIN }}
   ```

4. **Workers環境変数の設定**
   ```bash
   # Wranglerコマンドで設定
   wrangler secret put NOTION_API_SECRET
   wrangler secret put DATABASE_ID
   wrangler secret put CUSTOM_DOMAIN
   ```

#### 環境変数の分類と検証

**必須環境変数（ビルド失敗する）:**
| 変数名 | 用途 | 検証方法 |
|--------|------|----------|
| `NOTION_API_SECRET` | Notion API認証 | APIキー形式チェック |
| `DATABASE_ID` | NotionデータベースID | UUID形式チェック |

**推奨環境変数（警告表示）:**
| 変数名 | 用途 | デフォルト値 | 検証方法 |
|--------|------|-------------|----------|
| `NX_CLOUD_ACCESS_TOKEN` | NXビルドキャッシュ | なし | トークン形式チェック |
| `CUSTOM_DOMAIN` | カスタムドメイン | なし | ドメイン形式チェック |

**任意環境変数（デフォルト値適用）:**
| 変数名 | 用途 | デフォルト値 | 型 |
|--------|------|-------------|-----|
| `BASE_PATH` | ベースパス | `/` | string |
| `CACHE_CONCURRENCY` | キャッシュ並列数 | `4` | number |
| `ENABLE_LIGHTBOX` | ライトボックス | `false` | boolean |
| `PUBLIC_ENABLE_COMMENTS` | コメント機能 | `false` | boolean |
| `PUBLIC_GA_TRACKING_ID` | Google Analytics | なし | string |

**環境変数検証スクリプト:**
```typescript
// scripts/validate-env.ts
interface EnvConfig {
  required: string[];
  recommended: string[];
  optional: { [key: string]: string | number | boolean };
}

const envConfig: EnvConfig = {
  required: ['NOTION_API_SECRET', 'DATABASE_ID'],
  recommended: ['NX_CLOUD_ACCESS_TOKEN', 'CUSTOM_DOMAIN'],
  optional: {
    BASE_PATH: '/',
    CACHE_CONCURRENCY: 4,
    ENABLE_LIGHTBOX: false,
    PUBLIC_ENABLE_COMMENTS: false,
    PUBLIC_GA_TRACKING_ID: ''
  }
};

function validateEnvironment() {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 必須環境変数チェック
  envConfig.required.forEach(key => {
    if (!process.env[key]) {
      errors.push(`必須環境変数 ${key} が設定されていません`);
    }
  });
  
  // 推奨環境変数チェック
  envConfig.recommended.forEach(key => {
    if (!process.env[key]) {
      warnings.push(`推奨環境変数 ${key} が設定されていません`);
    }
  });
  
  // デフォルト値適用
  Object.entries(envConfig.optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = String(defaultValue);
      console.log(`環境変数 ${key} にデフォルト値 ${defaultValue} を適用しました`);
    }
  });
  
  if (errors.length > 0) {
    console.error('❌ 環境変数エラー:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('⚠️  環境変数警告:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('✅ 環境変数の検証が完了しました');
}

export { validateEnvironment };
```

**GitHub Actionsでの使用:**
```yaml
- name: Validate Environment Variables
  run: npx tsx scripts/validate-env.ts
  env:
    NOTION_API_SECRET: ${{ secrets.NOTION_API_SECRET }}
    DATABASE_ID: ${{ secrets.DATABASE_ID }}
    NX_CLOUD_ACCESS_TOKEN: ${{ secrets.NX_CLOUD_ACCESS_TOKEN }}
    CUSTOM_DOMAIN: ${{ secrets.CUSTOM_DOMAIN }}
```

### ヘッダー設定マッピング

**現在のpublic/_headers:**
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Cache-Control: public, max-age=3600
```

**新しいWorkers設定:**
```typescript
// セキュリティヘッダーの設定
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Robots-Tag': 'noai, noimageai'
};

// レスポンスにヘッダーを追加
const response = await env.ASSETS.fetch(request);
Object.entries(securityHeaders).forEach(([key, value]) => {
  response.headers.set(key, value);
});
```

## Error Handling

### 1. ミドルウェアエラー処理
```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // メイン処理
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Workers middleware error:', error);
      
      // フォールバック処理
      return env.ASSETS.fetch(request);
    }
  }
}
```

### 2. ビルドエラー処理
- NX Cloudのキャッシュエラー時のフォールバック
- Notion API接続エラー時の処理
- 環境変数不足時のエラーメッセージ

### 3. デプロイエラー処理
- Wranglerデプロイ失敗時のロールバック
- 環境変数設定エラーの検出
- DNS設定エラーの対応

## Testing Strategy

### 1. 単体テスト
- ミドルウェア関数のテスト
- リダイレクト処理のテスト
- 環境変数検出ロジックのテスト

### 2. 統合テスト
- ビルドプロセス全体のテスト
- NX Cloud連携のテスト
- GitHub Actions デプロイのテスト

### 3. E2Eテスト
- サイト全体の動作確認
- パフォーマンステスト
- セキュリティヘッダーの確認

### 4. 移行テスト
```typescript
// テストスクリプト例
describe('Cloudflare Workers Migration', () => {
  test('リダイレクト機能が正常に動作する', async () => {
    const response = await fetch('https://test.pages.dev/');
    expect(response.status).toBe(301);
    expect(response.headers.get('location')).toBe('https://midnight480.com/');
  });
  
  test('セキュリティヘッダーが正しく設定される', async () => {
    const response = await fetch('https://midnight480.com/');
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    expect(response.headers.get('X-Robots-Tag')).toBe('noai, noimageai');
  });
});
```

### 5. パフォーマンステスト
- ページ読み込み速度の比較
- ビルド時間の測定
- キャッシュ効率の確認

## Migration Strategy

### Phase 1: 準備段階
1. Wranglerの設定
2. GitHub Actionsの準備
3. 環境変数の移行

### Phase 2: コード変更
1. ミドルウェアの書き換え
2. Astro設定の更新
3. テストの実装

### Phase 3: テスト段階
1. ローカル環境でのテスト
2. ステージング環境でのテスト
3. パフォーマンステスト

### Phase 4: 本番移行
1. DNS設定の準備
2. 本番環境へのデプロイ
3. 動作確認とモニタリング

## Security Considerations

### 1. 環境変数の管理
- GitHub Secretsでの機密情報管理
- Workers環境変数の適切な設定
- API キーの安全な移行

### 2. セキュリティヘッダー
- 既存のセキュリティ設定の維持
- Workers環境での適切な実装
- CSP設定の最適化

### 3. アクセス制御
- Cloudflare API トークンの権限管理
- GitHub Actions の権限設定
- Workers の実行権限管理