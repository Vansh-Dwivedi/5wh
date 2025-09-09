const AuditLog = require('../models/AuditLog');

// Helper to record an audit event
async function recordAudit({ req, action, entityType, entityId, summary, diff }) {
  try {
    if (!req.user) return; // only after auth
    await AuditLog.create({
      actor: req.user._id,
      actorEmail: req.user.email,
      action,
      entityType,
      entityId,
      summary,
      diff,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Audit log error:', e.message);
  }
}

// Wrap an express handler to auto audit on success
function withAudit(action, entityType, buildMeta) {
  return function(handler) {
    return async function(req, res, next) {
      const before = buildMeta?.before ? await buildMeta.before(req) : null;
      try {
        await handler(req, res, async function(err) {
          if (err) return next(err);
        });
        // After response was sent? For simplicity we log immediately after handler completes
        const after = buildMeta?.after ? await buildMeta.after(req) : null;
        let diff = undefined;
        if (before || after) {
          diff = { before, after };
        }
        await recordAudit({
          req,
          action,
            entityType,
            entityId: (after && after.id) || (req.params && req.params.id),
            summary: buildMeta?.summary ? buildMeta.summary(req, { before, after }) : undefined,
            diff
        });
      } catch (e) {
        next(e);
      }
    };
  };
}

module.exports = { recordAudit, withAudit };
