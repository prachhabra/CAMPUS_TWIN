const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const initSocket = (io) => {
  const onlineUsers = new Map(); // userId -> Set of socketIds

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication token required for Socket connection'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Socket authentication error: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();

    // Register user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room
    socket.join(userId);

    // Broadcast online status
    io.emit('user_online', { userId, status: 'online' });

    // Send active users list
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // Join specific conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Handle sending message in real time
    socket.on('send_message', async (data, callback) => {
      try {
        const { recipientId, text, conversationId } = data;
        if (!recipientId || !text || !text.trim()) {
          if (callback) callback({ success: false, message: 'Invalid payload' });
          return;
        }

        let conv;
        if (conversationId) {
          conv = await Conversation.findById(conversationId);
        }
        if (!conv) {
          conv = await Conversation.findOne({
            participants: { $all: [socket.user._id, recipientId] }
          });
        }
        if (!conv) {
          conv = await Conversation.create({
            participants: [socket.user._id, recipientId]
          });
        }

        const msg = await Message.create({
          conversationId: conv._id,
          sender: socket.user._id,
          recipient: recipientId,
          text: text.trim(),
          read: false
        });

        conv.lastMessage = msg._id;
        await conv.save();

        const populatedMsg = await Message.findById(msg._id).populate(
          'sender',
          'name role profileImage'
        );

        // Emit to recipient's personal room
        io.to(recipientId).emit('receive_message', {
          message: populatedMsg,
          conversationId: conv._id
        });

        // Also emit to sender
        socket.emit('message_sent', {
          message: populatedMsg,
          conversationId: conv._id
        });

        if (callback) callback({ success: true, message: populatedMsg, conversationId: conv._id });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('user_typing', {
        userId,
        conversationId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', ({ conversationId, recipientId }) => {
      io.to(recipientId).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_offline', { userId, status: 'offline' });
        }
      }
    });
  });
};

module.exports = initSocket;
