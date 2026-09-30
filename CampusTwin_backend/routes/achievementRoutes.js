const express = require('express');
const router = express.Router();
const {
  getMyAchievements,
  getAllAchievements,
  createAchievement
} = require('../controllers/achievementController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.get('/my', protect, getMyAchievements);
router.get('/all', protect, getAllAchievements);
router.post('/', protect, authorizeRoles('admin'), createAchievement);

module.exports = router;
