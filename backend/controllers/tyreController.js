const Tyre = require('../models/Tyre');
const Equipment = require('../models/Equipment');
const TyreInspection = require('../models/TyreInspection');
const TyreHistory = require('../models/TyreHistory');
const Alert = require('../models/Alert');
const { calculateTyreHealth } = require('../utils/healthCalculator');
const { logAudit } = require('../middleware/auditMiddleware');

const getTyres = async (req, res, next) => {
  try {
    const {
      status,
      condition,
      tyreSize,
      brand,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { isDeleted: false };

    if (status) query.status = status;
    if (condition) query.condition = condition;
    if (tyreSize) query.tyreSize = tyreSize;
    if (brand) query.brand = brand;

    if (search) {
      query.$or = [
        { tyreId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Tyre.countDocuments(query);
    const tyres = await Tyre.find(query)
      .populate('assignedEquipment', 'equipmentId assetNumber model location status')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: tyres.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      tyres
    });
  } catch (err) {
    next(err);
  }
};

const getTyreById = async (req, res, next) => {
  try {
    const tyre = await Tyre.findOne({ _id: req.params.id, isDeleted: false }).populate(
      'assignedEquipment',
      'equipmentId assetNumber model location operatingHours status'
    );

    if (!tyre) {
      return res.status(404).json({
        success: false,
        message: 'Tyre not found'
      });
    }

    const inspections = await TyreInspection.find({ tyre: tyre._id })
      .sort({ inspectionDate: -1 })
      .limit(20);

    const history = await TyreHistory.find({ tyre: tyre._id })
      .sort({ date: -1 })
      .populate('equipment', 'equipmentId assetNumber');

    const healthScore = calculateTyreHealth(tyre);

    res.status(200).json({
      success: true,
      tyre,
      inspections,
      history,
      healthScore
    });
  } catch (err) {
    next(err);
  }
};

const createTyre = async (req, res, next) => {
  try {
    const {
      tyreId,
      serialNumber,
      brand,
      model,
      tyreSize,
      tyreType,
      purchaseDate,
      purchaseCost,
      initialTreadDepth,
      recommendedPressure
    } = req.body;

    const existing = await Tyre.findOne({
      $or: [{ tyreId }, { serialNumber }]
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Tyre with this Tyre ID or Serial Number already exists'
      });
    }

    const tyre = await Tyre.create({
      tyreId,
      serialNumber,
      brand,
      model,
      tyreSize,
      tyreType: tyreType || 'Radial OTR',
      purchaseDate: purchaseDate || new Date(),
      purchaseCost,
      initialTreadDepth,
      currentTreadDepth: initialTreadDepth,
      recommendedPressure: recommendedPressure || 102,
      currentPressure: recommendedPressure || 102,
      status: 'In Stock',
      condition: 'Excellent'
    });

    await TyreHistory.create({
      tyre: tyre._id,
      eventType: 'Purchase',
      equipmentHours: 0,
      tyreHours: 0,
      treadDepth: initialTreadDepth,
      pressure: recommendedPressure || 102,
      reason: 'Procurement and stock receipt',
      performedBy: req.user ? req.user.name : 'System'
    });

    await logAudit({
      req,
      action: 'CREATE_TYRE',
      module: 'Tyres',
      recordId: tyre._id,
      description: `Registered new tyre ${tyre.tyreId} (${tyre.brand} ${tyre.tyreSize})`
    });

    res.status(201).json({
      success: true,
      message: 'Tyre registered in stock successfully',
      tyre
    });
  } catch (err) {
    next(err);
  }
};

const installTyre = async (req, res, next) => {
  try {
    const { tyreId, equipmentId, position, installationHours, currentPressure, currentTreadDepth } = req.body;

    const tyre = await Tyre.findOne({ _id: tyreId, isDeleted: false });
    if (!tyre) {
      return res.status(404).json({
        success: false,
        message: 'Tyre not found'
      });
    }

    if (tyre.status === 'Installed') {
      return res.status(400).json({
        success: false,
        message: 'This tyre is already installed on an equipment. Please remove it first.'
      });
    }

    const equipment = await Equipment.findOne({ _id: equipmentId, isDeleted: false });
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Target equipment not found'
      });
    }

    const existingOccupant = await Tyre.findOne({
      assignedEquipment: equipment._id,
      currentPosition: position,
      status: 'Installed',
      isDeleted: false
    });

    if (existingOccupant) {
      return res.status(409).json({
        success: false,
        message: `Position '${position}' on ${equipment.equipmentId} is already occupied by tyre ${existingOccupant.tyreId}`
      });
    }

    tyre.assignedEquipment = equipment._id;
    tyre.currentPosition = position;
    tyre.status = 'Installed';
    tyre.installationDate = new Date();
    tyre.installationHours = installationHours || equipment.operatingHours || 0;
    if (currentPressure) tyre.currentPressure = Number(currentPressure);
    if (currentTreadDepth) tyre.currentTreadDepth = Number(currentTreadDepth);

    await tyre.save();

    await TyreHistory.create({
      tyre: tyre._id,
      equipment: equipment._id,
      eventType: 'Installation',
      toPosition: position,
      equipmentHours: tyre.installationHours,
      tyreHours: tyre.currentOperatingHours,
      treadDepth: tyre.currentTreadDepth,
      pressure: tyre.currentPressure,
      reason: `Installed on ${equipment.equipmentId} (${position})`,
      performedBy: req.user ? req.user.name : 'System'
    });

    await logAudit({
      req,
      action: 'INSTALL_TYRE',
      module: 'Tyres',
      recordId: tyre._id,
      description: `Installed tyre ${tyre.tyreId} on ${equipment.equipmentId} at position ${position}`
    });

    res.status(200).json({
      success: true,
      message: `Tyre ${tyre.tyreId} installed on ${equipment.equipmentId} (${position})`,
      tyre
    });
  } catch (err) {
    next(err);
  }
};

