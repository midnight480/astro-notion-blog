/**
 * Canonical URL関連のユーティリティ関数
 */

import { CUSTOM_DOMAIN } from '../server-constants'

export interface CanonicalUrlConfig {
  customDomain: string
  forceHttps: boolean
  preserveQuery: boolean
  normalizeTrailingSlash: boolean
}

export const DEFAULT_CANONICAL_CONFIG: CanonicalUrlConfig = {
  customDomain: CUSTOM_DOMAIN || 'midnight480.com',
  forceHttps: true,
  preserveQuery: false, // SEOのためクエリパラメータは除外
  normalizeTrailingSlash: true
}

/**
 * Canonical URLを生成
 */
export function generateCanonicalUrl(
  path: string, 
  config: Partial<CanonicalUrlConfig> = {}
): string {
  const finalConfig = { ...DEFAULT_CANONICAL_CONFIG, ...config }
  
  // パスの正規化
  let normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // 末尾スラッシュの正規化
  if (finalConfig.normalizeTrailingSlash) {
    // ルートパス以外で末尾スラッシュを削除
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1)
    }
  }
  
  // プロトコルの決定
  const protocol = finalConfig.forceHttps ? 'https:' : 'http:'
  
  // Canonical URLの構築
  return `${protocol}//${finalConfig.customDomain}${normalizedPath}`
}

/**
 * 現在のURLがカスタムドメインかどうかを判定
 */
export function isCustomDomain(hostname: string, customDomain?: string): boolean {
  const targetDomain = customDomain || DEFAULT_CANONICAL_CONFIG.customDomain
  return hostname === targetDomain || hostname === `www.${targetDomain}`
}

/**
 * CloudflareのPages.devドメインかどうかを判定
 */
export function isCloudflarePagesDomain(hostname: string): boolean {
  return hostname.includes('.pages.dev')
}

/**
 * SEO的に問題のあるドメインかどうかを判定
 */
export function isProblematicDomain(hostname: string, customDomain?: string): boolean {
  return isCloudflarePagesDomain(hostname) || !isCustomDomain(hostname, customDomain)
}

/**
 * URLからクエリパラメータを除去
 */
export function removeQueryParams(url: string): string {
  try {
    const urlObj = new URL(url)
    return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`
  } catch {
    // URLが不正な場合はそのまま返す
    return url
  }
}

/**
 * パスの正規化（重複スラッシュの除去など）
 */
export function normalizePath(path: string): string {
  return path
    .replace(/\/+/g, '/') // 重複スラッシュを単一に
    .replace(/\/$/, '') || '/' // 末尾スラッシュを除去（ルート以外）
}

/**
 * Canonical URLの検証
 */
export function validateCanonicalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return (
      urlObj.protocol === 'https:' &&
      urlObj.hostname.length > 0 &&
      !urlObj.hostname.includes('.pages.dev') &&
      urlObj.pathname.startsWith('/')
    )
  } catch {
    return false
  }
}

/**
 * デバッグ情報の生成
 */
export function generateDebugInfo(
  originalUrl: string,
  canonicalUrl: string,
  config: CanonicalUrlConfig
) {
  return {
    originalUrl,
    canonicalUrl,
    config,
    isValid: validateCanonicalUrl(canonicalUrl),
    isProblematic: isProblematicDomain(new URL(originalUrl).hostname, config.customDomain),
    timestamp: new Date().toISOString()
  }
}