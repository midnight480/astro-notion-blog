# Design Document

## Overview

この設計では、Cloudflareの独自ドメイン（`astro-notion-blog-cq9.pages.dev`）から本来のカスタムドメイン（`midnight480.com`）への適切なリダイレクトとcanonical URL設定を実装し、SEOの重複コンテンツ問題を解決する。

現在の状況分析：
- Astroの設定では既にCUSTOM_DOMAINが設定されている
- sitemap.xmlは正しく`midnight480.com`を使用している
- Layout.astroには既にcanonical URLが設定されている
- robots.txtも適切に設定されている

しかし、Cloudflareの独自ドメインからのリダイレクトが設定されていないため、検索エンジンが両方のドメインをインデックスしてしまっている。

## Architecture

### 1. リダイレクト戦略

**Cloudflare Pages Functions を使用したエッジレベルでのリダイレクト**
- `functions/_middleware.ts` を作成してCloudflare Pages Functionsを活用
- エッジレベルで301リダイレクトを実行し、サーバーレスポンスを最適化
- 全てのパスとクエリパラメータを保持してリダイレクト

### 2. Canonical URL の強化

**動的なCanonical URL生成**
- 現在のLayout.astroのcanonical URL設定を強化
- アクセス元のドメインに関係なく、常にカスタムドメインを指すように設定
- 環境変数を活用した柔軟な設定

### 3. Robots.txt の最適化

**ドメイン別のrobots.txt配信**
- Cloudflareドメインでアクセスされた場合は制限的なrobots.txtを配信
- カスタムドメインでは通常のrobots.txtを配信
- 動的生成によるドメイン判定

## Components and Interfaces

### 1. Cloudflare Pages Functions Middleware

```typescript
// functions/_middleware.ts
interface Env {
  CUSTOM_DOMAIN?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const customDomain = env.CUSTOM_DOMAIN || 'midnight480.com';
  
  // Cloudflareの独自ドメインからのアクセスを検出
  if (url.hostname.includes('.pages.dev')) {
    const redirectUrl = new URL(request.url);
    redirectUrl.hostname = customDomain;
    
    return Response.redirect(redirectUrl.toString(), 301);
  }
  
  return context.next();
};
```

### 2. 動的Robots.txt生成

```typescript
// src/pages/robots.txt.ts
export const GET: APIRoute = async ({ request, site }) => {
  const url = new URL(request.url);
  const customDomain = 'midnight480.com';
  
  // Cloudflareドメインの場合は制限的なrobots.txt
  if (url.hostname.includes('.pages.dev')) {
    return new Response(`User-agent: *
Disallow: /

# Redirect to canonical domain
# This site has moved to https://${customDomain}
`, {
      headers: { 'Content-Type': 'text/plain' }
    });
  }
  
  // カスタムドメインの場合は通常のrobots.txt
  return new Response(normalRobotsTxt, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
```

### 3. Enhanced Canonical URL Component

```astro
---
// src/components/CanonicalUrl.astro
export interface Props {
  path: string;
}

const { path } = Astro.props;
const customDomain = 'midnight480.com';
const canonicalUrl = `https://${customDomain}${path}`;
---

<link rel="canonical" href={canonicalUrl} />
```

### 4. SEO Meta Tags Enhancement

```astro
---
// Layout.astroの強化
const customDomain = 'midnight480.com';
const canonicalUrl = `https://${customDomain}${path}`;
const siteURL = canonicalUrl; // 常にカスタムドメインを使用
---

<!-- Canonical URL (強化版) -->
<link rel="canonical" href={canonicalUrl} />

<!-- Open Graph URLs (強化版) -->
<meta property="og:url" content={canonicalUrl} />

<!-- Additional SEO signals -->
<meta name="alternate" content={canonicalUrl} />
```

## Data Models

### Environment Variables
```typescript
interface EnvironmentConfig {
  CUSTOM_DOMAIN: string;           // 'midnight480.com'
  CF_PAGES?: string;               // Cloudflare Pages環境判定
  CF_PAGES_URL?: string;           // Cloudflare Pages URL
  CF_PAGES_BRANCH?: string;        // ブランチ名
}
```

### Redirect Configuration
```typescript
interface RedirectConfig {
  sourcePattern: RegExp;           // /\.pages\.dev$/
  targetDomain: string;            // 'midnight480.com'
  statusCode: number;              // 301
  preservePath: boolean;           // true
  preserveQuery: boolean;          // true
}
```

## Error Handling

### 1. Middleware Error Handling
- リダイレクト処理中のエラーをキャッチ
- フォールバック処理でオリジナルレスポンスを返す
- ログ出力による問題の追跡

### 2. Canonical URL Fallback
- CUSTOM_DOMAIN環境変数が未設定の場合のフォールバック
- 不正なURL形式の場合の処理
- デフォルトドメインの設定

### 3. Robots.txt Error Handling
- ドメイン判定失敗時のデフォルト動作
- 設定ファイル読み込みエラーの処理

## Testing Strategy

### 1. Unit Tests
- Canonical URL生成ロジックのテスト
- ドメイン判定ロジックのテスト
- リダイレクトURL生成のテスト

### 2. Integration Tests
- Cloudflare Pages Functionsのローカルテスト
- 異なるドメインでのアクセステスト
- robots.txtの動的生成テスト

### 3. E2E Tests
- 実際のCloudflareドメインからのリダイレクトテスト
- 検索エンジンクローラーの動作確認
- Canonical URLの検証

### 4. SEO Validation
- Google Search Consoleでの重複コンテンツ確認
- リダイレクトチェーンの検証
- インデックス状況の監視

## Implementation Considerations

### 1. Cloudflare Pages Functions
- エッジレベルでの高速リダイレクト
- 追加のサーバーコストなし
- 自動的なグローバル配信

### 2. SEO Impact
- 301リダイレクトによるSEO価値の転送
- Canonical URLによる重複コンテンツ解決
- 段階的なインデックス移行

### 3. Performance
- エッジでのリダイレクトによる高速化
- キャッシュ効率の向上
- CDN最適化の活用

### 4. Monitoring
- リダイレクト率の監視
- 検索エンジンのクロール状況確認
- エラー率の追跡

## Migration Strategy

### Phase 1: リダイレクト実装
1. Cloudflare Pages Functions middlewareの実装
2. 動的robots.txtの実装
3. テスト環境での検証

### Phase 2: SEO最適化
1. Enhanced canonical URLの実装
2. メタタグの最適化
3. sitemap.xmlの再確認

### Phase 3: 監視と最適化
1. Google Search Consoleでの監視設定
2. リダイレクト効果の測定
3. 必要に応じた調整

この設計により、Cloudflareの独自ドメインからカスタムドメインへの適切なリダイレクトが実現され、SEOの重複コンテンツ問題が解決される。