const Alert = require('../models/Alert');

const getAlerts = async (req, res, next) => {
  try {
    const { severity, isRead, alertType, page = 1, limit = 15 } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (alertType) query.alertType = alertType;

    const total = await Alert.countDocuments(query);
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Alert.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      unreadCount,
      page: Number(page),
      pages: Math.ceil(total / limit),
      alerts
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.isRead = true;
    alert.readAt = new Date();
    alert.readBy = req.user ? req.user.name : 'User';
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert marked as read',
      alert
    });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Alert.updateMany(
      { isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
          readBy: req.user ? req.user.name : 'User'
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAlerts, markAsRead, markAllAsRead };
