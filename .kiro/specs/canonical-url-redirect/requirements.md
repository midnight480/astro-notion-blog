# Requirements Document

## Introduction

Cloudflareの独自ホストドメイン（`astro-notion-blog-cq9.pages.dev`）がGoogleの検索結果で優先表示されてしまい、本来のカスタムドメイン（`midnight480.com`）の検索順位が下がってしまう問題を解決する。この問題は重複コンテンツとしてSEOに悪影響を与えているため、適切なリダイレクトとcanonical URLの設定により解決する必要がある。

## Requirements

### Requirement 1

**User Story:** As a website owner, I want all traffic from Cloudflare's default domain to be redirected to my custom domain, so that search engines only index my custom domain.

#### Acceptance Criteria

1. WHEN a user accesses any page on `astro-notion-blog-cq9.pages.dev` THEN the system SHALL redirect them to the corresponding page on `midnight480.com` with a 301 permanent redirect
2. WHEN a search engine crawler accesses the Cloudflare domain THEN the system SHALL redirect them to the custom domain to prevent duplicate indexing
3. WHEN the redirect occurs THEN the system SHALL preserve the original path and query parameters

### Requirement 2

**User Story:** As a website owner, I want proper canonical URLs set on all pages, so that search engines understand which domain is the authoritative source.

#### Acceptance Criteria

1. WHEN any page is loaded THEN the system SHALL include a canonical URL meta tag pointing to the custom domain version
2. WHEN the page is accessed via the custom domain THEN the canonical URL SHALL point to the same custom domain URL
3. WHEN the page is accessed via the Cloudflare domain THEN the canonical URL SHALL still point to the custom domain version

### Requirement 3

**User Story:** As a website owner, I want the sitemap.xml to only reference the custom domain, so that search engines only discover and index the custom domain URLs.

#### Acceptance Criteria

1. WHEN the sitemap.xml is generated THEN the system SHALL only include URLs with the custom domain
2. WHEN the sitemap.xml is accessed via the Cloudflare domain THEN it SHALL still only contain custom domain URLs
3. WHEN the sitemap.xml is submitted to search engines THEN it SHALL help establish the custom domain as the authoritative source

### Requirement 4

**User Story:** As a website owner, I want robots.txt to be configured properly for both domains, so that search engines handle crawling appropriately.

#### Acceptance Criteria

1. WHEN robots.txt is accessed on the custom domain THEN it SHALL allow normal crawling and reference the custom domain sitemap
2. WHEN robots.txt is accessed on the Cloudflare domain THEN it SHALL discourage crawling or redirect to the custom domain version
3. WHEN search engines read robots.txt THEN they SHALL understand the preferred domain for crawling

### Requirement 5

**User Story:** As a website owner, I want to monitor and verify that the redirect and canonical URL implementation is working correctly, so that I can ensure SEO issues are resolved.

#### Acceptance Criteria

1. WHEN the implementation is deployed THEN the system SHALL provide a way to test redirect functionality
2. WHEN canonical URLs are implemented THEN they SHALL be verifiable in the page source
3. WHEN the changes are live THEN search engines SHALL gradually recognize the custom domain as the primary source