const removeTyre = async (req, res, next) => {
  try {
    const { tyreId, removalReason, currentHours, currentTreadDepth, nextStatus = 'In Stock' } = req.body;

    const tyre = await Tyre.findOne({ _id: tyreId, isDeleted: false }).populate('assignedEquipment');
    if (!tyre) {
      return res.status(404).json({
        success: false,
        message: 'Tyre not found'
      });
    }

    if (tyre.status !== 'Installed') {
      return res.status(400).json({
        success: false,
        message: 'Tyre is not currently installed'
      });
    }

    const previousEquipment = tyre.assignedEquipment;
    const oldPosition = tyre.currentPosition;

    if (currentHours && currentHours > tyre.installationHours) {
      const runDelta = currentHours - tyre.installationHours;
      tyre.currentOperatingHours = (tyre.currentOperatingHours || 0) + runDelta;
    }
    if (currentTreadDepth) {
      tyre.currentTreadDepth = Number(currentTreadDepth);
    }

    tyre.assignedEquipment = null;
    tyre.currentPosition = 'unassigned';
    tyre.status = nextStatus;

    if (tyre.currentTreadDepth < 15) {
      tyre.condition = 'Critical';
    } else if (tyre.currentTreadDepth < 30) {
      tyre.condition = 'Poor';
    }

    await tyre.save();

    await TyreHistory.create({
      tyre: tyre._id,
      equipment: previousEquipment ? previousEquipment._id : null,
      eventType: 'Removal',
      fromPosition: oldPosition,
      equipmentHours: currentHours || 0,
      tyreHours: tyre.currentOperatingHours,
      treadDepth: tyre.currentTreadDepth,
      reason: removalReason || 'Routine removal / rotation',
      performedBy: req.user ? req.user.name : 'System'
    });

    await logAudit({
      req,
      action: 'REMOVE_TYRE',
      module: 'Tyres',
      recordId: tyre._id,
      description: `Removed tyre ${tyre.tyreId} from ${previousEquipment ? previousEquipment.equipmentId : 'Equipment'}. Status set to ${nextStatus}`
    });

    res.status(200).json({
      success: true,
      message: `Tyre removed from service and marked as ${nextStatus}`,
      tyre
    });
  } catch (err) {
    next(err);
  }
};

