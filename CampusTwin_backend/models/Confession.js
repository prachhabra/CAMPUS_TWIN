const mongoose = require('mongoose');

const confessionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Confession content is required'],
      trim: true,
      maxlength: 1000
    },
    category: {
      type: String,
      enum: ['General', 'Campus Life', 'Crush', 'Academics', 'Hostel', 'Advice'],
      default: 'General',
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    anonymous: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Confession', confessionSchema);
