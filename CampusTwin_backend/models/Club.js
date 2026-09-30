const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Social', 'Academic', 'Other'],
      default: 'Technical',
      required: true
    },
    president: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    facultyCoordinator: {
      type: String,
      default: '',
      trim: true
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        joinedAt: {
          type: Date,
          default: Date.now
        },
        role: {
          type: String,
          default: 'Member'
        }
      }
    ],
    logo: {
      type: String,
      default: ''
    },
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      github: { type: String, default: '' }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Club', clubSchema);
