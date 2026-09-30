const express = require('express');
const router = express.Router();
const {
  createClass,
  getTeacherClasses,
  getEnrolledClasses,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudent,
  removeStudent
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/my-classes', protect, authorizeRoles('teacher'), getTeacherClasses);
router.get('/enrolled', protect, authorizeRoles('student'), getEnrolledClasses);

router
  .route('/')
  .get(protect, getAllClasses)
  .post(protect, authorizeRoles('teacher', 'admin'), createClass);

router
  .route('/:id')
  .get(protect, getClassById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateClass)
  .delete(protect, authorizeRoles('teacher', 'admin'), deleteClass);

router.post('/:id/enroll', protect, enrollStudent);
router.delete('/:id/students/:studentId', protect, authorizeRoles('teacher', 'admin'), removeStudent);

module.exports = router;
