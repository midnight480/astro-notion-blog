import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import { CUSTOM_DOMAIN, BASE_PATH } from './src/server-constants';
import CoverImageDownloader from './src/integrations/cover-image-downloader';
import CustomIconDownloader from './src/integrations/custom-icon-downloader';
import FeaturedImageDownloader from './src/integrations/featured-image-downloader';
import PublicNotionCopier from './src/integrations/public-notion-copier';

const getSite = function () {
  if (CUSTOM_DOMAIN) {
    return new URL(BASE_PATH, `https://${CUSTOM_DOMAIN}`).toString();
  }

  if (process.env.VERCEL && process.env.VERCEL_URL) {
    return new URL(BASE_PATH, `https://${process.env.VERCEL_URL}`).toString();
  }

  // Cloudflare Workers環境の検出
  if (process.env.CF_WORKERS || process.env.CLOUDFLARE_ACCOUNT_ID) {
    if (process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== 'main') {
      return new URL(BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    return new URL(
      BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL || 'https://midnight480.com').host
        .split('.')
        .slice(1)
        .join('.')}`
    ).toString();
  }

  // 従来のCloudflare Pages環境（後方互換性のため残す）
  if (process.env.CF_PAGES) {
    if (process.env.CF_PAGES_BRANCH !== 'main') {
      return new URL(BASE_PATH, process.env.CF_PAGES_URL).toString();
    }

    return new URL(
      BASE_PATH,
      `https://${new URL(process.env.CF_PAGES_URL).host
        .split('.')
        .slice(1)
        .join('.')}`
    ).toString();
  }

  return new URL(BASE_PATH, 'http://localhost:4321').toString();
};

// https://astro.build/config
export default defineConfig({
  site: getSite(),
  base: BASE_PATH,
  integrations: [
    icon(),
    CoverImageDownloader(),
    CustomIconDownloader(),
    FeaturedImageDownloader(),
    PublicNotionCopier(),
  ],
  // ビルドパフォーマンス最適化設定
  build: {
    // 並列処理を有効化
    inlineStylesheets: 'auto',
  },
  vite: {
    // Viteのビルド最適化
    build: {
      // 並列処理を有効化
      rollupOptions: {
        output: {
          manualChunks: {
            // 大きなライブラリを分離
            mermaid: ['mermaid'],
            katex: ['katex'],
            prismjs: ['prismjs'],
          },
        },
      },
    },
    // 並列処理の設定
    optimizeDeps: {
      include: ['mermaid', 'katex', 'prismjs'],
    },
  },
});
