const express = require('express');
const router = express.Router();
const { getAlerts, markAsRead, markAllAsRead } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getAlerts);
router.patch('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);

module.exports = router;
