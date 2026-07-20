# AGENTS.md

## リポジトリ構成

このリポジトリは [otoyo/astro-notion-blog](https://github.com/otoyo/astro-notion-blog) の fork です。

| remote | URL | 用途 |
| --- | --- | --- |
| `origin` | `midnight480/astro-notion-blog` | 自分のリポジトリ。**作業対象はここだけ** |
| `upstream` | `otoyo/astro-notion-blog` | fork 元。参照専用 |

## PR・ブランチ運用ルール

**PR、ブランチ、issue は必ず `midnight480/astro-notion-blog`（`origin`）に対してのみ作成すること。**
fork 元である `upstream`（`otoyo/astro-notion-blog`）へは、明示的に指示された場合を除き
絶対に PR を作成しないこと。

`gh` は fork リポジトリでは**既定で親リポジトリ（upstream）を対象にする**ため、
`gh pr create` / `gh issue create` などでは必ず `--repo` を明示する:

```bash
gh pr create --repo midnight480/astro-notion-blog --base main --head <branch> ...
```

`--repo` を省略すると `No commits between main and <branch>` のようなエラーになるか、
最悪の場合 fork 元へ意図しない PR が飛ぶ。

同様に push 先も `origin` を明示する:

```bash
git push -u origin <branch>
```

## 開発コマンド

```bash
npm run dev              # 開発サーバー
npm run build            # ビルド（Notion API アクセスが必要）
npm run build:skip-cache # キャッシュ取得をスキップしてビルド
npm run lint             # eslint src
npm run format           # prettier
npm run test:all         # SEO / リダイレクト / E2E テスト一式
```

ビルドには有効な Notion API トークン（`.env`）が必要。
トークンが無効だと `astro:build:start` の integration hook で失敗する。

## スタイル定義の注意点

`:global()` は **CSS Modules 専用の構文**であり、プレーンな CSS ファイルでは
不正セレクタとして扱われてルールごと無効になる。

- `src/styles/*.module.css` … CSS Module。`:global()` を使ってよい
- 上記以外の `src/styles/*.css` … グローバル CSS。`:global()` を使わず通常のセレクタを書く
  （例: `:global(html.dark) .foo` ではなく `html.dark .foo`）
