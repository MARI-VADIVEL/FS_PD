const WorkOrder = require('../models/WorkOrder');
const Equipment = require('../models/Equipment');
const SparePart = require('../models/SparePart');
const InventoryMovement = require('../models/InventoryMovement');
const MaintenanceSchedule = require('../models/MaintenanceSchedule');
const Downtime = require('../models/Downtime');
const Alert = require('../models/Alert');
const { logAudit } = require('../middleware/auditMiddleware');

const getWorkOrders = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      maintenanceType,
      equipment,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (maintenanceType) query.maintenanceType = maintenanceType;
    if (equipment) query.equipment = equipment;

    if (search) {
      query.$or = [
        { workOrderNumber: { $regex: search, $options: 'i' } },
        { problemDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await WorkOrder.countDocuments(query);
    const workOrders = await WorkOrder.find(query)
      .populate('equipment', 'equipmentId assetNumber model equipmentType location status')
      .populate('assignedEngineer', 'name email role')
      .populate('assignedTechnician', 'name email role')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: workOrders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      workOrders
    });
  } catch (err) {
    next(err);
  }
};

const getWorkOrderById = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findOne({ _id: req.params.id, isDeleted: false })
      .populate('equipment')
      .populate('assignedEngineer', 'name email role department')
      .populate('assignedTechnician', 'name email role department')
      .populate('completedBy', 'name email role')
      .populate('partsUsed.part');

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    res.status(200).json({
      success: true,
      workOrder
    });
  } catch (err) {
    next(err);
  }
};

const createWorkOrder = async (req, res, next) => {
  try {
    const {
      equipment: equipmentId,
      maintenanceType,
      priority,
      problemDescription,
      scheduledDate,
      assignedEngineer,
      assignedTechnician,
      estimatedDuration,
      estimatedCost,
      checklist = []
    } = req.body;

    const equipment = await Equipment.findOne({ _id: equipmentId, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Specified equipment not found'
      });
    }

    const count = await WorkOrder.countDocuments();
    const year = new Date().getFullYear();
    const workOrderNumber = `WO-${year}-${String(count + 1).padStart(4, '0')}`;

    const defaultChecklists = {
      Preventive: [
        { task: 'Engine oil & filter inspection', isCritical: true },
        { task: 'Hydraulic pressure test', isCritical: true },
        { task: 'Brake system check', isCritical: true },
        { task: 'Chassis and structural inspection', isCritical: false },
        { task: 'Cooling system verification', isCritical: false }
      ],
      Inspection: [
        { task: 'Walkaround visual safety inspection', isCritical: true },
        { task: 'Tyre pressure and tread depth check', isCritical: true },
        { task: 'Emergency stop and horn check', isCritical: true },
        { task: 'Fluid level verification', isCritical: false }
      ]
    };

    const initialChecklist = checklist.length > 0
      ? checklist
      : (defaultChecklists[maintenanceType] || [
          { task: 'Diagnose reported issue', isCritical: true },
          { task: 'Repair or replace defective components', isCritical: true },
          { task: 'Post-repair calibration and testing', isCritical: true }
        ]);

    const workOrder = await WorkOrder.create({
      workOrderNumber,
      equipment: equipment._id,
      maintenanceType,
      priority: priority || 'Medium',
      problemDescription,
      scheduledDate: scheduledDate || new Date(),
      assignedEngineer,
      assignedTechnician,
      estimatedDuration: estimatedDuration || 4,
      estimatedCost: estimatedCost || 0,
      checklist: initialChecklist,
      status: assignedTechnician ? 'Assigned' : 'Open'
    });

    if (maintenanceType === 'Breakdown' || priority === 'Critical') {
      equipment.status = 'Under Maintenance';
      equipment.statusHistory.push({
        status: 'Under Maintenance',
        changedBy: req.user ? req.user.name : 'System',
        reason: `Work order ${workOrderNumber} created with priority ${priority}`
      });
      await equipment.save();

      await Alert.create({
        alertType: 'Critical Equipment Breakdown',
        title: `Work Order ${workOrderNumber} Alert`,
        message: `High priority maintenance (${priority}) opened for ${equipment.equipmentId} (${equipment.assetNumber})`,
        severity: priority === 'Critical' ? 'Critical' : 'Warning',
        relatedEntity: {
          entityType: 'WorkOrder',
          entityId: workOrder._id,
          identifier: workOrderNumber
        }
      });
    }

    await logAudit({
      req,
      action: 'CREATE_WORK_ORDER',
      module: 'Maintenance',
      recordId: workOrder._id,
      description: `Created work order ${workOrderNumber} for ${equipment.equipmentId}`
    });

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      workOrder
    });
  } catch (err) {
    next(err);
  }
};

