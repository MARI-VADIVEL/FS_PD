const express = require('express');
const router = express.Router();
const {
  getEquipments,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  assignEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getEquipments);
router.get('/:id', getEquipmentById);

router.post(
  '/',
  authorize('Super Admin', 'Maintenance Manager', 'Fleet Manager'),
  createEquipment
);

router.put(
  '/:id',
  authorize('Super Admin', 'Maintenance Manager', 'Fleet Manager', 'Maintenance Engineer'),
  updateEquipment
);

router.patch(
  '/:id/status',
  authorize('Super Admin', 'Maintenance Manager', 'Fleet Manager', 'Maintenance Engineer', 'Technician'),
  updateEquipmentStatus
);

router.patch(
  '/:id/assign',
  authorize('Super Admin', 'Maintenance Manager', 'Fleet Manager'),
  assignEquipment
);

router.delete(
  '/:id',
  authorize('Super Admin', 'Fleet Manager'),
  deleteEquipment
);

module.exports = router;
