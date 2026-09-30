const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  getChatContacts
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/messages', protect, sendMessage);
router.get('/users', protect, getChatContacts);

module.exports = router;
