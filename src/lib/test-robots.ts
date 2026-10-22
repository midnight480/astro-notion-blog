/**
 * Robots.txt動的生成のテストスクリプト
 */

import {
  ROBOTS_CONFIG,
  generateNormalRobotsTxt,
  generateRestrictiveRobotsTxt,
  isCloudflarePagesDomain,
} from './robots-config'

/**
 * ドメイン判定のテスト
 */
function testDomainDetection() {
  console.log('🧪 ドメイン判定テスト')

  const testCases = [
    { hostname: 'astro-notion-blog-cq9.pages.dev', expected: true },
    { hostname: 'my-site.pages.dev', expected: true },
    { hostname: 'blog.midnight480.com', expected: false },
    { hostname: 'www.midnight480.com', expected: false },
    { hostname: 'example.com', expected: false },
  ]

  testCases.forEach(({ hostname, expected }) => {
    const result = isCloudflarePagesDomain(hostname)
    const status = result === expected ? '✅' : '❌'
    console.log(`  ${status} ${hostname} -> ${result} (expected: ${expected})`)
  })

  console.log('')
}

/**
 * robots.txt生成のテスト
 */
function testRobotsGeneration() {
  console.log('🧪 Robots.txt生成テスト')

  console.log('📄 通常のrobots.txt:')
  console.log('---')
  console.log(generateNormalRobotsTxt(ROBOTS_CONFIG))
  console.log('---\n')

  console.log('📄 制限的なrobots.txt:')
  console.log('---')
  console.log(generateRestrictiveRobotsTxt(ROBOTS_CONFIG))
  console.log('---\n')
}

/**
 * 設定の検証
 */
function testConfiguration() {
  console.log('🧪 設定検証テスト')

  console.log(`  カスタムドメイン: ${ROBOTS_CONFIG.customDomain}`)
  console.log(`  許可ボット数: ${ROBOTS_CONFIG.allowedBots.length}`)
  console.log(`  禁止ボット数: ${ROBOTS_CONFIG.disallowedBots.length}`)
  console.log(`  クロール遅延: ${ROBOTS_CONFIG.crawlDelay}秒`)
  console.log(`  通常キャッシュ: ${ROBOTS_CONFIG.cacheMaxAge.normal}秒`)
  console.log(`  制限キャッシュ: ${ROBOTS_CONFIG.cacheMaxAge.restrictive}秒`)

  console.log('')
}

/**
 * 全テストを実行
 */
export function runRobotsTests() {
  console.log('🚀 Robots.txt動的生成テストを開始...\n')

  testDomainDetection()
  testConfiguration()
  testRobotsGeneration()

  console.log('🎉 テスト完了！')
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  runRobotsTests()
}