const updateWorkOrder = async (req, res, next) => {
  try {
    const workOrder = await WorkOrder.findOne({ _id: req.params.id, isDeleted: false });
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    const {
      priority,
      problemDescription,
      scheduledDate,
      assignedEngineer,
      assignedTechnician,
      estimatedDuration,
      status
    } = req.body;

    if (priority) workOrder.priority = priority;
    if (problemDescription) workOrder.problemDescription = problemDescription;
    if (scheduledDate) workOrder.scheduledDate = scheduledDate;
    if (assignedEngineer) workOrder.assignedEngineer = assignedEngineer;
    if (assignedTechnician) workOrder.assignedTechnician = assignedTechnician;
    if (estimatedDuration) workOrder.estimatedDuration = estimatedDuration;
    if (status) workOrder.status = status;

    await workOrder.save();

    await logAudit({
      req,
      action: 'UPDATE_WORK_ORDER',
      module: 'Maintenance',
      recordId: workOrder._id,
      description: `Updated work order ${workOrder.workOrderNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Work order updated successfully',
      workOrder
    });
  } catch (err) {
    next(err);
  }
};

const updateChecklist = async (req, res, next) => {
  try {
    const { checklistIndex, status, notes } = req.body;
    const workOrder = await WorkOrder.findOne({ _id: req.params.id, isDeleted: false });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    if (checklistIndex === undefined || !workOrder.checklist[checklistIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid checklist item index'
      });
    }

    workOrder.checklist[checklistIndex].status = status;
    if (notes !== undefined) {
      workOrder.checklist[checklistIndex].notes = notes;
    }

    if (workOrder.status === 'Assigned' || workOrder.status === 'Open') {
      workOrder.status = 'In Progress';
    }

    await workOrder.save();

    if (status === 'Failed' && workOrder.checklist[checklistIndex].isCritical) {
      await Alert.create({
        alertType: 'Safety Alert',
        title: `Critical Checklist Item Failed on ${workOrder.workOrderNumber}`,
        message: `Task "${workOrder.checklist[checklistIndex].task}" failed verification. Corrective action required.`,
        severity: 'Critical',
        relatedEntity: {
          entityType: 'WorkOrder',
          entityId: workOrder._id,
          identifier: workOrder.workOrderNumber
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Checklist updated',
      checklist: workOrder.checklist
    });
  } catch (err) {
    next(err);
  }
};

const issueParts = async (req, res, next) => {
  try {
    const { partId, quantity } = req.body;
    const workOrder = await WorkOrder.findOne({ _id: req.params.id, isDeleted: false });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    const sparePart = await SparePart.findOne({ _id: partId, isDeleted: false });
    if (!sparePart) {
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

    if (sparePart.quantity < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory. Available: ${sparePart.quantity}, Requested: ${qty}`
      });
    }

    const prevQty = sparePart.quantity;
    sparePart.quantity -= qty;
    await sparePart.save();

    const lineCost = qty * sparePart.unitCost;
    workOrder.partsUsed.push({
      part: sparePart._id,
      partNumber: sparePart.partNumber,
      name: sparePart.name,
      quantity: qty,
      unitCost: sparePart.unitCost,
      totalCost: lineCost
    });

    workOrder.actualPartsCost = (workOrder.actualPartsCost || 0) + lineCost;
    await workOrder.save();

    await InventoryMovement.create({
      part: sparePart._id,
      partNumber: sparePart.partNumber,
      partName: sparePart.name,
      movementType: 'WorkOrder-Issue',
      quantity: qty,
      previousQuantity: prevQty,
      newQuantity: sparePart.quantity,
      unitCost: sparePart.unitCost,
      totalCost: lineCost,
      referenceType: 'WorkOrder',
      referenceId: workOrder.workOrderNumber,
      user: req.user ? req.user.name : 'System',
      notes: `Issued to Work Order ${workOrder.workOrderNumber}`
    });

    if (sparePart.quantity <= sparePart.minStockLevel) {
      await Alert.create({
        alertType: 'Low Stock',
        title: `Low Stock Alert: ${sparePart.partNumber}`,
        message: `${sparePart.name} inventory reached ${sparePart.quantity} ${sparePart.unit} (Min: ${sparePart.minStockLevel})`,
        severity: sparePart.quantity === 0 ? 'Critical' : 'Warning',
        relatedEntity: {
          entityType: 'SparePart',
          entityId: sparePart._id,
          identifier: sparePart.partNumber
        }
      });
    }

    await logAudit({
      req,
      action: 'ISSUE_PARTS',
      module: 'Maintenance',
      recordId: workOrder._id,
      description: `Issued ${qty} x ${sparePart.partNumber} to ${workOrder.workOrderNumber}`
    });

    res.status(200).json({
      success: true,
      message: 'Spare parts issued to work order successfully',
      workOrder
    });
  } catch (err) {
    next(err);
  }
};

