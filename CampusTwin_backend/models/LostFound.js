const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['lost', 'found'],
      required: [true, 'Type is required (lost or found)']
    },
    category: {
      type: String,
      enum: ['Electronics', 'ID Cards/Documents', 'Keys', 'Wallets/Bags', 'Clothing', 'Books', 'Other'],
      default: 'Other',
      required: true
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LostFound', lostFoundSchema);
