const express = require('express');
const router = express.Router();
const {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub
} = require('../controllers/clubController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(getClubs)
  .post(protect, authorizeRoles('teacher', 'admin'), createClub);

router
  .route('/:id')
  .get(getClubById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateClub)
  .delete(protect, authorizeRoles('admin'), deleteClub);

router.post('/:id/join', protect, authorizeRoles('student'), joinClub);
router.post('/:id/leave', protect, authorizeRoles('student'), leaveClub);

module.exports = router;
