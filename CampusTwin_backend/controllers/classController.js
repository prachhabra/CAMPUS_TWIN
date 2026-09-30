const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Teacher, Admin)
const createClass = async (req, res, next) => {
  try {
    const { name, code, subject, department, year, semester, schedule } = req.body;

    if (!name || !code || !subject || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide class name, code, subject, and department'
      });
    }

    const existingClass = await Class.findOne({ code: code.trim().toUpperCase() });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'A class with this code already exists'
      });
    }

    const newClass = await Class.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      subject: subject.trim(),
      department: department.trim(),
      year: year || '1st Year',
      semester: semester || 'Semester 1',
      schedule: schedule || '',
      teacher: req.user._id,
      students: []
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get classes taught by the logged-in teacher
// @route   GET /api/classes/my-classes
// @access  Private (Teacher)
const getTeacherClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email rollNumber department year')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get classes enrolled by the logged-in student
// @route   GET /api/classes/enrolled
// @access  Private (Student)
const getEnrolledClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ students: req.user._id })
      .populate('teacher', 'name email department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classes (Admin or general listing)
// @route   GET /api/classes
// @access  Private
const getAllClasses = async (req, res, next) => {
  try {
    const { department, q } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } }
      ];
    }

    const classes = await Class.find(query)
      .populate('teacher', 'name email department')
      .populate('students', 'name rollNumber email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('teacher', 'name email department')
      .populate('students', 'name rollNumber email department year');

    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.status(200).json({ success: true, data: classObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class details
// @route   PUT /api/classes/:id
// @access  Private (Teacher who created it, Admin)
const updateClass = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classObj.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this class' });
    }

    const { name, subject, department, year, semester, schedule } = req.body;
    if (name) classObj.name = name.trim();
    if (subject) classObj.subject = subject.trim();
    if (department) classObj.department = department.trim();
    if (year) classObj.year = year;
    if (semester) classObj.semester = semester;
    if (schedule !== undefined) classObj.schedule = schedule;

    const updated = await classObj.save();
    res.status(200).json({ success: true, message: 'Class updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher who created it, Admin)
const deleteClass = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classObj.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this class' });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll student in class
// @route   POST /api/classes/:id/enroll
// @access  Private (Teacher, Admin, or Student self-enroll with code)
const enrollStudent = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const studentId = req.body.studentId || (req.user.role === 'student' ? req.user._id : null);
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Valid student user required' });
    }

    if (classObj.students.some((s) => s.toString() === studentId.toString())) {
      return res.status(400).json({ success: false, message: 'Student is already enrolled in this class' });
    }

    classObj.students.push(studentId);
    await classObj.save();

    res.status(200).json({
      success: true,
      message: `Student ${student.name} enrolled successfully`,
      data: classObj
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove student from class
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Teacher, Admin)
const removeStudent = async (req, res, next) => {
  try {
    const classObj = await Class.findById(req.params.id);
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classObj.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage students in this class' });
    }

    classObj.students = classObj.students.filter(
      (s) => s.toString() !== req.params.studentId.toString()
    );
    await classObj.save();

    res.status(200).json({
      success: true,
      message: 'Student removed from class',
      data: classObj
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  getEnrolledClasses,
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
  enrollStudent,
  removeStudent
};
