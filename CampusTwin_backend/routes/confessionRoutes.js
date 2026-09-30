const express = require('express');
const router = express.Router();
const {
  getApprovedConfessions,
  getAdminConfessions,
  createConfession,
  toggleLikeConfession,
  updateConfessionStatus,
  deleteConfession
} = require('../controllers/confessionController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Student / Public feeds
router.route('/').get(protect, getApprovedConfessions).post(protect, createConfession);

router.post('/:id/like', protect, toggleLikeConfession);

// Admin moderation
router.get('/admin', protect, authorizeRoles('admin'), getAdminConfessions);
router.put('/:id/status', protect, authorizeRoles('admin'), updateConfessionStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteConfession);

module.exports = router;
