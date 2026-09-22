const mongoose = require('mongoose');

const tyreEventTypes = [
  'Purchase',
  'Installation',
  'Removal',
  'Rotation',
  'Inspection',
  'Repair',
  'Retread',
  'Scrap',
  'Status Change'
];

const tyreHistorySchema = new mongoose.Schema(
  {
    tyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tyre',
      required: true,
      index: true
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      index: true
    },
    eventType: {
      type: String,
      enum: tyreEventTypes,
      required: true,
      index: true
    },
    fromPosition: {
      type: String,
      default: ''
    },
    toPosition: {
      type: String,
      default: ''
    },
    equipmentHours: {
      type: Number,
      default: 0
    },
    tyreHours: {
      type: Number,
      default: 0
    },
    treadDepth: {
      type: Number
    },
    pressure: {
      type: Number
    },
    reason: {
      type: String,
      default: ''
    },
    performedBy: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TyreHistory', tyreHistorySchema);
