const express = require('express');
const router = express.Router();
const {
  getStudentAnalytics,
  getTeacherAnalytics,
  getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/student', protect, authorizeRoles('student'), getStudentAnalytics);
router.get('/teacher', protect, authorizeRoles('teacher', 'admin'), getTeacherAnalytics);
router.get('/admin', protect, authorizeRoles('admin'), getAdminAnalytics);

module.exports = router;
