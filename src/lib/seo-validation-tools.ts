/**
 * SEO検証ツール
 * Canonical URL、robots.txt、リダイレクトチェーンの検証
 */

import { generateCanonicalUrl, validateCanonicalUrl } from './canonical-url-utils'
import { generateNormalRobotsTxt, generateRestrictiveRobotsTxt, ROBOTS_CONFIG } from './robots-config'

export interface SeoValidationResult {
  url: string
  canonicalUrl: string
  isValid: boolean
  issues: string[]
  recommendations: string[]
  score: number // 0-100
}

export interface RobotsValidationResult {
  domain: string
  robotsTxt: string
  isValid: boolean
  issues: string[]
  allowedBots: string[]
  disallowedBots: string[]
}

export interface RedirectChainResult {
  originalUrl: string
  finalUrl: string
  redirectChain: Array<{
    url: string
    status: number
    location?: string
  }>
  isValid: boolean
  issues: string[]
}

/**
 * Canonical URLの正確性を検証
 */
export function validateCanonicalUrlAccuracy(
  pageUrl: string,
  expectedPath: string
): SeoValidationResult {
  const issues: string[] = []
  const recommendations: string[] = []
  
  try {
    const url = new URL(pageUrl)
    const canonicalUrl = generateCanonicalUrl(expectedPath)
    const isValid = validateCanonicalUrl(canonicalUrl)
    
    // 基本的な検証
    if (!isValid) {
      issues.push('Canonical URLが無効な形式です')
    }
    
    // ドメインの検証
    const canonicalDomain = new URL(canonicalUrl).hostname
    if (canonicalDomain.includes('.pages.dev')) {
      issues.push('Canonical URLがCloudflareの独自ドメインを使用しています')
      recommendations.push('カスタムドメインを使用してください')
    }
    
    // プロトコルの検証
    if (!canonicalUrl.startsWith('https://')) {
      issues.push('Canonical URLがHTTPSを使用していません')
      recommendations.push('SEOのためHTTPSを使用してください')
    }
    
    // パスの検証
    const canonicalPath = new URL(canonicalUrl).pathname
    if (canonicalPath !== expectedPath) {
      issues.push(`パスが一致しません: ${canonicalPath} vs ${expectedPath}`)
    }
    
    // 重複スラッシュの検証
    if (canonicalPath.includes('//')) {
      issues.push('パスに重複スラッシュが含まれています')
      recommendations.push('パスを正規化してください')
    }
    
    // 末尾スラッシュの検証
    if (canonicalPath !== '/' && canonicalPath.endsWith('/')) {
      recommendations.push('末尾スラッシュを統一することを推奨します')
    }
    
    // スコア計算
    let score = 100
    score -= issues.length * 20
    score -= recommendations.length * 5
    score = Math.max(0, score)
    
    return {
      url: pageUrl,
      canonicalUrl,
      isValid: issues.length === 0,
      issues,
      recommendations,
      score
    }
    
  } catch (error) {
    return {
      url: pageUrl,
      canonicalUrl: '',
      isValid: false,
      issues: [`URL解析エラー: ${error}`],
      recommendations: ['有効なURLを提供してください'],
      score: 0
    }
  }
}

/**
 * robots.txtの動的生成をテスト
 */
