/**
 * Cloudflare Pages Functions の型定義
 */

interface PagesFunction<Env = any> {
  (context: {
    request: Request
    env: Env
    params: Record<string, string>
    data: Record<string, any>
    next: () => Promise<Response>
    waitUntil: (promise: Promise<any>) => void
  }): Promise<Response> | Response
}

// グローバル型定義
declare global {
  interface CloudflareEnv {
    CUSTOM_DOMAIN?: string
    CF_PAGES?: string
    CF_PAGES_URL?: string
    CF_PAGES_BRANCH?: string
  }
}
