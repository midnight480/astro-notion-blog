const fs = require('fs');
const path = require('path');
const { Client } = require('@notionhq/client');
const cliProgress = require('cli-progress');
const { PromisePool } = require('@supercharge/promise-pool');
const { retrieveAndWriteBlockChildren } = require('./retrieve-block-children.cjs');

const notion = new Client({
  auth: process.env.NOTION_API_SECRET,
  notionVersion: '2025-09-03',
});

const CACHE_DIR = 'tmp';
// ページごとの last_edited_time を記録し、次回以降は差分だけ取得する。
// 以前は nx のキャッシュに任せていたが、nxCloudAccessToken が空でローカル
// キャッシュのみのため、毎回まっさらな CI コンテナでは一切効いていなかった。
const MANIFEST_PATH = path.join(CACHE_DIR, '.cache-manifest.json');

const getDataSourceId = async () => {
  const res = await notion.databases.retrieve({
    database_id: process.env.DATABASE_ID,
  });

  // Get the first data source ID
  const dataSources = res.data_sources || [];
  if (dataSources.length === 0) {
    throw new Error('No data sources found for database');
  }

  return dataSources[0].id;
};

const getAllPages = async () => {
  const dataSourceId = await getDataSourceId();

  let results = [];
  let startCursor = undefined;

  while (true) {
    const res = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: 'Published',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: new Date().toISOString(),
            },
          },
        ],
      },
      start_cursor: startCursor,
    });

    results = results.concat(res.results);

    if (!res.has_more) {
      break;
    }

    startCursor = res.next_cursor;
  }

  const pages = results.map((result) => {
    return {
      id: result.id,
      last_edited_time: result.last_edited_time,
      slug: result.properties.Slug.rich_text
        ? result.properties.Slug.rich_text[0].plain_text
        : '',
    };
  });

  return pages;
};

const readManifest = () => {
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch {
    return {};
  }
};

const isCached = (manifest, page) =>
  manifest[page.id] === page.last_edited_time &&
  fs.existsSync(path.join(CACHE_DIR, `${page.id}.json`));

(async () => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  const pages = await getAllPages();
  const manifest = readManifest();

  const targets = pages.filter((page) => !isCached(manifest, page));
  const skippedCount = pages.length - targets.length;

  if (skippedCount > 0) {
    console.log(
      `キャッシュ済みのためスキップ: ${skippedCount}/${pages.length} ページ`
    );
  }

  if (targets.length === 0) {
    console.log(`キャッシュ処理完了: ${pages.length}/${pages.length} 成功`);
    return;
  }

  const concurrency = parseInt(process.env.CACHE_CONCURRENCY || '8', 10);

  const progressBar = new cliProgress.SingleBar(
    { stopOnComplete: true },
    cliProgress.Presets.shades_classic
  );
  progressBar.start(targets.length, 0);

  let errorCount = 0;
  const errors = [];

  // 以前はページごとに `npx nx run ...` を子プロセスとして起動していた。
  // 実際の API 呼び出しよりプロセス起動のほうが重く、しかも CI では
  // nx のキャッシュが効かないため純粋なオーバーヘッドになっていた。
  await PromisePool.withConcurrency(concurrency)
    .for(targets)
    .process(async (page) => {
      try {
        await retrieveAndWriteBlockChildren(page.id);
        manifest[page.id] = page.last_edited_time;
      } catch (err) {
        errorCount++;
        errors.push({ page: page.slug || page.id, error: err.message });
        // 途中で失敗したページは次回必ず取り直す
        delete manifest[page.id];
        console.error(
          `Error processing ${page.slug || page.id}: ${err.message}`
        );
      } finally {
        progressBar.increment();
      }
    });

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(
    `\nキャッシュ処理完了: ${pages.length - errorCount}/${pages.length} 成功`
  );
  if (errorCount > 0) {
    console.log(`エラー数: ${errorCount}`);
    console.log('エラー詳細:');
    errors.forEach(({ page, error }) => {
      console.log(`  - ${page}: ${error}`);
    });
  }
})();
