const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    skill: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Programming', 'Design', 'Languages', 'Music/Arts', 'Academics', 'Marketing', 'Other'],
      default: 'Programming',
      required: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
      required: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    availability: {
      type: String,
      enum: ['Weekdays', 'Weekends', 'Flexible'],
      default: 'Flexible'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Skill', skillSchema);
