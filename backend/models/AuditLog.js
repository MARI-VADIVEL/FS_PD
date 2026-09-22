const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      default: 'System'
    },
    userRole: {
      type: String,
      default: 'System'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    module: {
      type: String,
      required: true,
      enum: ['Equipment', 'Maintenance', 'Tyres', 'Inventory', 'Auth', 'Users', 'Settings'],
      index: true
    },
    recordId: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ module: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
