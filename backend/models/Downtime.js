const mongoose = require('mongoose');

const downtimeCategories = [
  'Mechanical',
  'Electrical',
  'Hydraulic',
  'Tyre',
  'Engine',
  'Transmission',
  'Other'
];

const downtimeSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
      index: true
    },
    workOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder'
    },
    startTime: {
      type: Date,
      required: true,
      index: true
    },
    endTime: {
      type: Date
    },
    durationHours: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      enum: downtimeCategories,
      required: true,
      index: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    impactLevel: {
      type: String,
      enum: ['Minor', 'Moderate', 'Major', 'Critical'],
      default: 'Moderate'
    }
  },
  {
    timestamps: true
  }
);

downtimeSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const diffMs = new Date(this.endTime) - new Date(this.startTime);
    this.durationHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('Downtime', downtimeSchema);
