const fs = require('fs');
const { setTimeout: sleep } = require('timers/promises');
const { Client } = require('@notionhq/client');

const notion = new Client({
  auth: process.env.NOTION_API_SECRET,
  notionVersion: '2025-09-03',
});

// Notion API のレート制限は「平均 3 リクエスト/秒」。
// See https://developers.notion.com/reference/request-limits
//
// 以前は各リクエストの前に固定で 300ms スリープしていたが、これは
// (1) 1 ページ内では直列の待ち時間として積み上がり、
// (2) 複数ページを並列に処理するとプロセス全体では制限を超えてバーストする、
// という二重の問題があった。プロセス全体で共有するトークンバケットに置き換える。
const REQUESTS_PER_SECOND = parseFloat(
  process.env.NOTION_REQUESTS_PER_SECOND || '3'
);
const minIntervalMs = 1000 / REQUESTS_PER_SECOND;
let nextSlotAt = 0;

const acquireSlot = async () => {
  const now = Date.now();
  const slotAt = Math.max(now, nextSlotAt);
  nextSlotAt = slotAt + minIntervalMs;

  const waitMs = slotAt - now;
  if (waitMs > 0) {
    await sleep(waitMs);
  }
};

// 429 のときは Notion が返す Retry-After を尊重し、それ以外は指数バックオフする。
// （以前は即座に再試行していたため、レート制限中はリトライを無駄に消費していた）
const retry = async (maxRetries, fn) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === maxRetries) {
        break;
      }

      const retryAfterSec = Number(
        (err && err.headers && err.headers['retry-after']) || NaN
      );
      const waitMs =
        Number.isFinite(retryAfterSec) && retryAfterSec > 0
          ? retryAfterSec * 1000
          : 500 * 2 ** attempt;

      await sleep(waitMs);
    }
  }

  throw lastError;
};

const retrieveAndWriteBlockChildren = async (blockId) => {
  const params = { block_id: blockId };

  let results = [];

  while (true) {
    await acquireSlot();

    const res = await retry(3, () => notion.blocks.children.list(params));

    results = results.concat(res.results);

    if (!res.has_more) {
      break;
    }

    params['start_cursor'] = res.next_cursor;
  }

  fs.writeFileSync(`tmp/${blockId}.json`, JSON.stringify(results));

  // 以前は forEach(async ...) だったため子ブロックの取得が await されておらず、
  // 呼び出し元が完了を待てなかった（インプロセス実行では取りこぼしに直結する）。
  for (const block of results) {
    if (
      block.type === 'synced_block' &&
      block.synced_block.synced_from &&
      block.synced_block.synced_from.block_id
    ) {
      try {
        await retrieveAndWriteBlock(block.synced_block.synced_from.block_id);
      } catch (err) {
        console.log(
          `Could not retrieve the original synced_block. error: ${err}`
        );
        throw err;
      }
    } else if (block.has_children) {
      await retrieveAndWriteBlockChildren(block.id);
    }
  }
};

const retrieveAndWriteBlock = async (blockId) => {
  const params = { block_id: blockId };

  await acquireSlot();

  const block = await retry(3, () => notion.blocks.retrieve(params));

  fs.writeFileSync(`tmp/${blockId}.json`, JSON.stringify(block));

  if (block.has_children) {
    await retrieveAndWriteBlockChildren(block.id);
  }
};

module.exports = { retrieveAndWriteBlockChildren, retrieveAndWriteBlock };

// 単体のブロックを取得したいときは従来どおり CLI としても使える
if (require.main === module) {
  (async () => {
    const blockId = process.argv[2];
    await retrieveAndWriteBlockChildren(blockId);
  })();
}
