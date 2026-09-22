const SparePart = require('../models/SparePart');
const InventoryMovement = require('../models/InventoryMovement');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Alert = require('../models/Alert');
const { logAudit } = require('../middleware/auditMiddleware');

const getSpareParts = async (req, res, next) => {
  try {
    const {
      category,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { partNumber: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { storageLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await SparePart.countDocuments(query);
    const parts = await SparePart.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: parts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      parts
    });
  } catch (err) {
    next(err);
  }
};

const getSparePartById = async (req, res, next) => {
  try {
    const part = await SparePart.findOne({ _id: req.params.id, isDeleted: false });
    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }

    const movements = await InventoryMovement.find({ part: part._id })
      .sort({ date: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      part,
      movements
    });
  } catch (err) {
    next(err);
  }
};

const createSparePart = async (req, res, next) => {
  try {
    const {
      partNumber,
      name,
      category,
      manufacturer,
      supplier,
      unit,
      quantity,
      minStockLevel,
      maxStockLevel,
      unitCost,
      storageLocation,
      compatibleEquipmentTypes,
      compatibleModels,
      description
    } = req.body;

    const existing = await SparePart.findOne({ partNumber });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Part number already exists'
      });
    }

    const part = await SparePart.create({
      partNumber,
      name,
      category,
      manufacturer,
      supplier: supplier || 'Global Spares',
      unit: unit || 'Pieces',
      quantity: quantity || 0,
      minStockLevel: minStockLevel || 5,
      maxStockLevel: maxStockLevel || 50,
      unitCost: unitCost || 0,
      storageLocation: storageLocation || 'Warehouse Main',
      compatibleEquipmentTypes: compatibleEquipmentTypes || [],
      compatibleModels: compatibleModels || [],
      description: description || ''
    });

    if (quantity > 0) {
      await InventoryMovement.create({
        part: part._id,
        partNumber: part.partNumber,
        partName: part.name,
        movementType: 'Stock-In',
        quantity: quantity,
        previousQuantity: 0,
        newQuantity: quantity,
        unitCost: part.unitCost,
        totalCost: quantity * part.unitCost,
        referenceType: 'Initial Stock',
        user: req.user ? req.user.name : 'System',
        notes: 'Initial inventory registration'
      });
    }

    await logAudit({
      req,
      action: 'CREATE_SPARE_PART',
      module: 'Inventory',
      recordId: part._id,
      description: `Added spare part ${part.partNumber} (${part.name})`
    });

    res.status(201).json({
      success: true,
      message: 'Spare part created successfully',
      part
    });
  } catch (err) {
    next(err);
  }
};

