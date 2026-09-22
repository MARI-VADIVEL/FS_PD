const mongoose = require('mongoose');

const damageTypes = [
  'None',
  'Puncture',
  'Sidewall Damage',
  'Uneven Wear',
  'Cut',
  'Crack',
  'Heat Damage',
  'Rim Damage',
  'Other'
];

const recommendations = [
  'Continue Service',
  'Rotate Position',
  'Adjust Pressure',
  'Send for Repair',
  'Send for Retread',
  'Scrap Tyre'
];

const tyreInspectionSchema = new mongoose.Schema(
  {
    tyre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tyre',
      required: [true, 'Tyre reference is required'],
      index: true
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      index: true
    },
    inspectionDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    inspector: {
      type: String,
      required: [true, 'Inspector name is required'],
      trim: true
    },
    treadDepth: {
      type: Number,
      required: [true, 'Tread depth is required'],
      min: 0
    },
    pressure: {
      type: Number,
      required: [true, 'Pressure reading is required'],
      min: 0
    },
    temperature: {
      type: Number,
      default: 45
    },
    visualCondition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      required: true
    },
    damageType: {
      type: String,
      enum: damageTypes,
      default: 'None'
    },
    sidewallCondition: {
      type: String,
      enum: ['Intact', 'Minor Scuffs', 'Deep Cuts', 'Bulges'],
      default: 'Intact'
    },
    beadCondition: {
      type: String,
      enum: ['Normal', 'Minor Wear', 'Deformed', 'Cracked'],
      default: 'Normal'
    },
    recommendation: {
      type: String,
      enum: recommendations,
      default: 'Continue Service'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TyreInspection', tyreInspectionSchema);
