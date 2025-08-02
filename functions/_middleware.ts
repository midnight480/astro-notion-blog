/**
 * Cloudflare Workers Middleware
 * Cloudflareの独自ドメイン（*.pages.dev）からカスタムドメインへの301リダイレクトを実行
 * セキュリティヘッダーとキャッシュ制御も設定
 */

interface Env {
  ASSETS: Fetcher
  CUSTOM_DOMAIN?: string
}

// セキュリティヘッダーの定義
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Robots-Tag': 'noai, noimageai',
}

// キャッシュ設定の定義
const CACHE_SETTINGS = {
  // 静的アセット
  static: 'public, max-age=31536000', // 1年
  // HTMLページ
  html: 'public, max-age=3600', // 1時間
  // API レスポンス
  api: 'public, max-age=3600', // 1時間
}

/**
 * レスポンスにセキュリティヘッダーを追加
 */
function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response)

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value)
  })

  return newResponse
}

/**
 * キャッシュ制御ヘッダーを設定
 */
function setCacheHeaders(response: Response, url: URL): Response {
  const pathname = url.pathname

  // 静的アセット（画像、CSS、JS等）
  if (pathname.match(/\.(ico|svg|png|jpg|jpeg|gif|css|js|woff|woff2|ttf)$/)) {
    response.headers.set('Cache-Control', CACHE_SETTINGS.static)
  }
  // API エンドポイント
  else if (pathname.startsWith('/feed') || pathname.startsWith('/sitemap')) {
    response.headers.set('Cache-Control', CACHE_SETTINGS.api)

    // XMLコンテンツタイプの設定
    if (pathname.includes('sitemap')) {
      response.headers.set('Content-Type', 'application/xml')
    }
  }
  // HTMLページ
  else {
    response.headers.set('Cache-Control', CACHE_SETTINGS.html)
  }

  return response
}

/**
 * Workers メイン関数
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    try {
      const url = new URL(request.url)

      // カスタムドメインを環境変数から取得、フォールバックとして midnight480.com を使用
      const customDomain = env.CUSTOM_DOMAIN || 'midnight480.com'

      // Cloudflareの独自ドメイン（*.pages.dev）からのアクセスを検出
      if (url.hostname.includes('.pages.dev')) {
        console.log(`Redirecting from ${url.hostname} to ${customDomain}`)

        // リダイレクト先URLを構築（パスとクエリパラメータを保持）
        const redirectUrl = new URL(request.url)
        redirectUrl.hostname = customDomain
        redirectUrl.protocol = 'https:'

        // 301 Permanent Redirectを実行
        return Response.redirect(redirectUrl.toString(), 301)
      }

      // 静的アセットを取得
      const response = await env.ASSETS.fetch(request)

      // セキュリティヘッダーを追加
      const secureResponse = addSecurityHeaders(response)

      // キャッシュヘッダーを設定
      const finalResponse = setCacheHeaders(secureResponse, url)

      return finalResponse
    } catch (error) {
      // エラーが発生した場合はログ出力してフォールバック処理
      console.error('Workers middleware error:', error)

      try {
        // フォールバック: 静的アセットを直接返す
        return await env.ASSETS.fetch(request)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)

        // 最終フォールバック: 500エラーを返す
        return new Response('Internal Server Error', {
          status: 500,
          headers: SECURITY_HEADERS,
        })
      }
    }
  },
}