const completeWorkOrder = async (req, res, next) => {
  try {
    const { actualHours, actualLaborCost, completionNotes } = req.body;
    const workOrder = await WorkOrder.findOne({ _id: req.params.id, isDeleted: false });

    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    workOrder.actualDuration = actualHours || workOrder.estimatedDuration;
    workOrder.actualLaborCost = actualLaborCost !== undefined ? actualLaborCost : (workOrder.actualDuration * 50);
    workOrder.completionNotes = completionNotes || 'Work completed in accordance with specifications';
    workOrder.status = 'Completed';
    workOrder.completedBy = req.user ? req.user._id : null;
    workOrder.completedAt = new Date();

    await workOrder.save();

    const equipment = await Equipment.findById(workOrder.equipment);
    if (equipment) {
      if (equipment.status === 'Under Maintenance' || equipment.status === 'Breakdown') {
        equipment.status = 'Active';
        equipment.statusHistory.push({
          status: 'Active',
          changedBy: req.user ? req.user.name : 'System',
          reason: `Work order ${workOrder.workOrderNumber} completed`
        });
      }
      equipment.lastServiceDate = new Date();
      if (equipment.maintenanceIntervalHours) {
        equipment.nextServiceDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      await equipment.save();

      const activeDowntime = await Downtime.findOne({
        equipment: equipment._id,
        endTime: null
      }).sort({ startTime: -1 });

      if (activeDowntime) {
        activeDowntime.endTime = new Date();
        activeDowntime.workOrder = workOrder._id;
        await activeDowntime.save();
      }
    }

    await logAudit({
      req,
      action: 'COMPLETE_WORK_ORDER',
      module: 'Maintenance',
      recordId: workOrder._id,
      description: `Marked work order ${workOrder.workOrderNumber} as Completed. Total Cost: ₹${workOrder.actualCost}`
    });

    res.status(200).json({
      success: true,
      message: 'Work order completed successfully',
      workOrder
    });
  } catch (err) {
    next(err);
  }
};

const getSchedules = async (req, res, next) => {
  try {
    const schedules = await MaintenanceSchedule.find({ status: 'Active' })
      .populate('equipment', 'equipmentId assetNumber model location status');
    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (err) {
    next(err);
  }
};

const createSchedule = async (req, res, next) => {
  try {
    const schedule = await MaintenanceSchedule.create(req.body);
    await logAudit({
      req,
      action: 'CREATE_SCHEDULE',
      module: 'Maintenance',
      recordId: schedule._id,
      description: `Created maintenance schedule ${schedule.title}`
    });
    res.status(201).json({
      success: true,
      message: 'Maintenance schedule created',
      schedule
    });
  } catch (err) {
    next(err);
  }
};

const getDowntimes = async (req, res, next) => {
  try {
    const { equipment, category, limit = 20 } = req.query;
    const query = {};
    if (equipment) query.equipment = equipment;
    if (category) query.category = category;

    const downtimes = await Downtime.find(query)
      .populate('equipment', 'equipmentId assetNumber model')
      .populate('workOrder', 'workOrderNumber status')
      .sort({ startTime: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: downtimes.length,
      downtimes
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateChecklist,
  issueParts,
  completeWorkOrder,
  getSchedules,
  createSchedule,
  getDowntimes
};
