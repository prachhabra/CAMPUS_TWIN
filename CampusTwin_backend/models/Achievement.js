const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Achievement description is required'],
      trim: true
    },
    icon: {
      type: String,
      default: 'Award'
    },
    category: {
      type: String,
      enum: ['Attendance', 'Events', 'Community', 'Skills', 'Academics', 'Special'],
      default: 'Special',
      required: true
    },
    points: {
      type: Number,
      default: 50,
      min: 0
    },
    criteriaCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
