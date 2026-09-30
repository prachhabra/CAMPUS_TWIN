const express = require('express');
const router = express.Router();
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  connectWithSkillPeer
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getSkills).post(protect, createSkill);

router
  .route('/:id')
  .put(protect, updateSkill)
  .delete(protect, deleteSkill);

router.post('/:id/connect', protect, connectWithSkillPeer);

module.exports = router;
