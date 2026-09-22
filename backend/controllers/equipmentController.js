const Equipment = require('../models/Equipment');
const Tyre = require('../models/Tyre');
const WorkOrder = require('../models/WorkOrder');
const Downtime = require('../models/Downtime');
const { calculateEquipmentHealth } = require('../utils/healthCalculator');
const { logAudit } = require('../middleware/auditMiddleware');

const getEquipments = async (req, res, next) => {
  try {
    const {
      search,
      equipmentType,
      status,
      location,
      maintenanceDue,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const query = { isDeleted: false };

    if (search) {
      query.$or = [
        { equipmentId: { $regex: search, $options: 'i' } },
        { assetNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { assignedOperator: { $regex: search, $options: 'i' } }
      ];
    }

    if (equipmentType) query.equipmentType = equipmentType;
    if (status) query.status = status;
    if (location) query.location = location;

    if (maintenanceDue === 'true') {
      const now = new Date();
      query.nextServiceDate = { $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) };
    }

    const sortOptions = {};
    const allowedSortFields = ['equipmentId', 'assetNumber', 'operatingHours', 'nextServiceDate', 'createdAt', 'status'];
    const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    sortOptions[safeSortField] = sortOrder === 'asc' ? 1 : -1;

    const total = await Equipment.countDocuments(query);
    const equipments = await Equipment.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: equipments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      equipments
    });
  } catch (err) {
    next(err);
  }
};

