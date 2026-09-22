const express = require('express');
const router = express.Router();
const {
  getSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  stockIn,
  stockOut,
  getSuppliers,
  createSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router.get('/parts', getSpareParts);
router.get('/parts/:id', getSparePartById);

router.post(
  '/parts',
  authorize('Super Admin', 'Maintenance Manager', 'Store Manager'),
  createSparePart
);

router.put(
  '/parts/:id',
  authorize('Super Admin', 'Maintenance Manager', 'Store Manager'),
  updateSparePart
);

router.post(
  '/parts/:id/stock-in',
  authorize('Super Admin', 'Maintenance Manager', 'Store Manager'),
  stockIn
);

router.post(
  '/parts/:id/stock-out',
  authorize('Super Admin', 'Maintenance Manager', 'Store Manager', 'Maintenance Engineer'),
  stockOut
);

router.get('/suppliers', getSuppliers);
router.post(
  '/suppliers',
  authorize('Super Admin', 'Store Manager'),
  createSupplier
);

router.get('/purchase-orders', getPurchaseOrders);
router.post(
  '/purchase-orders',
  authorize('Super Admin', 'Store Manager'),
  createPurchaseOrder
);

router.patch(
  '/purchase-orders/:id/receive',
  authorize('Super Admin', 'Store Manager'),
  receivePurchaseOrder
);

module.exports = router;
