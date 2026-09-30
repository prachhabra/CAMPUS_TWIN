const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateStatus,
  deleteItem
} = require('../controllers/lostFoundController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getItems).post(protect, createItem);

router.route('/:id').get(getItemById).delete(protect, deleteItem);

router.put('/:id/status', protect, updateStatus);

module.exports = router;