const getEquipmentById = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOne({ _id: req.params.id, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const assignedTyres = await Tyre.find({ assignedEquipment: equipment._id, isDeleted: false });
    const workOrders = await WorkOrder.find({ equipment: equipment._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('assignedEngineer assignedTechnician', 'name email');

    const downtimes = await Downtime.find({ equipment: equipment._id })
      .sort({ startTime: -1 })
      .limit(10);

    const healthScore = calculateEquipmentHealth(equipment, workOrders, downtimes);

    res.status(200).json({
      success: true,
      equipment,
      assignedTyres,
      workOrders,
      downtimes,
      healthScore
    });
  } catch (err) {
    next(err);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const {
      equipmentId,
      assetNumber,
      equipmentType,
      manufacturer,
      model,
      serialNumber,
      yearOfManufacture,
      purchaseDate,
      commissioningDate,
      operatingHours,
      mileage,
      location,
      assignedDepartment,
      assignedOperator,
      status,
      fuelType,
      capacity,
      maintenanceIntervalHours,
      nextServiceDate,
      notes
    } = req.body;

    const existingAsset = await Equipment.findOne({
      $or: [{ equipmentId }, { assetNumber }]
    });

    if (existingAsset) {
      return res.status(409).json({
        success: false,
        message: 'Equipment with this Equipment ID or Asset Number already exists'
      });
    }

    const equipment = await Equipment.create({
      equipmentId,
      assetNumber,
      equipmentType,
      manufacturer,
      model,
      serialNumber,
      yearOfManufacture,
      purchaseDate,
      commissioningDate: commissioningDate || purchaseDate,
      operatingHours: operatingHours || 0,
      mileage: mileage || 0,
      location: location || 'Main Pit',
      assignedDepartment: assignedDepartment || 'Mining Operations',
      assignedOperator: assignedOperator || 'Unassigned',
      status: status || 'Available',
      fuelType: fuelType || 'Diesel',
      capacity: capacity || 'N/A',
      maintenanceIntervalHours: maintenanceIntervalHours || 250,
      nextServiceDate,
      notes: notes || '',
      statusHistory: [
        {
          status: status || 'Available',
          changedBy: req.user ? req.user.name : 'System',
          reason: 'Initial equipment registration'
        }
      ],
      assignmentHistory: [
        {
          operator: assignedOperator || 'Unassigned',
          location: location || 'Main Pit',
          assignedBy: req.user ? req.user.name : 'System'
        }
      ]
    });

    await logAudit({
      req,
      action: 'CREATE_EQUIPMENT',
      module: 'Equipment',
      recordId: equipment._id,
      description: `Registered new equipment ${equipment.equipmentId} (${equipment.assetNumber})`
    });

    res.status(201).json({
      success: true,
      message: 'Equipment registered successfully',
      equipment
    });
  } catch (err) {
    next(err);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findOne({ _id: req.params.id, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const updatableFields = [
      'manufacturer',
      'model',
      'serialNumber',
      'yearOfManufacture',
      'purchaseDate',
      'commissioningDate',
      'operatingHours',
      'mileage',
      'fuelType',
      'capacity',
      'maintenanceIntervalHours',
      'lastServiceDate',
      'nextServiceDate',
      'notes'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        equipment[field] = req.body[field];
      }
    });

    await equipment.save();

    await logAudit({
      req,
      action: 'UPDATE_EQUIPMENT',
      module: 'Equipment',
      recordId: equipment._id,
      description: `Updated equipment specifications for ${equipment.equipmentId}`
    });

    res.status(200).json({
      success: true,
      message: 'Equipment updated successfully',
      equipment
    });
  } catch (err) {
    next(err);
  }
};

const updateEquipmentStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const equipment = await Equipment.findOne({ _id: req.params.id, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    const previousStatus = equipment.status;
    equipment.status = status;
    equipment.statusHistory.push({
      status,
      changedBy: req.user ? req.user.name : 'System',
      changedAt: new Date(),
      reason: reason || `Status changed from ${previousStatus} to ${status}`
    });

    await equipment.save();

    if (status === 'Breakdown') {
      await Downtime.create({
        equipment: equipment._id,
        startTime: new Date(),
        category: 'Mechanical',
        reason: reason || 'Equipment breakdown reported',
        impactLevel: 'Major'
      });
    } else if (previousStatus === 'Breakdown' && status !== 'Breakdown') {
      const activeDowntime = await Downtime.findOne({
        equipment: equipment._id,
        endTime: null
      }).sort({ startTime: -1 });

      if (activeDowntime) {
        activeDowntime.endTime = new Date();
        await activeDowntime.save();
      }
    }

    await logAudit({
      req,
      action: 'UPDATE_EQUIPMENT_STATUS',
      module: 'Equipment',
      recordId: equipment._id,
      description: `Changed equipment ${equipment.equipmentId} status from ${previousStatus} to ${status}`
    });

    res.status(200).json({
      success: true,
      message: `Equipment status updated to ${status}`,
      equipment
    });
  } catch (err) {
    next(err);
  }
};

const assignEquipment = async (req, res, next) => {
  try {
    const { operator, location } = req.body;
    const equipment = await Equipment.findOne({ _id: req.params.id, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    if (operator) equipment.assignedOperator = operator;
    if (location) equipment.location = location;

    equipment.assignmentHistory.push({
      operator: operator || equipment.assignedOperator,
      location: location || equipment.location,
      assignedBy: req.user ? req.user.name : 'System',
      assignedAt: new Date()
    });

    await equipment.save();

    await logAudit({
      req,
      action: 'ASSIGN_EQUIPMENT',
      module: 'Equipment',
      recordId: equipment._id,
      description: `Assigned equipment ${equipment.equipmentId} to ${operator || equipment.assignedOperator} at ${location || equipment.location}`
    });

    res.status(200).json({
      success: true,
      message: 'Equipment assignment updated successfully',
      equipment
    });
  } catch (err) {
    next(err);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    equipment.isDeleted = true;
    equipment.status = 'Retired';
    await equipment.save();

    await logAudit({
      req,
      action: 'DELETE_EQUIPMENT',
      module: 'Equipment',
      recordId: equipment._id,
      description: `Soft deleted equipment ${equipment.equipmentId}`
    });

    res.status(200).json({
      success: true,
      message: 'Equipment removed successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  assignEquipment,
  deleteEquipment
};
