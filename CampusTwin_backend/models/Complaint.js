const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      enum: ['Hostel', 'Mess/Food', 'Academic', 'Infrastructure', 'IT/WiFi', 'Library', 'Cleanliness', 'Other'],
      default: 'Infrastructure',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true
    },
    hostel: {
      type: String,
      default: '',
      trim: true
    },
    room: {
      type: String,
      default: '',
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'rejected'],
      default: 'pending'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolutionNote: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        text: {
          type: String,
          required: true,
          trim: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
