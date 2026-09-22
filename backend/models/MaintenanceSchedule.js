const mongoose = require('mongoose');

const maintenanceScheduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Schedule title is required'],
      trim: true
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
      index: true
    },
    serviceType: {
      type: String,
      enum: ['Preventive', 'Inspection', 'Major Overhaul', 'Lubrication', 'Tyre Rotation'],
      default: 'Preventive'
    },
    intervalType: {
      type: String,
      enum: ['Hours', 'Calendar', 'Mileage'],
      default: 'Hours'
    },
    intervalValue: {
      type: Number,
      required: true,
      min: 1
    },
    lastTriggerValue: {
      type: Number,
      default: 0
    },
    nextDueValue: {
      type: Number,
      required: true
    },
    nextDueDate: {
      type: Date,
      index: true
    },
    estimatedDuration: {
      type: Number,
      default: 4
    },
    estimatedCost: {
      type: Number,
      default: 0
    },
    checklistTemplate: [
      {
        task: { type: String, required: true },
        isCritical: { type: Boolean, default: false }
      }
    ],
    status: {
      type: String,
      enum: ['Active', 'Paused', 'Archived'],
      default: 'Active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('MaintenanceSchedule', maintenanceScheduleSchema);
