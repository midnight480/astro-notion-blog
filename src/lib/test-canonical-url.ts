/**
 * Canonical URL機能のテストスクリプト
 */

import {
  generateCanonicalUrl,
  isCustomDomain,
  isCloudflarePagesDomain,
  isProblematicDomain,
  removeQueryParams,
  normalizePath,
  validateCanonicalUrl,
  generateDebugInfo,
  DEFAULT_CANONICAL_CONFIG
} from './canonical-url-utils'

/**
 * Canonical URL生成のテスト
 */
function testCanonicalUrlGeneration() {
  console.log('🧪 Canonical URL生成テスト')
  
  const testCases = [
    { path: '/', expected: 'https://midnight480.com/' },
    { path: '/posts/test', expected: 'https://midnight480.com/posts/test' },
    { path: '/posts/test/', expected: 'https://midnight480.com/posts/test' },
    { path: 'posts/test', expected: 'https://midnight480.com/posts/test' },
    { path: '/posts//test/', expected: 'https://midnight480.com/posts/test' }
  ]
  
  testCases.forEach(({ path, expected }) => {
    const result = generateCanonicalUrl(path)
    const status = result === expected ? '✅' : '❌'
    console.log(`  ${status} "${path}" -> "${result}"`)
    if (result !== expected) {
      console.log(`      Expected: "${expected}"`)
    }
  })
  
  console.log('')
}

/**
 * ドメイン判定のテスト
 */
function testDomainDetection() {
  console.log('🧪 ドメイン判定テスト')
  
  const testCases = [
    { 
      hostname: 'midnight480.com', 
      isCustom: true, 
      isCloudflare: false, 
      isProblematic: false 
    },
    { 
      hostname: 'www.midnight480.com', 
      isCustom: true, 
      isCloudflare: false, 
      isProblematic: false 
    },
    { 
      hostname: 'astro-notion-blog-cq9.pages.dev', 
      isCustom: false, 
      isCloudflare: true, 
      isProblematic: true 
    },
    { 
      hostname: 'example.com', 
      isCustom: false, 
      isCloudflare: false, 
      isProblematic: true 
    }
  ]
  
  testCases.forEach(({ hostname, isCustom, isCloudflare, isProblematic }) => {
    const customResult = isCustomDomain(hostname)
    const cloudflareResult = isCloudflarePagesDomain(hostname)
    const problematicResult = isProblematicDomain(hostname)
    
    const customStatus = customResult === isCustom ? '✅' : '❌'
    const cloudflareStatus = cloudflareResult === isCloudflare ? '✅' : '❌'
    const problematicStatus = problematicResult === isProblematic ? '✅' : '❌'
    
    console.log(`  ${hostname}:`)
    console.log(`    ${customStatus} Custom: ${customResult} (expected: ${isCustom})`)
    console.log(`    ${cloudflareStatus} Cloudflare: ${cloudflareResult} (expected: ${isCloudflare})`)
    console.log(`    ${problematicStatus} Problematic: ${problematicResult} (expected: ${isProblematic})`)
  })
  
  console.log('')
}

/**
 * URL正規化のテスト
 */
function testUrlNormalization() {
  console.log('🧪 URL正規化テスト')
  
  const pathTests = [
    { input: '/posts//test/', expected: '/posts/test' },
    { input: '///posts/test///', expected: '/posts/test' },
    { input: '/', expected: '/' },
    { input: '', expected: '/' }
  ]
  
  console.log('  パス正規化:')
  pathTests.forEach(({ input, expected }) => {
    const result = normalizePath(input)
    const status = result === expected ? '✅' : '❌'
    console.log(`    ${status} "${input}" -> "${result}"`)
  })
  
  const queryTests = [
    { 
      input: 'https://midnight480.com/posts/test?utm_source=twitter', 
      expected: 'https://midnight480.com/posts/test' 
    },
    { 
      input: 'https://midnight480.com/posts/test?a=1&b=2', 
      expected: 'https://midnight480.com/posts/test' 
    }
  ]
  
  console.log('  クエリパラメータ除去:')
  queryTests.forEach(({ input, expected }) => {
    const result = removeQueryParams(input)
    const status = result === expected ? '✅' : '❌'
    console.log(`    ${status} "${input}" -> "${result}"`)
  })
  
  console.log('')
}

/**
 * URL検証のテスト
 */
function testUrlValidation() {
  console.log('🧪 URL検証テスト')
  
  const testCases = [
    { url: 'https://midnight480.com/', expected: true },
    { url: 'https://midnight480.com/posts/test', expected: true },
    { url: 'http://midnight480.com/', expected: false }, // HTTPは無効
    { url: 'https://astro-notion-blog-cq9.pages.dev/', expected: false }, // Cloudflareドメインは無効
    { url: 'invalid-url', expected: false }
  ]
  
  testCases.forEach(({ url, expected }) => {
    const result = validateCanonicalUrl(url)
    const status = result === expected ? '✅' : '❌'
    console.log(`  ${status} "${url}" -> ${result} (expected: ${expected})`)
  })
  
  console.log('')
}

/**
 * デバッグ情報生成のテスト
 */
function testDebugInfo() {
  console.log('🧪 デバッグ情報生成テスト')
  
  const originalUrl = 'https://astro-notion-blog-cq9.pages.dev/posts/test?utm_source=twitter'
  const canonicalUrl = generateCanonicalUrl('/posts/test')
  const debugInfo = generateDebugInfo(originalUrl, canonicalUrl, DEFAULT_CANONICAL_CONFIG)
  
  console.log('  デバッグ情報:')
  console.log(`    Original URL: ${debugInfo.originalUrl}`)
  console.log(`    Canonical URL: ${debugInfo.canonicalUrl}`)
  console.log(`    Is Valid: ${debugInfo.isValid}`)
  console.log(`    Is Problematic: ${debugInfo.isProblematic}`)
  console.log(`    Timestamp: ${debugInfo.timestamp}`)
  
  console.log('')
}

/**
 * 全テストを実行
 */
export function runCanonicalUrlTests() {
  console.log('🚀 Canonical URL機能テストを開始...\n')
  
  testCanonicalUrlGeneration()
  testDomainDetection()
  testUrlNormalization()
  testUrlValidation()
  testDebugInfo()
  
  console.log('🎉 テスト完了！')
}

// スクリプトとして直接実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  runCanonicalUrlTests()
}