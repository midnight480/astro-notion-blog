/**
 * Cloudflare Pages Functions Middleware
 * Cloudflareの独自ドメイン（*.pages.dev）からカスタムドメインへの301リダイレクトを実行
 */

interface Env {
  CUSTOM_DOMAIN?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  try {
    const { request, env, next } = context;
    const url = new URL(request.url);
    
    // カスタムドメインを環境変数から取得、フォールバックとして midnight480.com を使用
    const customDomain = env.CUSTOM_DOMAIN || 'midnight480.com';
    
    // Cloudflareの独自ドメイン（*.pages.dev）からのアクセスを検出
    if (url.hostname.includes('.pages.dev')) {
      console.log(`Redirecting from ${url.hostname} to ${customDomain}`);
      
      // リダイレクト先URLを構築（パスとクエリパラメータを保持）
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = customDomain;
      redirectUrl.protocol = 'https:';
      
      // 301 Permanent Redirectを実行
      return Response.redirect(redirectUrl.toString(), 301);
    }
    
    // カスタムドメインでのアクセスの場合は通常処理を継続
    return next();
    
  } catch (error) {
    // エラーが発生した場合はログ出力してオリジナルレスポンスを返す
    console.error('Middleware error:', error);
    return context.next();
  }
};