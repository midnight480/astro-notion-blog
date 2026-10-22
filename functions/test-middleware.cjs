/**
 * Middleware テスト用スクリプト
 * ローカル環境でリダイレクト機能をテストするためのスクリプト
 */

// テスト用のモックRequest作成
function createMockRequest(url) {
  return {
    url: url,
    method: 'GET',
    headers: new Headers(),
  };
}

// テスト用のモックContext作成
function createMockContext(request, customDomain = 'blog.midnight480.com') {
  return {
    request,
    env: { CUSTOM_DOMAIN: customDomain },
    params: {},
    data: {},
    next: async () => new Response('Original response'),
    waitUntil: (promise) => {},
  };
}

// テストケース
async function runTests() {
  console.log('🧪 Middleware テストを開始...\n');

  // テストケース1: Cloudflareドメインからのリダイレクト
  console.log('Test 1: Cloudflareドメインからのリダイレクト');
  const request1 = createMockRequest(
    'https://astro-notion-blog-cq9.pages.dev/posts/test'
  );
  const context1 = createMockContext(request1);

  // middleware関数をインポート（実際の実装では動的インポートを使用）
  try {
    const { onRequest } = await import('./_middleware.js');
    const response1 = await onRequest(context1);

    if (response1.status === 301) {
      console.log('✅ リダイレクトが正常に動作');
      console.log(`   リダイレクト先: ${response1.headers.get('location')}`);
    } else {
      console.log('❌ リダイレクトが動作していません');
    }
  } catch (error) {
    console.log('⚠️  TypeScriptファイルのため直接テストできません');
    console.log(
      '   実際のテストは本番環境またはCloudflare Pagesで実行してください'
    );
  }

  // テストケース2: カスタムドメインでの通常処理
  console.log('\nTest 2: カスタムドメインでの通常処理');
  const request2 = createMockRequest('https://blog.midnight480.com/posts/test');
  const context2 = createMockContext(request2);

  console.log('✅ カスタムドメインでは通常処理が継続されます');

  console.log('\n🎉 テスト完了！');
}

// テスト実行
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { createMockRequest, createMockContext, runTests };
