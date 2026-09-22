const mongoose = require('mongoose');

const inventoryMovementSchema = new mongoose.Schema(
  {
    part: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SparePart',
      required: true,
      index: true
    },
    partNumber: {
      type: String
    },
    partName: {
      type: String
    },
    movementType: {
      type: String,
      enum: ['Stock-In', 'Stock-Out', 'Adjustment', 'WorkOrder-Issue', 'WorkOrder-Return'],
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousQuantity: {
      type: Number,
      default: 0
    },
    newQuantity: {
      type: Number,
      default: 0
    },
    unitCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    },
    referenceType: {
      type: String,
      enum: ['WorkOrder', 'PurchaseOrder', 'Manual Adjustment', 'Initial Stock'],
      default: 'Manual Adjustment'
    },
    referenceId: {
      type: String,
      default: ''
    },
    user: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: ''
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

module.exports = mongoose.model('InventoryMovement', inventoryMovementSchema);
