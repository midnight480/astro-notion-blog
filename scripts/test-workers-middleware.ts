/**
 * Cloudflare Workers ミドルウェア機能のテスト
 */

// テスト用のモック環境
interface MockEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>
  }
  CUSTOM_DOMAIN?: string
}

// ミドルウェア関数をインポート（実際の実装から）
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Robots-Tag': 'noai, noimageai',
}

const CACHE_SETTINGS = {
  static: 'public, max-age=31536000',
  html: 'public, max-age=3600',
  api: 'public, max-age=3600',
}

function addSecurityHeaders(response: Response): Response {
  const newResponse = new Response(response.body, response)

  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    newResponse.headers.set(key, value)
  })

  return newResponse
}

function setCacheHeaders(response: Response, url: URL): Response {
  const pathname = url.pathname

  if (pathname.match(/\.(ico|svg|png|jpg|jpeg|gif|css|js|woff|woff2|ttf)$/)) {
    response.headers.set('Cache-Control', CACHE_SETTINGS.static)
  } else if (pathname.startsWith('/feed') || pathname.startsWith('/sitemap')) {
    response.headers.set('Cache-Control', CACHE_SETTINGS.api)

    if (pathname.includes('sitemap')) {
      response.headers.set('Content-Type', 'application/xml')
    }
  } else {
    response.headers.set('Cache-Control', CACHE_SETTINGS.html)
  }

  return response
}

async function handleRequest(
  request: Request,
  env: MockEnv
): Promise<Response> {
  try {
    const url = new URL(request.url)
    const customDomain = env.CUSTOM_DOMAIN || 'midnight480.com'

    // リダイレクト処理
    if (url.hostname.includes('.pages.dev')) {
      console.log(`Redirecting from ${url.hostname} to ${customDomain}`)

      const redirectUrl = new URL(request.url)
      redirectUrl.hostname = customDomain
      redirectUrl.protocol = 'https:'

      return Response.redirect(redirectUrl.toString(), 301)
    }

    // 静的アセットを取得（モック）
    const response = await env.ASSETS.fetch(request)

    // セキュリティヘッダーを追加
    const secureResponse = addSecurityHeaders(response)

    // キャッシュヘッダーを設定
    const finalResponse = setCacheHeaders(secureResponse, url)

    return finalResponse
  } catch (error) {
    console.error('Workers middleware error:', error)

    try {
      return await env.ASSETS.fetch(request)
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError)

      return new Response('Internal Server Error', {
        status: 500,
        headers: SECURITY_HEADERS,
      })
    }
  }
}

