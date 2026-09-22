const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/work-orders', getWorkOrders);
router.get('/work-orders/:id', getWorkOrderById);

router.post(
  '/work-orders',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer'),
  createWorkOrder
);

router.put(
  '/work-orders/:id',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer'),
  updateWorkOrder
);

router.patch(
  '/work-orders/:id/checklist',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician'),
  updateChecklist
);

router.post(
  '/work-orders/:id/parts',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician', 'Store Manager'),
  issueParts
);

router.patch(
  '/work-orders/:id/complete',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer'),
  completeWorkOrder
);

router.get('/schedules', getSchedules);
router.post(
  '/schedules',
  authorize('Super Admin', 'Maintenance Manager'),
  createSchedule
);

router.get('/downtimes', getDowntimes);

module.exports = router;
