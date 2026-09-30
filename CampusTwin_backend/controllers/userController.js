const User = require('../models/User');

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      phone,
      bio,
      year,
      department,
      rollNumber,
      employeeId,
      profileImage
    } = req.body;

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (department) user.department = department;
    if (profileImage !== undefined) user.profileImage = profileImage;

    if (user.role === 'student') {
      if (year) user.year = year;
      if (rollNumber) user.rollNumber = rollNumber;
    }

    if (user.role === 'teacher') {
      if (employeeId) user.employeeId = employeeId;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Public verification of Digital ID QR code
// @route   GET /api/users/verify/:id
// @access  Public
const verifyDigitalId = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name role department rollNumber employeeId year profileImage points badges createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid digital ID or student/faculty credential not found'
      });
    }

    res.status(200).json({
      success: true,
      verified: true,
      verificationTimestamp: new Date(),
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers
// @route   GET /api/users/teachers
// @access  Private
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name email department employeeId phone profileImage');
    res.status(200).json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const { department, q } = req.query;
    let query = { role: 'student' };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const students = await User.find(query).select('name email department rollNumber year phone profileImage points badges createdAt');
    res.status(200).json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all users with search, role filter and pagination
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { q, role, department, page = 1, limit = 10 } = req.query;
    let query = {};

    if (role && role !== 'All') {
      query.role = role;
    }
    if (department && department !== 'All') {
      query.department = department;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { rollNumber: { $regex: q, $options: 'i' } },
        { employeeId: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: users,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update user role / department
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = async (req, res, next) => {
  try {
    const { role, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (department) user.department = department;

    await user.save();
    res.status(200).json({ success: true, message: 'User role updated successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting oneself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active administrator account'
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  verifyDigitalId,
  getTeachers,
  getStudents,
  getAllUsers,
  updateUserRole,
  deleteUser
};
