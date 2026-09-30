const express = require('express');
const router = express.Router();
const {
  getGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup
} = require('../controllers/studyGroupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getGroups).post(protect, createGroup);

router.route('/:id').get(getGroupById).delete(protect, deleteGroup);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);

module.exports = router;
