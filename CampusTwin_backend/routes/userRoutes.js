const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  verifyDigitalId,
  getTeachers,
  getStudents,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public verification for Digital ID QR code
router.get('/verify/:id', verifyDigitalId);

// User profile
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Directory lookups
router.get('/teachers', protect, getTeachers);
router.get('/students', protect, getStudents);

// Admin user administration
router.get('/', protect, authorizeRoles('admin'), getAllUsers);
router.put('/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.delete('/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
