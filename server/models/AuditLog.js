import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'asset_created',
      'asset_updated',
      'asset_deleted',
      'asset_assigned',
      'asset_returned',
      'employee_created',
      'employee_updated',
      'employee_deleted',
      'user_login',
      'user_logout',
      'user_created',
      'settings_updated',
      'csv_imported',
      'csv_exported'
    ]
  },
  entityType: {
    type: String,
    enum: ['asset', 'employee', 'user', 'assignment', 'settings']
  },
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

export default mongoose.model('AuditLog', auditLogSchema);
