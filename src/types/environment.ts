/**
 * 環境変数とCloudflare Pages関連の型定義
 */

// 基本的な環境変数の型定義
export interface EnvironmentVariables {
  // Notion関連
  NOTION_API_SECRET: string
  DATABASE_ID: string
  
  // サイト設定
  CUSTOM_DOMAIN: string
  BASE_PATH: string
  
  // Cloudflare Pages関連
  CF_PAGES?: string
  CF_PAGES_URL?: string
  CF_PAGES_BRANCH?: string
  
  // Analytics
  PUBLIC_GA_TRACKING_ID?: string
  
  // 機能フラグ
  ENABLE_LIGHTBOX?: string
  PUBLIC_ENABLE_COMMENTS?: string
  
  // Giscus設定
  PUBLIC_GISCUS_REPO?: string
  PUBLIC_GISCUS_REPO_ID?: string
  PUBLIC_GISCUS_CATEGORY?: string
  PUBLIC_GISCUS_CATEGORY_ID?: string
  
  // その他
  REQUEST_TIMEOUT_MS?: string
}

// Cloudflare Pages Functions用の環境変数
export interface CloudflareEnv {
  CUSTOM_DOMAIN?: string
  CF_PAGES?: string
  CF_PAGES_URL?: string
  CF_PAGES_BRANCH?: string
}

// SEO設定の型定義
export interface SeoConfig {
  customDomain: string
  forceHttps: boolean
  enableCanonicalRedirect: boolean
  defaultOgImage: string
}

// リダイレクト設定の型定義
export interface RedirectConfig {
  sourcePattern: RegExp
  targetDomain: string
  statusCode: number
  preservePath: boolean
  preserveQuery: boolean
}

// Robots.txt設定の型定義
export interface RobotsConfig {
  customDomain: string
  allowedBots: string[]
  disallowedBots: string[]
  crawlDelay: number
  cacheMaxAge: {
    normal: number
    restrictive: number
  }
}

// Canonical URL設定の型定義
export interface CanonicalUrlConfig {
  customDomain: string
  forceHttps: boolean
  preserveQuery: boolean
  normalizeTrailingSlash: boolean
}

// ドメイン判定結果の型定義
export interface DomainAnalysis {
  hostname: string
  isCustomDomain: boolean
  isCloudflarePages: boolean
  isProblematic: boolean
  shouldRedirect: boolean
}

// デバッグ情報の型定義
export interface DebugInfo {
  originalUrl: string
  canonicalUrl: string
  config: CanonicalUrlConfig
  isValid: boolean
  isProblematic: boolean
  timestamp: string
}

// Astro.env の型拡張
declare global {
  interface ImportMetaEnv extends EnvironmentVariables {
    // 追加のプロパティがある場合はここに定義
    readonly MODE: string
    readonly PROD: boolean
    readonly DEV: boolean
    readonly SSR: boolean
  }
}