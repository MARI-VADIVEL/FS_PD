const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global_config'
    },
    maintenanceLeadHours: {
      type: Number,
      default: 50
    },
    maintenanceLeadDays: {
      type: Number,
      default: 7
    },
    tyreTreadCriticalMm: {
      type: Number,
      default: 15
    },
    tyrePressureMinPsi: {
      type: Number,
      default: 90
    },
    tyrePressureMaxPsi: {
      type: Number,
      default: 115
    },
    lowStockThresholdDefault: {
      type: Number,
      default: 5
    },
    currency: {
      type: String,
      default: 'INR'
    },
    locations: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['Mine Site', 'Pit', 'Workshop', 'Stockyard', 'Storage'], default: 'Pit' }
      }
    ],
    departments: [
      {
        name: { type: String, required: true }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);
