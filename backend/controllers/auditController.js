const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const { module: moduleName, action, user, page = 1, limit = 20 } = req.query;
    const query = {};

    if (moduleName) query.module = moduleName;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (user) query.userName = { $regex: user, $options: 'i' };

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      logs
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
