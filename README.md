English | [日本語](README.ja.md)

# astro-notion-blog

[![GitHub stars](https://img.shields.io/github/stars/otoyo/astro-notion-blog)](https://github.com/otoyo/astro-notion-blog/stargazers)
[![GitHub license](https://img.shields.io/github/license/otoyo/astro-notion-blog)](https://github.com/otoyo/astro-notion-blog/blob/main/LICENSE)
[![GitHub sponsors](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/otoyo)

<img src="https://user-images.githubusercontent.com/1063435/213838069-c9654c32-ec9b-4e82-a3b5-2acbd665b16a.png" width="480">

astro-notion-blog enables you to create a blog using [Notion](https://www.notion.so/) and generates it statically, resulting in lightning-fast page views.

- :rocket: **Blazing fast** page views
- :pencil: With the ability to write blog content in **Notion**
- :hammer_and_wrench: **Customize** your site's appearance to your liking
- :white_check_mark: Take advantage of **the official Notion APIs**

## :camera_flash: Screenshots

### PC

<img src="https://github.com/otoyo/astro-notion-blog/assets/1063435/967bbc23-014c-427d-b6cd-02c41822fb45" width="600">

### Smartphone

<img src="https://github.com/otoyo/astro-notion-blog/assets/1063435/bf1add06-1f1c-42ca-88c9-decb8c0dcf8f" width="300">

## :globe_with_meridians: Demo

[https://astro-notion-blog.pages.dev](https://astro-notion-blog.pages.dev)

## :motor_scooter: Quick Start

### Requirements

- [Notion](https://www.notion.so/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- Git

### Steps

1. If you enjoy using this repo, **don't forget to give it a star!** :wink:
   - This is very motivating!
2. Simply duplicate [the blog template](https://otoyo.notion.site/e2c5fa2e8660452988d6137ba57fd974?v=abe305cd8b3d467285e91a2a85f4d8de) into your Notion workspace.
3. Once you've duplicated the page (database), customize it to your liking by changing the icon, title, and description.

<img src="https://user-images.githubusercontent.com/1063435/223611374-86d7172c-9cda-477b-b8a3-dc724fa7ccf4.png" width="600">

4. For future reference, identify the `DATABASE_ID` by noting the portion of the duplicated page (database) URL that appears as https://notion.so/your-account/<HERE>?v=xxxx.

<img src="https://user-images.githubusercontent.com/1063435/213966685-3a2afed2-45c0-4ea5-8070-e634d8d648de.png" width="260">

<img src="https://user-images.githubusercontent.com/1063435/213966888-c3f1f741-62ac-42f3-9af2-94ab375b5676.png" width="600">

5. [Create an integration](https://developers.notion.com/docs/create-a-notion-integration#step-1-create-an-integration) and note "Internal Integration Token" as `NOTION_API_SECRET`
6. To integrate your application with Notion, [share a database with your integration](https://developers.notion.com/docs/create-a-notion-integration#step-2-share-a-database-with-your-integration).
7. To make a copy of this repository in your own account, fork it by clicking on the 'Fork' button in the top-right corner of the repository page.
8. Go to [Cloudflare Pages](https://pages.cloudflare.com/) and sign in
9. Create new project with "Connect to Git" with your forked repository `<your-account>/astro-notion-blog`, then click "Begin setup"
10. In "Build settings" section,
    1. Select "Astro" as "Framework preset"
    2. Open "Environment Variables (advanced)" and set `NODE_VERSION`, `NOTION_API_SECRET` and `DATABASE_ID`
       - `NODE_VERSION` is `20.18.1` or higher
       - [How to deploy a site with Git](https://docs.astro.build/en/guides/deploy/cloudflare/#how-to-deploy-a-site-with-git) is helpful

<img src="https://user-images.githubusercontent.com/1063435/213967061-06f488fe-0b42-40a5-8f19-ac441f0168ff.png" width="400">

<img src="https://github.com/user-attachments/assets/34fa8e2e-db34-40d3-87a6-acdb0d4e66db" width="600">

11. After clicking the 'Save and Deploy' button, your Notion Blog will be published once the deployment process is complete.

Please note that the astro-notion-blog requires manual deployment every time you publish a new post or make updates. You can deploy manually from the Cloudflare Pages dashboard or set up a scheduled deploy using CI tools such as GitHub Actions.

## :hammer_and_pick: How to customize

### Additional requirements

- Node.js v20.18.1 or higher

### Steps

1. To set your secrets as environment variables, run the following commands in your terminal:

```sh
export NOTION_API_SECRET=<YOUR_NOTION_API_SECRET>
export DATABASE_ID=<YOUR_DATABASE_ID>
```

2. Install dependencies and start local server

```sh
npm install
npm run dev
```

3. Open [http://localhost:4321](http://localhost:4321) in your browser
4. Press `Ctrl+C` in the terminal to stop

### Code Quality & CI/CD

This project uses a unified CI/CD workflow that automatically checks code quality:

#### Manual Commands for Developers

Before committing your changes, run these commands to ensure code quality:

```sh
# Format your code
npm run format

# Check formatting (without fixing)
npm run format:check

# Run linting
npm run lint

# Run all tests
npm run test:all
```

#### Automated Workflow

The `deploy-workers.yml` workflow automatically:
1. Validates environment variables
2. Runs lint checks (`npm run lint`)
3. Runs format checks (`npm run format:check`)
4. Builds the application
5. Runs all tests
6. Deploys to Cloudflare Workers (staging/production)

If any step fails, the deployment is automatically cancelled.

### For more information

See [wiki](https://github.com/otoyo/astro-notion-blog/wiki).

## :lady_beetle: Bug reports & feature requests

To report an issue, please create a new Issue. You can use **either English or Japanese** to describe the issue. :wink:

## :two_hearts: Sponsorship

If you like astro-notion-blog, sponsor me so that I can keep on developing software. Thank you.

[![GitHub sponsors](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/otoyo)

---

astro-notion-blog is based [otoyo/notion-blog](https://github.com/otoyo/notion-blog)

## Environment Variables

```bash
NOTION_API_SECRET=your_notion_api_secret
DATABASE_ID=your_notion_database_id
CACHE_CONCURRENCY=8  # キャッシュ処理の並列度（デフォルト: 4）
```

## Build Optimization

記事数が多い場合のビルド高速化オプション：

```bash
# 標準ビルド
npm run build

# キャッシュ付きビルド
npm run build:cached

# 高速ビルド（並列度8）
npm run build:fast

# 最大並列ビルド（並列度12）
npm run build:parallel
```

## Nx Cloud Setup

ビルドをさらに高速化するには、Nx Cloudの設定を完了してください：

1. `npm install && npx nx g @nrwl/nx-cloud:init`
2. `nx.json`から`accessToken`をメモ
3. `git checkout -- nx.json`
4. Nx Cloudでアカウント作成・ワークスペース接続
5. 環境変数`NX_CLOUD_ACCESS_TOKEN`を設定
6. `npm run cache:fetch`でキャッシュ生成
7. Cloudflare Pagesのビルドコマンドを`npm run build:cached`に変更

詳細は[Wiki](https://github.com/otoyo/astro-notion-blog/wiki/%E3%83%93%E3%83%AB%E3%83%89%E3%81%AE%E9%AB%98%E9%80%9F%E5%8C%96%28%E8%A8%98%E4%BA%8B%E6%95%B0%E3%81%8C%E5%A4%9A%E3%81%84%E4%BA%BA%E5%90%91%E3%81%91%29)を参照してください。
