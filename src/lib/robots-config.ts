/**
 * Robots.txt設定の一元管理
 */

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

export const ROBOTS_CONFIG: RobotsConfig = {
  customDomain: 'midnight480.com',

  // 許可する検索エンジンボット
  allowedBots: ['Googlebot', 'Bingbot'],

  // 禁止するAIボット
  disallowedBots: [
    'GPTBot',
    'ChatGPT-User',
    'CCBot',
    'anthropic-ai',
    'Claude-Web',
    'PerplexityBot',
    'YouBot',
    'Meta-ExternalAgent',
    'FacebookBot',
  ],

  // クロール遅延（秒）
  crawlDelay: 1,

  // キャッシュ時間（秒）
  cacheMaxAge: {
    normal: 86400, // 24時間
    restrictive: 3600, // 1時間
  },
}

/**
 * 通常のrobots.txtを生成
 */
export function generateNormalRobotsTxt(config: RobotsConfig): string {
  const { customDomain, allowedBots, disallowedBots, crawlDelay } = config

  let robotsTxt = `User-agent: *
Allow: /

# SEO-friendly crawling
`

  // 許可するボット
  allowedBots.forEach((bot) => {
    robotsTxt += `User-agent: ${bot}
Allow: /

`
  })

  robotsTxt += `# AI Bot restrictions
`

  // 禁止するボット
  disallowedBots.forEach((bot) => {
    robotsTxt += `User-agent: ${bot}
Disallow: /

`
  })

  robotsTxt += `# Crawl-delay for heavy crawlers
User-agent: *
Crawl-delay: ${crawlDelay}

# Sitemap location
Sitemap: https://${customDomain}/sitemap.xml`

  return robotsTxt
}

/**
 * 制限的なrobots.txtを生成（Cloudflareドメイン用）
 */
export function generateRestrictiveRobotsTxt(config: RobotsConfig): string {
  const { customDomain, disallowedBots } = config

  let robotsTxt = `User-agent: *
Disallow: /

# This site has moved to the canonical domain
# Please visit: https://${customDomain}

# AI Bot restrictions (extra strict)
`

  // 禁止するボット（より厳格）
  disallowedBots.forEach((bot) => {
    robotsTxt += `User-agent: ${bot}
Disallow: /

`
  })

  robotsTxt += `# Canonical sitemap location
Sitemap: https://${customDomain}/sitemap.xml`

  return robotsTxt
}

/**
 * ドメインがCloudflareの独自ドメインかどうかを判定
 */
export function isCloudflarePagesDomain(hostname: string): boolean {
  return hostname.includes('.pages.dev')
}
