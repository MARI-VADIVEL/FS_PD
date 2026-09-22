const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, action, module, recordId = '', description, details = {} }) => {
  try {
    await AuditLog.create({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Anonymous',
      userRole: req.user ? req.user.role : 'System',
      action,
      module,
      recordId: String(recordId),
      description,
      details,
      ipAddress: req.ip || req.connection.remoteAddress || ''
    });
  } catch (err) {
    return null;
  }
};

module.exports = { logAudit };
