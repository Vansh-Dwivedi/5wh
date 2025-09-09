const News = require('../models/News');
const Podcast = require('../models/Podcast');
const Video = require('../models/Video');
const Opinion = require('../models/Opinion');
const { recordAudit } = require('../middleware/audit');

// Simple in-process scheduler; for scale, move to dedicated worker / BullMQ.
async function publishDueScheduledContent() {
  const now = new Date();
  const models = [
    { model: News, type: 'News' },
    { model: Podcast, type: 'Podcast' },
    { model: Video, type: 'Video' },
    { model: Opinion, type: 'Opinion' }
  ];
  for (const { model, type } of models) {
    try {
      const due = await model.find({ status: 'scheduled', scheduledAt: { $lte: now } }).limit(50);
      for (const doc of due) {
        doc.status = 'published';
        doc.publishedAt = doc.publishedAt || new Date();
        await doc.save();
        // Fire-and-forget audit without req context
        recordAudit({
          req: { user: { _id: doc.author || 'system', email: 'system@auto' }, ip: '0.0.0.0', headers: {} },
          action: 'auto_publish',
          entityType: type,
          entityId: doc._id.toString(),
          summary: `Auto-published scheduled ${type} '${doc.title}'`
        });
      }
    } catch (e) {
      console.error('Scheduler publish error', type, e.message);
    }
  }
}

let intervalHandle = null;
function startScheduler() {
  if (intervalHandle) return;
  // run every minute
  intervalHandle = setInterval(publishDueScheduledContent, 60 * 1000);
  publishDueScheduledContent(); // initial run
  console.log('Content scheduler started (interval 60s)');
}

module.exports = { startScheduler };
