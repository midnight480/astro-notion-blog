import type { APIRoute } from 'astro'
import { 
  ROBOTS_CONFIG, 
  generateNormalRobotsTxt, 
  generateRestrictiveRobotsTxt,
  isCloudflarePagesDomain 
} from '../lib/robots-config'

/**
 * 動的robots.txt生成
 * アクセス元ドメインに応じて異なるrobots.txtを配信
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url)
    
    // Cloudflareの独自ドメイン（*.pages.dev）からのアクセスを検出
    if (isCloudflarePagesDomain(url.hostname)) {
      // Cloudflareドメインの場合は制限的なrobots.txt
      const restrictiveRobotsTxt = generateRestrictiveRobotsTxt(ROBOTS_CONFIG)
      
      return new Response(restrictiveRobotsTxt, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': `public, max-age=${ROBOTS_CONFIG.cacheMaxAge.restrictive}`
        }
      })
    }
    
    // カスタムドメインの場合は通常のrobots.txt
    const normalRobotsTxt = generateNormalRobotsTxt(ROBOTS_CONFIG)
    
    return new Response(normalRobotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': `public, max-age=${ROBOTS_CONFIG.cacheMaxAge.normal}`
      }
    })
    
  } catch (error) {
    // エラーが発生した場合はデフォルトのrobots.txtを返す
    console.error('Error generating robots.txt:', error)
    
    const fallbackRobotsTxt = `User-agent: *
Allow: /

Sitemap: https://midnight480.com/sitemap.xml`

    return new Response(fallbackRobotsTxt, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
}