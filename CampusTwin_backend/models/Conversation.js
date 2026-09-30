const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to help query conversations for participants
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
