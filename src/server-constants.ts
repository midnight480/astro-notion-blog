export const NOTION_API_SECRET =
  import.meta.env.NOTION_API_SECRET || process.env.NOTION_API_SECRET || ''
export const DATABASE_ID =
  import.meta.env.DATABASE_ID || process.env.DATABASE_ID || ''

export const CUSTOM_DOMAIN =
  import.meta.env.CUSTOM_DOMAIN || process.env.CUSTOM_DOMAIN || '' // <- Set your costom domain if you have. e.g. alpacat.com
export const BASE_PATH =
  import.meta.env.BASE_PATH || process.env.BASE_PATH || '' // <- Set sub directory path if you want. e.g. /docs/

export const PUBLIC_GA_TRACKING_ID = import.meta.env.PUBLIC_GA_TRACKING_ID
export const NUMBER_OF_POSTS_PER_PAGE = 10
export const REQUEST_TIMEOUT_MS = parseInt(
  import.meta.env.REQUEST_TIMEOUT_MS || '10000',
  10
)
export const ENABLE_LIGHTBOX = import.meta.env.ENABLE_LIGHTBOX

// コメント機能の設定
// PUBLIC_ENABLE_COMMENTSが明示的にfalseでない限り、Giscusの環境変数がすべて設定されていれば有効化
const explicitDisable = import.meta.env.PUBLIC_ENABLE_COMMENTS === 'false'
const hasGiscusConfig = 
  import.meta.env.PUBLIC_GISCUS_REPO && 
  import.meta.env.PUBLIC_GISCUS_REPO_ID && 
  import.meta.env.PUBLIC_GISCUS_CATEGORY_ID

export const ENABLE_COMMENTS = !explicitDisable && (import.meta.env.PUBLIC_ENABLE_COMMENTS === 'true' || hasGiscusConfig)
export const GISCUS_REPO = import.meta.env.PUBLIC_GISCUS_REPO || ''
export const GISCUS_REPO_ID = import.meta.env.PUBLIC_GISCUS_REPO_ID || ''
export const GISCUS_CATEGORY =
  import.meta.env.PUBLIC_GISCUS_CATEGORY || 'Announcements'
export const GISCUS_CATEGORY_ID =
  import.meta.env.PUBLIC_GISCUS_CATEGORY_ID || ''

// Cloudflare Pages環境変数
export const CF_PAGES = import.meta.env.CF_PAGES || process.env.CF_PAGES || ''
export const CF_PAGES_URL = import.meta.env.CF_PAGES_URL || process.env.CF_PAGES_URL || ''
export const CF_PAGES_BRANCH = import.meta.env.CF_PAGES_BRANCH || process.env.CF_PAGES_BRANCH || ''

// SEO関連の設定
export const DEFAULT_CUSTOM_DOMAIN = 'midnight480.com'
export const FORCE_HTTPS = true
export const ENABLE_CANONICAL_REDIRECT = true
