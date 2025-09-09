const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorEmail: { type: String },
  action: { type: String, required: true }, // e.g. create_user, update_news
  entityType: { type: String, required: true }, // User, News, Video, Opinion
  entityId: { type: String },
  summary: { type: String },
  ip: { type: String },
  userAgent: { type: String },
  diff: { type: Object }, // optional before/after snapshot
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
