const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      required: [true, 'Part number is required'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Part name is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Hydraulic',
        'Engine',
        'Transmission',
        'Electrical',
        'Braking',
        'Filtration',
        'Chassis',
        'Fasteners',
        'Consumables'
      ],
      index: true
    },
    manufacturer: {
      type: String,
      required: true,
      trim: true
    },
    supplier: {
      type: String,
      default: 'Global Mining Spares Ltd'
    },
    unit: {
      type: String,
      enum: ['Pieces', 'Kits', 'Sets', 'Liters', 'Meters', 'Boxes'],
      default: 'Pieces'
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      index: true
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 5
    },
    maxStockLevel: {
      type: Number,
      default: 50
    },
    unitCost: {
      type: Number,
      required: true,
      min: 0
    },
    storageLocation: {
      type: String,
      default: 'Main Warehouse - Rack A1',
      trim: true
    },
    compatibleEquipmentTypes: [
      {
        type: String
      }
    ],
    compatibleModels: [
      {
        type: String
      }
    ],
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
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

sparePartSchema.pre('save', function (next) {
  if (this.quantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('SparePart', sparePartSchema);
