const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addCommentToComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(protect, getComplaints)
  .post(protect, authorizeRoles('student'), createComplaint);

router.route('/:id').get(protect, getComplaintById);

router.put('/:id/status', protect, authorizeRoles('admin'), updateComplaintStatus);
router.post('/:id/comment', protect, addCommentToComplaint);

module.exports = router;
