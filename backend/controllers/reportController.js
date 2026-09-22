const Equipment = require('../models/Equipment');
const WorkOrder = require('../models/WorkOrder');
const Tyre = require('../models/Tyre');
const SparePart = require('../models/SparePart');
const Downtime = require('../models/Downtime');

const getReports = async (req, res, next) => {
  try {
    const { reportType = 'equipment', startDate, endDate, format } = req.query;

    let data = [];
    let title = '';

    if (reportType === 'equipment') {
      title = 'Mining Fleet Equipment Operational Report';
      const query = { isDeleted: false };
      data = await Equipment.find(query)
        .select('equipmentId assetNumber equipmentType model operatingHours location status nextServiceDate')
        .sort({ equipmentId: 1 });
    } else if (reportType === 'maintenance') {
      title = 'Maintenance Work Orders & Cost Report';
      const query = { isDeleted: false };
      if (startDate && endDate) {
        query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      data = await WorkOrder.find(query)
        .populate('equipment', 'equipmentId assetNumber model')
        .populate('assignedTechnician', 'name')
        .sort({ createdAt: -1 });
    } else if (reportType === 'tyres') {
      title = 'Heavy OTR Tyre Lifecycle & Wear Report';
      data = await Tyre.find({ isDeleted: false })
        .populate('assignedEquipment', 'equipmentId assetNumber')
        .sort({ tyreId: 1 });
    } else if (reportType === 'inventory') {
      title = 'Spare Parts Valuation & Inventory Report';
      data = await SparePart.find({ isDeleted: false }).sort({ category: 1, partNumber: 1 });
    } else if (reportType === 'downtime') {
      title = 'Equipment Downtime Breakdown Report';
      const query = {};
      if (startDate && endDate) {
        query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
      }
      data = await Downtime.find(query)
        .populate('equipment', 'equipmentId assetNumber model')
        .sort({ startTime: -1 });
    }

    if (format === 'csv') {
      let csv = '';
      if (reportType === 'equipment') {
        csv = 'Equipment ID,Asset Number,Type,Model,Operating Hours,Location,Status,Next Service Date\n';
        data.forEach((e) => {
          csv += `"${e.equipmentId}","${e.assetNumber}","${e.equipmentType}","${e.model}",${e.operatingHours},"${e.location}","${e.status}","${e.nextServiceDate ? e.nextServiceDate.toISOString().split('T')[0] : 'N/A'}"\n`;
        });
      } else if (reportType === 'maintenance') {
        csv = 'Work Order,Equipment,Type,Priority,Scheduled Date,Status,Actual Hours,Labor Cost,Parts Cost,Total Cost\n';
        data.forEach((w) => {
          const eqId = w.equipment ? w.equipment.equipmentId : 'N/A';
          csv += `"${w.workOrderNumber}","${eqId}","${w.maintenanceType}","${w.priority}","${w.scheduledDate ? w.scheduledDate.toISOString().split('T')[0] : ''}","${w.status}",${w.actualDuration || 0},${w.actualLaborCost || 0},${w.actualPartsCost || 0},${w.actualCost || 0}\n`;
        });
      } else if (reportType === 'tyres') {
        csv = 'Tyre ID,Serial Number,Brand,Size,Status,Condition,Tread Depth (mm),Operating Hours,Cost Per Hour (₹)\n';
        data.forEach((t) => {
          csv += `"${t.tyreId}","${t.serialNumber}","${t.brand}","${t.tyreSize}","${t.status}","${t.condition}",${t.currentTreadDepth},${t.currentOperatingHours},${t.costPerHour || 0}\n`;
        });
      } else if (reportType === 'inventory') {
        csv = 'Part Number,Name,Category,Manufacturer,Quantity,Min Stock,Unit Cost (₹),Total Value (₹),Status\n';
        data.forEach((p) => {
          const totalVal = (p.quantity || 0) * (p.unitCost || 0);
          csv += `"${p.partNumber}","${p.name}","${p.category}","${p.manufacturer}",${p.quantity},${p.minStockLevel},${p.unitCost},${totalVal},"${p.status}"\n`;
        });
      } else if (reportType === 'downtime') {
        csv = 'Equipment,Category,Reason,Start Time,End Time,Duration (Hours),Impact Level\n';
        data.forEach((d) => {
          const eqId = d.equipment ? d.equipment.equipmentId : 'N/A';
          csv += `"${eqId}","${d.category}","${d.reason}","${d.startTime ? d.startTime.toISOString() : ''}","${d.endTime ? d.endTime.toISOString() : ''}",${d.durationHours || 0},"${d.impactLevel}"\n`;
        });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report.csv"`);
      return res.status(200).send(csv);
    }

    res.status(200).json({
      success: true,
      title,
      reportType,
      generatedAt: new Date(),
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getReports };
