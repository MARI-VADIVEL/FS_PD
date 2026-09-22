const SystemSetting = require('../models/SystemSetting');
const { logAudit } = require('../middleware/auditMiddleware');

const getSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = await SystemSetting.create({
        key: 'global_config',
        locations: [
          { name: 'North Pit Zone A', type: 'Pit' },
          { name: 'South Pit Zone B', type: 'Pit' },
          { name: 'Central Heavy Workshop', type: 'Workshop' },
          { name: 'Tyre Fitment Bay 1', type: 'Workshop' },
          { name: 'Main Stockyard', type: 'Stockyard' }
        ],
        departments: [
          { name: 'Mining Operations' },
          { name: 'Fleet Maintenance' },
          { name: 'Tyre Shop & Service' },
          { name: 'Warehouse & Spares' },
          { name: 'Safety & Compliance' }
        ]
      });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global_config' });
    if (!settings) {
      settings = new SystemSetting({ key: 'global_config' });
    }

    const updatable = [
      'maintenanceLeadHours',
      'maintenanceLeadDays',
      'tyreTreadCriticalMm',
      'tyrePressureMinPsi',
      'tyrePressureMaxPsi',
      'lowStockThresholdDefault',
      'currency',
      'locations',
      'departments'
    ];

    updatable.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    await logAudit({
      req,
      action: 'UPDATE_SETTINGS',
      module: 'Settings',
      recordId: settings._id,
      description: 'Updated system-wide operational thresholds'
    });

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      settings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
