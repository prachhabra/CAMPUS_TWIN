const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    meetingTime: {
      type: String,
      required: [true, 'Meeting schedule is required'],
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Meeting location or online link is required'],
      trim: true
    },
    maxMembers: {
      type: Number,
      default: 10,
      min: 2
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
