const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Class code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    year: {
      type: String,
      default: '1st Year'
    },
    semester: {
      type: String,
      default: 'Semester 1'
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    schedule: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