export function validateRobotsTxtGeneration(domain: string): RobotsValidationResult {
  const issues: string[] = []
  const isCloudflarePages = domain.includes('.pages.dev')
  
  try {
    const robotsTxt = isCloudflarePages 
      ? generateRestrictiveRobotsTxt(ROBOTS_CONFIG)
      : generateNormalRobotsTxt(ROBOTS_CONFIG)
    
    // 基本的な構文検証
    if (!robotsTxt.includes('User-agent:')) {
      issues.push('User-agentディレクティブが見つかりません')
    }
    
    if (!robotsTxt.includes('Sitemap:')) {
      issues.push('Sitemapディレクティブが見つかりません')
    }
    
    // Cloudflareドメインの場合の検証
    if (isCloudflarePages) {
      if (!robotsTxt.includes('Disallow: /')) {
        issues.push('Cloudflareドメインで全体を禁止していません')
      }
      
      if (!robotsTxt.includes('canonical domain')) {
        issues.push('カスタムドメインへの誘導メッセージがありません')
      }
    }
    
    // カスタムドメインの場合の検証
    if (!isCloudflarePages) {
      if (!robotsTxt.includes('Allow: /')) {
        issues.push('カスタムドメインでクロールを許可していません')
      }
      
      if (!robotsTxt.includes('Crawl-delay:')) {
        issues.push('Crawl-delayが設定されていません')
      }
    }
    
    // AIボット制限の検証
    const aiBotsFound = ROBOTS_CONFIG.disallowedBots.filter(bot => 
      robotsTxt.includes(`User-agent: ${bot}`)
    )
    
    if (aiBotsFound.length !== ROBOTS_CONFIG.disallowedBots.length) {
      issues.push('一部のAIボットが制限されていません')
    }
    
    return {
      domain,
      robotsTxt,
      isValid: issues.length === 0,
      issues,
      allowedBots: isCloudflarePages ? [] : ROBOTS_CONFIG.allowedBots,
      disallowedBots: ROBOTS_CONFIG.disallowedBots
    }
    
  } catch (error) {
    return {
      domain,
      robotsTxt: '',
      isValid: false,
      issues: [`robots.txt生成エラー: ${error}`],
      allowedBots: [],
      disallowedBots: []
    }
  }
}

/**
 * リダイレクトチェーンの検証
 */
export function validateRedirectChain(originalUrl: string): RedirectChainResult {
  const issues: string[] = []
  const redirectChain: Array<{ url: string; status: number; location?: string }> = []
  
  try {
    const url = new URL(originalUrl)
    
    // Cloudflareドメインの場合のシミュレーション
    if (url.hostname.includes('.pages.dev')) {
      const redirectUrl = new URL(originalUrl)
      redirectUrl.hostname = 'midnight480.com'
      redirectUrl.protocol = 'https:'
      
      redirectChain.push({
        url: originalUrl,
        status: 301,
        location: redirectUrl.toString()
      })
      
      redirectChain.push({
        url: redirectUrl.toString(),
        status: 200
      })
      
      // リダイレクトチェーンの検証
      if (redirectChain.length > 3) {
        issues.push('リダイレクトチェーンが長すぎます（3回以上）')
      }
      
      // 301リダイレクトの検証
      const firstRedirect = redirectChain[0]
      if (firstRedirect.status !== 301) {
        issues.push('永続リダイレクト（301）を使用していません')
      }
      
      // 最終URLの検証
      const finalUrl = redirectChain[redirectChain.length - 1].url
      if (finalUrl.includes('.pages.dev')) {
        issues.push('最終URLがまだCloudflareドメインです')
      }
      
      return {
        originalUrl,
        finalUrl,
        redirectChain,
        isValid: issues.length === 0,
        issues
      }
    } else {
      // カスタムドメインの場合はリダイレクトなし
      redirectChain.push({
        url: originalUrl,
        status: 200
      })
      
      return {
        originalUrl,
        finalUrl: originalUrl,
        redirectChain,
        isValid: true,
        issues: []
      }
    }
    
  } catch (error) {
    return {
      originalUrl,
      finalUrl: '',
      redirectChain: [],
      isValid: false,
      issues: [`リダイレクトチェーン検証エラー: ${error}`]
    }
  }
}

/**
 * 包括的なSEO検証
 */
