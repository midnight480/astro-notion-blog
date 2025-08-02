/**
 * 環境変数検証スクリプト
 * Cloudflare Workers移行用の環境変数を検証し、デフォルト値を適用
 */

// .envファイルを読み込み
import { config } from 'dotenv';
config();

interface EnvConfig {
  required: string[];
  recommended: string[];
  optional: { [key: string]: string | number | boolean };
}

const envConfig: EnvConfig = {
  required: ['NOTION_API_SECRET', 'DATABASE_ID'],
  recommended: ['NX_CLOUD_ACCESS_TOKEN', 'CUSTOM_DOMAIN'],
  optional: {
    BASE_PATH: '/',
    CACHE_CONCURRENCY: 4,
    ENABLE_LIGHTBOX: false,
    PUBLIC_ENABLE_COMMENTS: false,
    PUBLIC_GA_TRACKING_ID: '',
    PUBLIC_GISCUS_REPO: '',
    PUBLIC_GISCUS_REPO_ID: '',
    PUBLIC_GISCUS_CATEGORY: '',
    PUBLIC_GISCUS_CATEGORY_ID: ''
  }
};

/**
 * 環境変数の形式を検証
 */
function validateFormat(key: string, value: string): boolean {
  switch (key) {
    case 'NOTION_API_SECRET':
      // Notion APIキーの形式チェック（secret_で始まる）
      return value.startsWith('secret_') && value.length > 20;
    
    case 'DATABASE_ID':
      // UUID形式のチェック（ハイフンなし32文字）
      return /^[a-f0-9]{32}$/i.test(value.replace(/-/g, ''));
    
    case 'CUSTOM_DOMAIN':
      // ドメイン形式のチェック
      return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value);
    
    case 'NX_CLOUD_ACCESS_TOKEN':
      // NX Cloudトークンの形式チェック
      return value.length > 10;
    
    default:
      return true;
  }
}

/**
 * 環境変数を検証し、デフォルト値を適用
 */
function validateEnvironment(): void {
  const errors: string[] = [];
  const warnings: string[] = [];
  const applied: string[] = [];
  
  console.log('🔍 環境変数の検証を開始します...\n');
  
  // 必須環境変数チェック
  envConfig.required.forEach(key => {
    const value = process.env[key];
    
    if (!value) {
      errors.push(`必須環境変数 ${key} が設定されていません`);
    } else if (!validateFormat(key, value)) {
      errors.push(`環境変数 ${key} の形式が正しくありません`);
    } else {
      console.log(`✅ ${key}: 設定済み`);
    }
  });
  
  // 推奨環境変数チェック
  envConfig.recommended.forEach(key => {
    const value = process.env[key];
    
    if (!value) {
      warnings.push(`推奨環境変数 ${key} が設定されていません`);
    } else if (!validateFormat(key, value)) {
      warnings.push(`環境変数 ${key} の形式が正しくありません`);
    } else {
      console.log(`✅ ${key}: 設定済み`);
    }
  });
  
  // デフォルト値適用
  Object.entries(envConfig.optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = String(defaultValue);
      applied.push(`${key} = ${defaultValue}`);
    } else {
      console.log(`✅ ${key}: ${process.env[key]}`);
    }
  });
  
  console.log('\n📋 検証結果:');
  
  if (applied.length > 0) {
    console.log('\n🔧 デフォルト値を適用しました:');
    applied.forEach(item => console.log(`  - ${item}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  環境変数警告:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ 環境変数エラー:');
    errors.forEach(error => console.error(`  - ${error}`));
    console.log('\n💡 解決方法:');
    console.log('  1. .envファイルに必要な環境変数を設定してください');
    console.log('  2. GitHub Secretsに環境変数が正しく設定されているか確認してください');
    console.log('  3. 環境変数の形式が正しいか確認してください');
    process.exit(1);
  }
  
  console.log('\n✅ 環境変数の検証が完了しました');
}

/**
 * 環境変数の設定状況を表示
 */
function showEnvironmentStatus(): void {
  console.log('📊 環境変数設定状況:\n');
  
  console.log('🔴 必須環境変数:');
  envConfig.required.forEach(key => {
    const status = process.env[key] ? '✅ 設定済み' : '❌ 未設定';
    console.log(`  ${key}: ${status}`);
  });
  
  console.log('\n🟡 推奨環境変数:');
  envConfig.recommended.forEach(key => {
    const status = process.env[key] ? '✅ 設定済み' : '⚠️  未設定';
    console.log(`  ${key}: ${status}`);
  });
  
  console.log('\n🟢 任意環境変数:');
  Object.keys(envConfig.optional).forEach(key => {
    const value = process.env[key] || envConfig.optional[key];
    console.log(`  ${key}: ${value}`);
  });
}

// コマンドライン引数の処理
const command = process.argv[2];

switch (command) {
  case 'status':
    showEnvironmentStatus();
    break;
  case 'validate':
  default:
    validateEnvironment();
    break;
}

export { validateEnvironment, showEnvironmentStatus };