const updateSparePart = async (req, res, next) => {
  try {
    const part = await SparePart.findOne({ _id: req.params.id, isDeleted: false });
    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }

    const updatable = [
      'name',
      'category',
      'manufacturer',
      'supplier',
      'unit',
      'minStockLevel',
      'maxStockLevel',
      'unitCost',
      'storageLocation',
      'description'
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        part[field] = req.body[field];
      }
    });

    await part.save();

    await logAudit({
      req,
      action: 'UPDATE_SPARE_PART',
      module: 'Inventory',
      recordId: part._id,
      description: `Updated spare part details for ${part.partNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Spare part updated successfully',
      part
    });
  } catch (err) {
    next(err);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const { quantity, unitCost, referenceId, notes } = req.body;
    const part = await SparePart.findOne({ _id: req.params.id, isDeleted: false });

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    const prevQty = part.quantity;
    part.quantity += qty;
    if (unitCost !== undefined && Number(unitCost) > 0) {
      part.unitCost = Number(unitCost);
    }
    await part.save();

    const movement = await InventoryMovement.create({
      part: part._id,
      partNumber: part.partNumber,
      partName: part.name,
      movementType: 'Stock-In',
      quantity: qty,
      previousQuantity: prevQty,
      newQuantity: part.quantity,
      unitCost: part.unitCost,
      totalCost: qty * part.unitCost,
      referenceType: referenceId ? 'PurchaseOrder' : 'Manual Adjustment',
      referenceId: referenceId || '',
      user: req.user ? req.user.name : 'System',
      notes: notes || 'Stock received'
    });

    await logAudit({
      req,
      action: 'STOCK_IN',
      module: 'Inventory',
      recordId: part._id,
      description: `Stocked in ${qty} ${part.unit} for ${part.partNumber}. New stock: ${part.quantity}`
    });

    res.status(200).json({
      success: true,
      message: `Stock updated. Current stock: ${part.quantity}`,
      part,
      movement
    });
  } catch (err) {
    next(err);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const { quantity, referenceId, notes } = req.body;
    const part = await SparePart.findOne({ _id: req.params.id, isDeleted: false });

    if (!part) {
      return res.status(404).json({
        success: false,
        message: 'Spare part not found'
      });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }

    if (part.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient quantity in stock. Available: ${part.quantity}`
      });
    }

    const prevQty = part.quantity;
    part.quantity -= qty;
    await part.save();

    const movement = await InventoryMovement.create({
      part: part._id,
      partNumber: part.partNumber,
      partName: part.name,
      movementType: 'Stock-Out',
      quantity: qty,
      previousQuantity: prevQty,
      newQuantity: part.quantity,
      unitCost: part.unitCost,
      totalCost: qty * part.unitCost,
      referenceType: referenceId ? 'WorkOrder' : 'Manual Adjustment',
      referenceId: referenceId || '',
      user: req.user ? req.user.name : 'System',
      notes: notes || 'Stock-out / issue'
    });

    if (part.quantity <= part.minStockLevel) {
      await Alert.create({
        alertType: 'Low Stock',
        title: `Low Stock: ${part.partNumber}`,
        message: `${part.name} is down to ${part.quantity} ${part.unit} (Minimum: ${part.minStockLevel})`,
        severity: part.quantity === 0 ? 'Critical' : 'Warning',
        relatedEntity: {
          entityType: 'SparePart',
          entityId: part._id,
          identifier: part.partNumber
        }
      });
    }

    await logAudit({
      req,
      action: 'STOCK_OUT',
      module: 'Inventory',
      recordId: part._id,
      description: `Issued ${qty} ${part.unit} of ${part.partNumber}. Remaining stock: ${part.quantity}`
    });

    res.status(200).json({
      success: true,
      message: `Stock issued. Remaining stock: ${part.quantity}`,
      part,
      movement
    });
  } catch (err) {
    next(err);
  }
};

const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isDeleted: false }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (err) {
    next(err);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    await logAudit({
      req,
      action: 'CREATE_SUPPLIER',
      module: 'Inventory',
      recordId: supplier._id,
      description: `Added supplier ${supplier.name}`
    });
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      supplier
    });
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await PurchaseOrder.countDocuments(query);
    const orders = await PurchaseOrder.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (err) {
    next(err);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { supplier, expectedDeliveryDate, items, notes } = req.body;
    const count = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const order = await PurchaseOrder.create({
      poNumber,
      supplier,
      expectedDeliveryDate,
      items,
      notes: notes || '',
      createdBy: req.user ? req.user.name : 'System'
    });

    await logAudit({
      req,
      action: 'CREATE_PURCHASE_ORDER',
      module: 'Inventory',
      recordId: order._id,
      description: `Created purchase order ${poNumber} for ${supplier}`
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      order
    });
  } catch (err) {
    next(err);
  }
};

const receivePurchaseOrder = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    if (order.status === 'Received') {
      return res.status(400).json({
        success: false,
        message: 'Purchase order is already marked as received'
      });
    }

    for (const item of order.items) {
      const part = await SparePart.findById(item.part);
      if (part) {
        const prevQty = part.quantity;
        part.quantity += item.quantity;
        if (item.unitCost) part.unitCost = item.unitCost;
        await part.save();

        await InventoryMovement.create({
          part: part._id,
          partNumber: part.partNumber,
          partName: part.name,
          movementType: 'Stock-In',
          quantity: item.quantity,
          previousQuantity: prevQty,
          newQuantity: part.quantity,
          unitCost: item.unitCost,
          totalCost: item.totalCost || item.quantity * item.unitCost,
          referenceType: 'PurchaseOrder',
          referenceId: order.poNumber,
          user: req.user ? req.user.name : 'System',
          notes: `Stock received via PO ${order.poNumber}`
        });
      }
    }

    order.status = 'Received';
    order.receivedDate = new Date();
    await order.save();

    await logAudit({
      req,
      action: 'RECEIVE_PURCHASE_ORDER',
      module: 'Inventory',
      recordId: order._id,
      description: `Received goods for purchase order ${order.poNumber}. Inventory updated.`
    });

    res.status(200).json({
      success: true,
      message: `Purchase order ${order.poNumber} received and inventory updated`,
      order
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  stockIn,
  stockOut,
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder
};
