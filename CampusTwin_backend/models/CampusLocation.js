const mongoose = require('mongoose');

const campusLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Academic', 'Hostel', 'Food', 'Sports', 'Administration', 'Library', 'Medical', 'Other'],
      default: 'Academic',
      required: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    image: {
      type: String,
      default: ''
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

module.exports = mongoose.model('CampusLocation', campusLocationSchema);
