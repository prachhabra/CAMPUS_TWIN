const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student',
      required: true
    },
    department: {
      type: String,
      default: 'General'
    },
    rollNumber: {
      type: String,
      trim: true,
      default: ''
    },
    employeeId: {
      type: String,
      trim: true,
      default: ''
    },
    year: {
      type: String,
      default: '1st Year'
    },
    profileImage: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      default: 0
    },
    badges: [
      {
        badgeId: { type: String },
        name: { type: String },
        icon: { type: String },
        awardedAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
