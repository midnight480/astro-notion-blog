#!/bin/bash

# Cloudflare Workers環境変数設定スクリプト
# 使用方法: ./scripts/setup-workers-secrets.sh [staging|production]

set -e

ENVIRONMENT=${1:-preview}
PROJECT_NAME="astro-notion-blog"

# Cloudflare Pagesでは "staging" ではなく "preview" を使用
if [ "$ENVIRONMENT" = "staging" ]; then
    ENVIRONMENT="preview"
fi

echo "🔧 Setting up Cloudflare Workers secrets for $ENVIRONMENT environment..."
echo "📦 Project: $PROJECT_NAME"

# 環境別の.envファイルを読み込み
ENV_FILE=".env"
if [ "$ENVIRONMENT" = "production" ]; then
    ENV_FILE=".env.production"
fi

if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading environment variables from $ENV_FILE file..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
else
    echo "❌ $ENV_FILE file not found. Please create one with your environment variables."
    exit 1
fi

# 必須環境変数のチェック
REQUIRED_VARS=("NOTION_API_SECRET" "DATABASE_ID")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '  - %s\n' "${MISSING_VARS[@]}"
    exit 1
fi

# Workers環境変数を設定
echo "🔐 Setting up secrets..."

echo "Setting NOTION_API_SECRET..."
echo "$NOTION_API_SECRET" | npx wrangler pages secret put NOTION_API_SECRET --env $ENVIRONMENT

echo "Setting DATABASE_ID..."
echo "$DATABASE_ID" | npx wrangler pages secret put DATABASE_ID --env $ENVIRONMENT

if [ -n "$CUSTOM_DOMAIN" ]; then
    echo "Setting CUSTOM_DOMAIN..."
    echo "$CUSTOM_DOMAIN" | npx wrangler pages secret put CUSTOM_DOMAIN --env $ENVIRONMENT
fi

if [ -n "$NX_CLOUD_ACCESS_TOKEN" ]; then
    echo "Setting NX_CLOUD_ACCESS_TOKEN..."
    echo "$NX_CLOUD_ACCESS_TOKEN" | npx wrangler pages secret put NX_CLOUD_ACCESS_TOKEN --env $ENVIRONMENT
fi

# 任意の環境変数
OPTIONAL_VARS=(
    "ASTRO_NOTION_BLOG_FACEBOOK_URL"
    "ASTRO_NOTION_BLOG_INSTAGRAM_URL" 
    "ASTRO_NOTION_BLOG_LINKEDIN_URL"
    "ASTRO_NOTION_BLOG_OTHER_URL"
    "ASTRO_NOTION_BLOG_USERNAME"
    "ASTRO_NOTION_BLOG_X_URL"
    "PUBLIC_GA_TRACKING_ID"
    "PUBLIC_GISCUS_REPO"
    "PUBLIC_GISCUS_REPO_ID"
    "PUBLIC_GISCUS_CATEGORY"
    "PUBLIC_GISCUS_CATEGORY_ID"
)

for var in "${OPTIONAL_VARS[@]}"; do
    if [ -n "${!var}" ]; then
        echo "Setting $var..."
        echo "${!var}" | npx wrangler pages secret put "$var" --env $ENVIRONMENT
    fi
done

echo "✅ Secrets setup completed for $ENVIRONMENT environment!"
echo ""
echo "📋 Next steps:"
echo "  1. Test the deployment: npm run workers:deploy:$([ "$ENVIRONMENT" = "preview" ] && echo "staging" || echo "production")"
echo "  2. Verify the secrets: npx wrangler pages secret list --env $ENVIRONMENT"
echo "  3. Check the deployment: npx wrangler pages deployment list"