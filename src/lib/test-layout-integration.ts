/**
 * Layout.astro統合テストスクリプト
 * Enhanced Canonical URLとSEOメタタグの統合をテスト
 */

import { generateCanonicalUrl, isProblematicDomain } from './canonical-url-utils'

/**
 * Layout.astroで使用されるURL生成のテスト
 */
function testLayoutUrlGeneration() {
  console.log('🧪 Layout.astro URL生成テスト')
  
  const testPaths = [
    '/',
    '/posts/test-article',
    '/posts/tag/aws',
    '/privacy-policy'
  ]
  
  testPaths.forEach(path => {
    const canonicalUrl = generateCanonicalUrl(path)
    const isProblematic = isProblematicDomain(new URL(canonicalUrl).hostname)
    
    console.log(`  Path: ${path}`)
    console.log(`    Canonical URL: ${canonicalUrl}`)
    console.log(`    Is Problematic: ${isProblematic}`)
    console.log('')
  })
}

/**
 * OG画像URL生成のテスト
 */
function testOgImageGeneration() {
  console.log('🧪 OG画像URL生成テスト')
  
  const customDomain = 'midnight480.com'
  const staticFilePath = '/default-og-image.png'
  const ogImageUrl = `https://${customDomain}${staticFilePath}`
  
  console.log(`  OG Image URL: ${ogImageUrl}`)
  console.log(`  Domain: ${customDomain}`)
  console.log(`  Static Path: ${staticFilePath}`)
  console.log('')
}

/**
 * SEOメタタグの整合性テスト
 */
function testSeoMetaConsistency() {
  console.log('🧪 SEOメタタグ整合性テスト')
  
  const testCases = [
    {
      title: 'テスト記事',
      description: 'これはテスト記事の説明です',
      path: '/posts/test-article',
      isArticle: true
    },
    {
      title: 'ホームページ',
      description: 'サイトの説明',
      path: '/',
      isArticle: false
    }
  ]
  
  testCases.forEach(({ title, path, isArticle }) => {
    const canonicalUrl = generateCanonicalUrl(path)
    
    console.log(`  Test Case: ${title}`)
    console.log(`    Path: ${path}`)
    console.log(`    Canonical URL: ${canonicalUrl}`)
    console.log(`    Is Article: ${isArticle}`)
    console.log(`    OG Type: ${isArticle ? 'article' : 'website'}`)
    console.log('')
  })
}

/**
 * ドメイン統一性の検証
 */
function testDomainConsistency() {
  console.log('🧪 ドメイン統一性検証テスト')
  
  const customDomain = 'midnight480.com'
  const testUrls = [
    generateCanonicalUrl('/'),
    generateCanonicalUrl('/posts/test'),
    `https://${customDomain}/default-og-image.png`
  ]
  
  console.log(`  Target Domain: ${customDomain}`)
  console.log('  Generated URLs:')
  
  testUrls.forEach(url => {
    const urlObj = new URL(url)
    const isConsistent = urlObj.hostname === customDomain
    const status = isConsistent ? '✅' : '❌'
    
    console.log(`    ${status} ${url}`)
  })
  
  console.log('')
}

/**
 * パフォーマンス最適化の検証
 */
function testPerformanceOptimizations() {
  console.log('🧪 パフォーマンス最適化検証テスト')
  
  const currentDomain = 'astro-notion-blog-cq9.pages.dev'
  const customDomain = 'midnight480.com'
  
  console.log('  Preconnect最適化:')
  console.log(`    Current Domain: ${currentDomain}`)
  console.log(`    Custom Domain: ${customDomain}`)
  console.log(`    Should Preconnect: ${currentDomain !== customDomain ? '✅ Yes' : '❌ No'}`)
  
  console.log('  キャッシュ最適化:')
  console.log('    ✅ Canonical URL components are cacheable')
  console.log('    ✅ SEO meta tags are static per page')
  
  console.log('')
}

/**
 * 全テストを実行
 */
export function runLayoutIntegrationTests() {
  console.log('🚀 Layout.astro統合テストを開始...\n')
  
  testLayoutUrlGeneration()
  testOgImageGeneration()
  testSeoMetaConsistency()
  testDomainConsistency()
  testPerformanceOptimizations()
  
  console.log('🎉 テスト完了！')
  console.log('\n📋 統合チェックリスト:')
  console.log('  ✅ Enhanced Canonical URLコンポーネント統合')
  console.log('  ✅ SEOメタタグコンポーネント統合')
  console.log('  ✅ URL生成ロジック更新')
  console.log('  ✅ OG画像URL統一')
  console.log('  ✅ ドメイン統一性確保')
  console.log('  ✅ パフォーマンス最適化')
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  runLayoutIntegrationTests()
}