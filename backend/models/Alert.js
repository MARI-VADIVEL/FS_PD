const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertType: {
      type: String,
      enum: [
        'Maintenance Due',
        'Overdue Maintenance',
        'Critical Equipment Breakdown',
        'Low Stock',
        'Tyre Inspection Due',
        'Tyre Replacement Due',
        'Abnormal Pressure',
        'Critical Tyre Condition',
        'Safety Alert'
      ],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['Info', 'Warning', 'Critical'],
      default: 'Warning',
      index: true
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Equipment', 'Tyre', 'WorkOrder', 'SparePart', 'General'],
        default: 'General'
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId
      },
      identifier: {
        type: String,
        default: ''
      }
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    readBy: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ severity: 1, isRead: 1 });

module.exports = mongoose.model('Alert', alertSchema);
