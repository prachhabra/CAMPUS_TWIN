const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new student or teacher
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      role,
      department,
      rollNumber,
      employeeId,
      year,
      phone
    } = req.body;

    if (!name || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Disallow public registration as admin
    if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrator registration is restricted. Please contact system admin.'
      });
    }

    if (!['student', 'teacher'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only student and teacher registrations are allowed.'
      });
    }

    if (role === 'student' && !rollNumber) {
      return res.status(400).json({
        success: false,
        message: 'Roll number is required for student registration'
      });
    }

    if (role === 'teacher' && !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required for teacher registration'
      });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      department: department || 'General',
      rollNumber: role === 'student' ? (rollNumber || '').trim() : '',
      employeeId: role === 'teacher' ? (employeeId || '').trim() : '',
      year: role === 'student' ? (year || '1st Year') : '',
      phone: phone || '',
      points: 50, // Welcome bonus points for registration!
      badges: [
        {
          badgeId: 'welcome-badge',
          name: 'Campus Citizen',
          icon: 'Sparkles',
          awardedAt: new Date()
        }
      ]
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        year: user.year,
        profileImage: user.profileImage,
        phone: user.phone,
        bio: user.bio,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        rollNumber: user.rollNumber,
        employeeId: user.employeeId,
        year: user.year,
        profileImage: user.profileImage,
        phone: user.phone,
        bio: user.bio,
        points: user.points,
        badges: user.badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile (refreshUser / me)
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (clears client session)
// @route   POST /api/auth/logout
// @access  Public/Private
const logoutUser = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
