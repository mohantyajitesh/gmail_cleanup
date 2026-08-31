/**
 * Gmail Category Cleanup — v1.1
 * Moves old Social / Promotions mail to Trash on a schedule.
 * Trash auto-purges after 30 days, so everything is recoverable for a month.
 *
 * v1.1: label any thread "keep" to make it immune; everything the script
 * trashes is tagged "auto-trashed" (audit trail — search: in:trash
 * label:auto-trashed). Rescuing a message from Trash makes it immune too.
 */

// ===== CONFIG — the only block you should edit =============================
const CONFIG = {
  categories: ['social', 'promotions'], // any of: social, promotions, updates, forums
  olderThanDays: 30,
  excludeStarred: true,
  excludeImportant: true,   // keeps receipts, itineraries, billing that land in Promotions
  keepLabel: 'keep',        // label a thread with this and it is never touched
  autoLabel: 'auto-trashed',// audit tag; also protects anything you rescue from Trash
  maxPerRun: 10000,         // safety cap per run; the next run picks up the rest
};
// ===========================================================================

const QUERY = [
  '(' + CONFIG.categories.map(c => 'category:' + c).join(' OR ') + ')',
  'older_than:' + CONFIG.olderThanDays + 'd',
  CONFIG.excludeStarred ? '-is:starred' : '',
  CONFIG.excludeImportant ? '-is:important' : '',
  CONFIG.keepLabel ? '-label:' + CONFIG.keepLabel : '',
  CONFIG.autoLabel ? '-label:' + CONFIG.autoLabel : '',
].filter(Boolean).join(' ');

function cleanup() {
  // Resolve the audit label once per run, not per batch.
  const addLabelIds = ['TRASH'];
  if (CONFIG.autoLabel) addLabelIds.push(labelId_(CONFIG.autoLabel));

  let trashed = 0;
  while (trashed < CONFIG.maxPerRun) {
    // Always fetch the first page: trashed messages drop out of the result set,
    // so the "next" page is simply the new first page.
    const res = Gmail.Users.Messages.list('me', { q: QUERY, maxResults: 500 });
    const ids = (res.messages || []).map(m => m.id);
    if (ids.length === 0) break;
    Gmail.Users.Messages.batchModify({ ids, addLabelIds }, 'me');
    trashed += ids.length;
  }

  const capHit = trashed >= CONFIG.maxPerRun;
  console.log(`Trashed ${trashed} message(s). Cap hit: ${capHit}. Query: ${QUERY}`);
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

// Gmail's API takes label IDs, not names. Looks one up; creates it if missing.
function labelId_(name) {
  const labels = Gmail.Users.Labels.list('me').labels || [];
  const hit = labels.find(l => l.name === name);
  if (hit) return hit.id;
  return Gmail.Users.Labels.create({
    name: name,
    labelListVisibility: 'labelShow',
    messageListVisibility: 'show',
  }, 'me').id;
}
