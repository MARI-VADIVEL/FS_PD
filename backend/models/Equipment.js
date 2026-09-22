const mongoose = require('mongoose');

const equipmentTypes = [
  'Haul Truck',
  'Hydraulic Excavator',
  'Wheel Loader',
  'Track Dozer',
  'Motor Grader',
  'Drill Rig',
  'Water Tanker',
  'Support Vehicle'
];

const equipmentStatuses = [
  'Active',
  'Inactive',
  'Under Maintenance',
  'Breakdown',
  'Retired',
  'Available'
];

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: String,
      required: [true, 'Equipment ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    assetNumber: {
      type: String,
      required: [true, 'Asset number is required'],
      unique: true,
      trim: true,
      index: true
    },
    equipmentType: {
      type: String,
      required: [true, 'Equipment type is required'],
      enum: equipmentTypes,
      index: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true
    },
    yearOfManufacture: {
      type: Number,
      required: [true, 'Year of manufacture is required'],
      min: 1980,
      max: new Date().getFullYear() + 1
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required']
    },
    commissioningDate: {
      type: Date
    },
    operatingHours: {
      type: Number,
      default: 0,
      min: 0,
      index: true
    },
    mileage: {
      type: Number,
      default: 0,
      min: 0
    },
    location: {
      type: String,
      default: 'Main Pit',
      trim: true,
      index: true
    },
    assignedDepartment: {
      type: String,
      default: 'Mining Operations',
      trim: true
    },
    assignedOperator: {
      type: String,
      default: 'Unassigned',
      trim: true
    },
    status: {
      type: String,
      enum: equipmentStatuses,
      default: 'Available',
      index: true
    },
    fuelType: {
      type: String,
      enum: ['Diesel', 'Electric', 'Hybrid', 'Gasoline', 'Dual Fuel'],
      default: 'Diesel'
    },
    capacity: {
      type: String,
      default: 'N/A'
    },
    maintenanceIntervalHours: {
      type: Number,
      default: 250
    },
    lastServiceDate: {
      type: Date
    },
    nextServiceDate: {
      type: Date,
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    statusHistory: [
      {
        status: { type: String, enum: equipmentStatuses },
        changedBy: { type: String },
        changedAt: { type: Date, default: Date.now },
        reason: { type: String }
      }
    ],
    assignmentHistory: [
      {
        operator: { type: String },
        location: { type: String },
        assignedAt: { type: Date, default: Date.now },
        assignedBy: { type: String }
      }
    ]
  },
  {
    timestamps: true
  }
);

equipmentSchema.index({ equipmentType: 1, status: 1 });
equipmentSchema.index({ location: 1, status: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