const rotateTyres = async (req, res, next) => {
  try {
    const { tyreId, newPosition, equipmentHours, reason } = req.body;

    const tyre = await Tyre.findOne({ _id: tyreId, isDeleted: false }).populate('assignedEquipment');
    if (!tyre || tyre.status !== 'Installed' || !tyre.assignedEquipment) {
      return res.status(400).json({
        success: false,
        message: 'Tyre must be currently installed on an equipment to rotate'
      });
    }

    const equipmentId = tyre.assignedEquipment._id;
    const oldPosition = tyre.currentPosition;

    const targetOccupant = await Tyre.findOne({
      assignedEquipment: equipmentId,
      currentPosition: newPosition,
      status: 'Installed',
      isDeleted: false
    });

    if (targetOccupant && targetOccupant._id.toString() !== tyre._id.toString()) {
      targetOccupant.currentPosition = oldPosition;
      await targetOccupant.save();

      await TyreHistory.create({
        tyre: targetOccupant._id,
        equipment: equipmentId,
        eventType: 'Rotation',
        fromPosition: newPosition,
        toPosition: oldPosition,
        equipmentHours: equipmentHours || 0,
        tyreHours: targetOccupant.currentOperatingHours,
        reason: `Swapped with tyre ${tyre.tyreId}`,
        performedBy: req.user ? req.user.name : 'System'
      });
    }

    tyre.currentPosition = newPosition;
    await tyre.save();

    await TyreHistory.create({
      tyre: tyre._id,
      equipment: equipmentId,
      eventType: 'Rotation',
      fromPosition: oldPosition,
      toPosition: newPosition,
      equipmentHours: equipmentHours || 0,
      tyreHours: tyre.currentOperatingHours,
      reason: reason || 'Scheduled position rotation',
      performedBy: req.user ? req.user.name : 'System'
    });

    await logAudit({
      req,
      action: 'ROTATE_TYRE',
      module: 'Tyres',
      recordId: tyre._id,
      description: `Rotated tyre ${tyre.tyreId} from ${oldPosition} to ${newPosition}`
    });

    res.status(200).json({
      success: true,
      message: `Tyre rotated to position ${newPosition} successfully`,
      tyre
    });
  } catch (err) {
    next(err);
  }
};

const recordInspection = async (req, res, next) => {
  try {
    const {
      tyreId,
      treadDepth,
      pressure,
      temperature,
      visualCondition,
      damageType,
      sidewallCondition,
      beadCondition,
      recommendation,
      notes
    } = req.body;

    const tyre = await Tyre.findOne({ _id: tyreId, isDeleted: false });
    if (!tyre) {
      return res.status(404).json({
        success: false,
        message: 'Tyre not found'
      });
    }

    const inspection = await TyreInspection.create({
      tyre: tyre._id,
      equipment: tyre.assignedEquipment,
      inspectionDate: new Date(),
      inspector: req.user ? req.user.name : 'Inspector',
      treadDepth: Number(treadDepth),
      pressure: Number(pressure),
      temperature: Number(temperature) || 45,
      visualCondition: visualCondition || 'Good',
      damageType: damageType || 'None',
      sidewallCondition: sidewallCondition || 'Intact',
      beadCondition: beadCondition || 'Normal',
      recommendation: recommendation || 'Continue Service',
      notes: notes || ''
    });

    tyre.currentTreadDepth = Number(treadDepth);
    tyre.currentPressure = Number(pressure);
    tyre.currentTemperature = Number(temperature) || tyre.currentTemperature;
    tyre.condition = visualCondition;
    tyre.lastInspectionDate = new Date();
    tyre.nextInspectionDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (recommendation === 'Send for Repair') {
      tyre.status = 'Under Repair';
    } else if (recommendation === 'Send for Retread') {
      tyre.status = 'Retread';
    } else if (recommendation === 'Scrap Tyre') {
      tyre.status = 'Scrapped';
      tyre.assignedEquipment = null;
      tyre.currentPosition = 'unassigned';
    }

    await tyre.save();

    await TyreHistory.create({
      tyre: tyre._id,
      equipment: tyre.assignedEquipment,
      eventType: 'Inspection',
      treadDepth: Number(treadDepth),
      pressure: Number(pressure),
      reason: `Inspection: ${visualCondition} (${damageType}). Rec: ${recommendation}`,
      performedBy: req.user ? req.user.name : 'System'
    });

    if (Number(treadDepth) < 15 || visualCondition === 'Critical' || damageType !== 'None') {
      await Alert.create({
        alertType: Number(treadDepth) < 15 ? 'Tyre Replacement Due' : 'Critical Tyre Condition',
        title: `Tyre Alert: ${tyre.tyreId}`,
        message: `Tyre ${tyre.tyreId} inspected with tread ${treadDepth}mm and damage "${damageType}". Action: ${recommendation}`,
        severity: 'Critical',
        relatedEntity: {
          entityType: 'Tyre',
          entityId: tyre._id,
          identifier: tyre.tyreId
        }
      });
    }

    await logAudit({
      req,
      action: 'INSPECT_TYRE',
      module: 'Tyres',
      recordId: tyre._id,
      description: `Logged inspection for tyre ${tyre.tyreId}. Tread: ${treadDepth}mm, Pressure: ${pressure} PSI`
    });

    res.status(201).json({
      success: true,
      message: 'Tyre inspection recorded successfully',
      inspection,
      tyre
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTyres,
  getTyreById,
  createTyre,
  installTyre,
  removeTyre,
  rotateTyres,
  recordInspection
};
