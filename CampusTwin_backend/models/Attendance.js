const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true
    },
    course: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
    session: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'present',
      required: true
    },
    markedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index to avoid duplicate attendance entry for same student in the same session
attendanceSchema.index({ student: 1, session: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
