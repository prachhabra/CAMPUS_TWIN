const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true
    },
    applicationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Interested', 'Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
      required: true
    },
    package: {
      type: String,
      default: '',
      trim: true
    },
    interviewRound: {
      type: String,
      default: 'Application Submitted',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Placement', placementSchema);