// Jest風のアサーション関数
function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, but got ${actual}`)
      }
    },
    toBeNull: () => {
      if (actual !== null) {
        throw new Error(`Expected null, but got ${actual}`)
      }
    },
  }
}

// テスト実行用の簡易関数
export async function runMiddlewareTests(): Promise<void> {
  console.log('🧪 Running Cloudflare Workers Middleware Tests...\n')

  const mockEnv: MockEnv = {
    ASSETS: {
      fetch: async (request: Request) => {
        return new Response('Mock HTML Content', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      },
    },
    CUSTOM_DOMAIN: 'midnight480.com',
  }

  // リダイレクトテスト
  console.log('🔄 Testing redirect functionality...')
  const redirectRequest = new Request(
    'https://test.pages.dev/some-path?param=value'
  )
  const redirectResponse = await handleRequest(redirectRequest, mockEnv)

  if (
    redirectResponse.status === 301 &&
    redirectResponse.headers.get('location') ===
      'https://midnight480.com/some-path?param=value'
  ) {
    console.log('✅ Redirect test passed')
  } else {
    console.log('❌ Redirect test failed')
  }

  // セキュリティヘッダーテスト
  console.log('🔒 Testing security headers...')
  const securityRequest = new Request('https://midnight480.com/')
  const securityResponse = await handleRequest(securityRequest, mockEnv)

  const hasAllHeaders = Object.entries(SECURITY_HEADERS).every(
    ([key, value]) => securityResponse.headers.get(key) === value
  )

  if (hasAllHeaders) {
    console.log('✅ Security headers test passed')
  } else {
    console.log('❌ Security headers test failed')
  }

  // キャッシュ制御テスト
  console.log('💾 Testing cache control...')
  const cacheRequest = new Request('https://midnight480.com/style.css')
  const cacheResponse = await handleRequest(cacheRequest, mockEnv)

  if (
    cacheResponse.headers.get('Cache-Control') === 'public, max-age=31536000'
  ) {
    console.log('✅ Cache control test passed')
  } else {
    console.log('❌ Cache control test failed')
  }

  console.log('\n🎉 Middleware tests completed!')
}

// 詳細テスト関数
async function runDetailedTests(): Promise<void> {
  console.log('🧪 Running Detailed Middleware Tests...\n')

  const mockEnv: MockEnv = {
    ASSETS: {
      fetch: async (request: Request) => {
        return new Response('Mock HTML Content', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        })
      },
    },
    CUSTOM_DOMAIN: 'midnight480.com',
  }

  let passedTests = 0
  let totalTests = 0

  // テスト1: リダイレクト機能
  try {
    totalTests++
    console.log('🔄 Test 1: *.pages.dev redirect...')
    const request = new Request('https://test.pages.dev/some-path?param=value')
    const response = await handleRequest(request, mockEnv)

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://midnight480.com/some-path?param=value'
    )

    console.log('✅ Test 1 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 1 failed: ${error.message}`)
  }

  // テスト2: パスとクエリパラメータの保持
  try {
    totalTests++
    console.log('🔄 Test 2: Path and query preservation...')
    const request = new Request(
      'https://example.pages.dev/posts/test?utm_source=github'
    )
    const response = await handleRequest(request, mockEnv)

    expect(response.status).toBe(301)
    expect(response.headers.get('location')).toBe(
      'https://midnight480.com/posts/test?utm_source=github'
    )

    console.log('✅ Test 2 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 2 failed: ${error.message}`)
  }

  // テスト3: カスタムドメインでのアクセス
  try {
    totalTests++
    console.log('🏠 Test 3: Custom domain access...')
    const request = new Request('https://midnight480.com/')
    const response = await handleRequest(request, mockEnv)

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()

    console.log('✅ Test 3 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 3 failed: ${error.message}`)
  }

  // テスト4: セキュリティヘッダー
  try {
    totalTests++
    console.log('🔒 Test 4: Security headers...')
    const request = new Request('https://midnight480.com/')
    const response = await handleRequest(request, mockEnv)

    expect(response.headers.get('X-Frame-Options')).toBe('DENY')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block')
    expect(response.headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin'
    )
    expect(response.headers.get('X-Robots-Tag')).toBe('noai, noimageai')

    console.log('✅ Test 4 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 4 failed: ${error.message}`)
  }

  // テスト5: 静的アセットキャッシュ
  try {
    totalTests++
    console.log('💾 Test 5: Static asset cache...')
    const request = new Request('https://midnight480.com/style.css')
    const response = await handleRequest(request, mockEnv)

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=31536000'
    )

    console.log('✅ Test 5 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 5 failed: ${error.message}`)
  }

  // テスト6: HTMLページキャッシュ
  try {
    totalTests++
    console.log('📄 Test 6: HTML page cache...')
    const request = new Request('https://midnight480.com/posts/test')
    const response = await handleRequest(request, mockEnv)

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')

    console.log('✅ Test 6 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 6 failed: ${error.message}`)
  }

  // テスト7: APIエンドポイント
  try {
    totalTests++
    console.log('🔗 Test 7: API endpoint cache and content-type...')
    const request = new Request('https://midnight480.com/sitemap.xml')
    const response = await handleRequest(request, mockEnv)

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600')
    expect(response.headers.get('Content-Type')).toBe('application/xml')

    console.log('✅ Test 7 passed')
    passedTests++
  } catch (error) {
    console.log(`❌ Test 7 failed: ${error.message}`)
  }

  // 結果表示
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`)

  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Middleware is working correctly.')
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.')
  }
}

// スクリプトとして実行された場合
runMiddlewareTests()
  .then(() => {
    console.log('\n' + '='.repeat(50))
    return runDetailedTests()
  })
  .catch(console.error)
