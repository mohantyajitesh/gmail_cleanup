/**
 * Gmail Category Cleanup
 * Moves old Social / Promotions mail to Trash on a schedule.
 * Trash auto-purges after 30 days, so everything is recoverable for a month.
 * Starred and Important mail is never touched unless you change CONFIG.
 */

// ===== CONFIG — the only block you should edit =============================
const CONFIG = {
  categories: ['social', 'promotions'], // any of: social, promotions, updates, forums
  olderThanDays: 30,
  excludeStarred: true,
  excludeImportant: true,   // keeps receipts, itineraries, billing that land in Promotions
  maxPerRun: 10000,         // safety cap per run; the next run picks up the rest
};
// ===========================================================================

const QUERY = [
  '(' + CONFIG.categories.map(c => 'category:' + c).join(' OR ') + ')',
  'older_than:' + CONFIG.olderThanDays + 'd',
  CONFIG.excludeStarred ? '-is:starred' : '',
  CONFIG.excludeImportant ? '-is:important' : '',
].filter(Boolean).join(' ');

function cleanup() {
  let trashed = 0;
  while (trashed < CONFIG.maxPerRun) {
    // Always fetch the first page: trashed messages drop out of the result set,
    // so the "next" page is simply the new first page.
    const res = Gmail.Users.Messages.list('me', { q: QUERY, maxResults: 500 });
    const ids = (res.messages || []).map(m => m.id);
    if (ids.length === 0) break;
    Gmail.Users.Messages.batchModify({ ids, addLabelIds: ['TRASH'] }, 'me');
    trashed += ids.length;
  }
  console.log(`Trashed ${trashed} message(s). Query: ${QUERY}`);
}

function preview() {
  const res = Gmail.Users.Messages.list('me', { q: QUERY, maxResults: 10 });
  console.log(`~${res.resultSizeEstimate} message(s) match. First 10:`);
  (res.messages || []).forEach(m => {
    const msg = Gmail.Users.Messages.get('me', m.id, {
      format: 'metadata', metadataHeaders: ['Date', 'From', 'Subject'],
    });
    const h = Object.fromEntries(msg.payload.headers.map(x => [x.name, x.value]));
    console.log(`${h.Date} | ${h.From} | ${h.Subject}`);
  });
}
