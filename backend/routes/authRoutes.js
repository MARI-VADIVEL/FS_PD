const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

router.get('/users', authorize('Super Admin'), getUsers);
router.post('/users', authorize('Super Admin'), createUser);
router.put('/users/:id', authorize('Super Admin'), updateUser);
router.delete('/users/:id', authorize('Super Admin'), deleteUser);

module.exports = router;
