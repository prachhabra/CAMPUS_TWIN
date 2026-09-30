const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for logged in user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email role department profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized for this chat' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name role profileImage')
      .sort({ createdAt: 1 });

    // Mark messages sent to this user as read
    await Message.updateMany(
      { conversationId, recipient: req.user._id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (REST endpoint fallback or direct)
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { recipientId, text } = req.body;

    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID and message text are required'
      });
    }

    // Find or create conversation between the two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId]
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user._id,
      recipient: recipientId,
      text: text.trim(),
      read: false
    });

    conversation.lastMessage = message._id;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name role profileImage'
    );

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: conversation._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get contacts list for starting a chat
// @route   GET /api/chat/users
// @access  Private
const getChatContacts = async (req, res, next) => {
  try {
    const { q, role } = req.query;
    let query = { _id: { $ne: req.user._id } };

    if (role && role !== 'All') {
      query.role = role;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const contacts = await User.find(query)
      .select('name email role department rollNumber employeeId profileImage')
      .sort({ name: 1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getChatContacts
};
