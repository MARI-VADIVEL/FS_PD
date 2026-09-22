const express = require('express');
const router = express.Router();
const {
  getTyres,
  getTyreById,
  createTyre,
  installTyre,
  removeTyre,
  rotateTyres,
  recordInspection
} = require('../controllers/tyreController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/', getTyres);
router.get('/:id', getTyreById);

router.post(
  '/',
  authorize('Super Admin', 'Maintenance Manager', 'Fleet Manager', 'Store Manager'),
  createTyre
);

router.post(
  '/install',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician'),
  installTyre
);

router.post(
  '/remove',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician'),
  removeTyre
);

router.post(
  '/rotate',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician'),
  rotateTyres
);

router.post(
  '/inspect',
  authorize('Super Admin', 'Maintenance Manager', 'Maintenance Engineer', 'Technician', 'Safety Officer'),
  recordInspection
);

module.exports = router;
