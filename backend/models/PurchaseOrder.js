const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: {
      type: String,
      required: [true, 'PO number is required'],
      unique: true,
      trim: true,
      index: true
    },
    supplier: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    expectedDeliveryDate: {
      type: Date,
      required: true
    },
    items: [
      {
        part: { type: mongoose.Schema.Types.ObjectId, ref: 'SparePart' },
        partNumber: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type: Number, required: true, min: 0 },
        totalCost: { type: Number, required: true, min: 0 }
      }
    ],
    totalAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Draft', 'Ordered', 'Partially Received', 'Received', 'Cancelled'],
      default: 'Ordered',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: String,
      default: 'System'
    },
    receivedDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

purchaseOrderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((sum, item) => sum + (item.totalCost || item.quantity * item.unitCost), 0);
  }
  next();
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