export function runComprehensiveSeoValidation(urls: string[]): {
  canonicalResults: SeoValidationResult[]
  robotsResults: RobotsValidationResult[]
  redirectResults: RedirectChainResult[]
  overallScore: number
  summary: {
    totalIssues: number
    totalRecommendations: number
    validUrls: number
    invalidUrls: number
  }
} {
  const canonicalResults: SeoValidationResult[] = []
  const robotsResults: RobotsValidationResult[] = []
  const redirectResults: RedirectChainResult[] = []
  
  // 各URLの検証
  urls.forEach(url => {
    try {
      const urlObj = new URL(url)
      const path = urlObj.pathname
      
      // Canonical URL検証
      canonicalResults.push(validateCanonicalUrlAccuracy(url, path))
      
      // Robots.txt検証
      robotsResults.push(validateRobotsTxtGeneration(urlObj.hostname))
      
      // リダイレクトチェーン検証
      redirectResults.push(validateRedirectChain(url))
      
    } catch (error) {
      console.error(`URL検証エラー: ${url}`, error)
    }
  })
  
  // 統計計算
  const totalIssues = [
    ...canonicalResults.flatMap(r => r.issues),
    ...robotsResults.flatMap(r => r.issues),
    ...redirectResults.flatMap(r => r.issues)
  ].length
  
  const totalRecommendations = canonicalResults
    .flatMap(r => r.recommendations).length
  
  const validUrls = canonicalResults.filter(r => r.isValid).length
  const invalidUrls = canonicalResults.length - validUrls
  
  // 全体スコア計算
  const avgCanonicalScore = canonicalResults.length > 0 
    ? canonicalResults.reduce((sum, r) => sum + r.score, 0) / canonicalResults.length
    : 0
  
  const robotsScore = robotsResults.filter(r => r.isValid).length / Math.max(robotsResults.length, 1) * 100
  const redirectScore = redirectResults.filter(r => r.isValid).length / Math.max(redirectResults.length, 1) * 100
  
  const overallScore = (avgCanonicalScore + robotsScore + redirectScore) / 3
  
  return {
    canonicalResults,
    robotsResults,
    redirectResults,
    overallScore,
    summary: {
      totalIssues,
      totalRecommendations,
      validUrls,
      invalidUrls
    }
  }
}

/**
 * SEO検証レポートの生成
 */
export function generateSeoValidationReport(
  validationResult: ReturnType<typeof runComprehensiveSeoValidation>
): string {
  const { canonicalResults, robotsResults, redirectResults, overallScore, summary } = validationResult
  
  let report = `# SEO検証レポート\n\n`
  report += `## 概要\n`
  report += `- 全体スコア: ${overallScore.toFixed(1)}/100\n`
  report += `- 検証URL数: ${canonicalResults.length}\n`
  report += `- 有効URL数: ${summary.validUrls}\n`
  report += `- 無効URL数: ${summary.invalidUrls}\n`
  report += `- 総問題数: ${summary.totalIssues}\n`
  report += `- 総推奨事項数: ${summary.totalRecommendations}\n\n`
  
  // Canonical URL結果
  report += `## Canonical URL検証結果\n\n`
  canonicalResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.url}\n`
    report += `- Canonical URL: ${result.canonicalUrl}\n`
    report += `- 有効性: ${result.isValid ? '✅ 有効' : '❌ 無効'}\n`
    report += `- スコア: ${result.score}/100\n`
    
    if (result.issues.length > 0) {
      report += `- 問題:\n`
      result.issues.forEach(issue => report += `  - ${issue}\n`)
    }
    
    if (result.recommendations.length > 0) {
      report += `- 推奨事項:\n`
      result.recommendations.forEach(rec => report += `  - ${rec}\n`)
    }
    
    report += `\n`
  })
  
  // Robots.txt結果
  report += `## Robots.txt検証結果\n\n`
  robotsResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.domain}\n`
    report += `- 有効性: ${result.isValid ? '✅ 有効' : '❌ 無効'}\n`
    report += `- 許可ボット数: ${result.allowedBots.length}\n`
    report += `- 禁止ボット数: ${result.disallowedBots.length}\n`
    
    if (result.issues.length > 0) {
      report += `- 問題:\n`
      result.issues.forEach(issue => report += `  - ${issue}\n`)
    }
    
    report += `\n`
  })
  
  // リダイレクト結果
  report += `## リダイレクトチェーン検証結果\n\n`
  redirectResults.forEach((result, index) => {
    report += `### ${index + 1}. ${result.originalUrl}\n`
    report += `- 最終URL: ${result.finalUrl}\n`
    report += `- リダイレクト数: ${result.redirectChain.length - 1}\n`
    report += `- 有効性: ${result.isValid ? '✅ 有効' : '❌ 無効'}\n`
    
    if (result.issues.length > 0) {
      report += `- 問題:\n`
      result.issues.forEach(issue => report += `  - ${issue}\n`)
    }
    
    report += `\n`
  })
  
  return report
}