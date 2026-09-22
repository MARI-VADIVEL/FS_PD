const mongoose = require('mongoose');

const tyreStatuses = [
  'In Stock',
  'Installed',
  'Under Inspection',
  'Under Repair',
  'Retread',
  'Retired',
  'Scrapped'
];

const tyreConditions = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

const tyrePositions = [
  'front-left',
  'front-right',
  'rear-left-outer',
  'rear-left-inner',
  'rear-right-outer',
  'rear-right-inner',
  'spare',
  'unassigned'
];

const tyreSchema = new mongoose.Schema(
  {
    tyreId: {
      type: String,
      required: [true, 'Tyre ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      unique: true,
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true
    },
    tyreSize: {
      type: String,
      required: [true, 'Tyre size is required'],
      trim: true,
      index: true
    },
    tyreType: {
      type: String,
      enum: ['Radial OTR', 'Bias OTR', 'Solid', 'Specialty'],
      default: 'Radial OTR'
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required']
    },
    purchaseCost: {
      type: Number,
      required: [true, 'Purchase cost is required'],
      min: 0
    },
    status: {
      type: String,
      enum: tyreStatuses,
      default: 'In Stock',
      index: true
    },
    condition: {
      type: String,
      enum: tyreConditions,
      default: 'Excellent',
      index: true
    },
    currentPosition: {
      type: String,
      enum: tyrePositions,
      default: 'unassigned'
    },
    assignedEquipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      index: true
    },
    installationDate: {
      type: Date
    },
    installationHours: {
      type: Number,
      default: 0
    },
    currentOperatingHours: {
      type: Number,
      default: 0
    },
    initialTreadDepth: {
      type: Number,
      required: [true, 'Initial tread depth is required'],
      min: 0
    },
    currentTreadDepth: {
      type: Number,
      required: [true, 'Current tread depth is required'],
      min: 0,
      index: true
    },
    recommendedPressure: {
      type: Number,
      default: 102
    },
    currentPressure: {
      type: Number,
      default: 102
    },
    currentTemperature: {
      type: Number,
      default: 45
    },
    totalLifeHours: {
      type: Number,
      default: 0
    },
    costPerHour: {
      type: Number,
      default: 0
    },
    lastInspectionDate: {
      type: Date
    },
    nextInspectionDate: {
      type: Date,
      index: true
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

tyreSchema.index({ brand: 1, status: 1 });
tyreSchema.index({ assignedEquipment: 1, status: 1 });

tyreSchema.pre('save', function (next) {
  if (this.currentOperatingHours > 0 && this.purchaseCost > 0) {
    this.costPerHour = parseFloat((this.purchaseCost / this.currentOperatingHours).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('Tyre', tyreSchema);
