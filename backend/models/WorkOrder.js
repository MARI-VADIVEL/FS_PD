const mongoose = require('mongoose');

const maintenanceTypes = [
  'Preventive',
  'Corrective',
  'Breakdown',
  'Inspection',
  'Emergency'
];

const workOrderStatuses = [
  'Draft',
  'Open',
  'Assigned',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled'
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const checklistStatuses = ['Pending', 'In Progress', 'Passed', 'Failed', 'Not Applicable'];

const workOrderSchema = new mongoose.Schema(
  {
    workOrderNumber: {
      type: String,
      required: [true, 'Work order number is required'],
      unique: true,
      trim: true,
      index: true
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
      index: true
    },
    maintenanceType: {
      type: String,
      required: [true, 'Maintenance type is required'],
      enum: maintenanceTypes,
      index: true
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: priorities,
      default: 'Medium',
      index: true
    },
    problemDescription: {
      type: String,
      required: [true, 'Problem description is required'],
      trim: true
    },
    reportedDate: {
      type: Date,
      default: Date.now
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true
    },
    assignedEngineer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    estimatedDuration: {
      type: Number,
      default: 2,
      min: 0
    },
    actualDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    estimatedCost: {
      type: Number,
      default: 0,
      min: 0
    },
    actualLaborCost: {
      type: Number,
      default: 0,
      min: 0
    },
    actualPartsCost: {
      type: Number,
      default: 0,
      min: 0
    },
    actualCost: {
      type: Number,
      default: 0,
      min: 0
    },
    requiredSpareParts: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
        partNumber: { type: String },
        name: { type: String },
        quantity: { type: Number, default: 1 }
      }
    ],
    partsUsed: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
        partNumber: { type: String },
        name: { type: String },
        quantity: { type: Number, required: true },
        unitCost: { type: Number, default: 0 },
        totalCost: { type: Number, default: 0 }
      }
    ],
    checklist: [
      {
        task: { type: String, required: true },
        status: {
          type: String,
          enum: checklistStatuses,
          default: 'Pending'
        },
        isCritical: { type: Boolean, default: false },
        notes: { type: String, default: '' }
      }
    ],
    completionNotes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: workOrderStatuses,
      default: 'Open',
      index: true
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

workOrderSchema.index({ status: 1, priority: 1 });
workOrderSchema.index({ equipment: 1, status: 1 });

workOrderSchema.pre('save', function (next) {
  this.actualCost = (this.actualLaborCost || 0) + (this.actualPartsCost || 0);
  next();
});

module.exports = mongoose.model('WorkOrder', workOrderSchema);
