const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true
    },
    organizer: {
      type: String,
      default: 'College Event Council',
      trim: true
    },
    club: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Club',
      default: null
    },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'],
      default: 'Technical',
      required: true
    },
    image: {
      type: String,
      default: ''
    },
    registrationLimit: {
      type: Number,
      default: 100
    },
    registeredStudents: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        registeredAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
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

module.exports = mongoose.model('Event', eventSchema);
