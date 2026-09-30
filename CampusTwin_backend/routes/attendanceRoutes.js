const express = require('express');
const router = express.Router();
const {
  createAttendanceSession,
  checkInAttendance,
  markAttendanceManual,
  getMyAttendance,
  getTeacherAttendanceHistory,
  getAllAttendanceAdmin
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Student attendance
router.get('/my-attendance', protect, authorizeRoles('student'), getMyAttendance);
router.post('/check-in', protect, authorizeRoles('student'), checkInAttendance);

// Teacher attendance
router.post('/session', protect, authorizeRoles('teacher', 'admin'), createAttendanceSession);
router.post('/mark', protect, authorizeRoles('teacher', 'admin'), markAttendanceManual);
router.get('/teacher-history', protect, authorizeRoles('teacher', 'admin'), getTeacherAttendanceHistory);

// Admin attendance
router.get('/all', protect, authorizeRoles('admin'), getAllAttendanceAdmin);

module.exports = router;
