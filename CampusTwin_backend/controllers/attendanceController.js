const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');
const Class = require('../models/Class');
const User = require('../models/User');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// Helper to extract clean session code from raw text, URLs, or JSON
const extractSessionCode = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  let str = raw.trim();

  // Try extracting ?code= or &code= from scanned URL
  const urlMatch = str.match(/[?&]code=([A-Za-z0-9]+)/i);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1].toUpperCase();
  }

  // Try JSON parsing if QR data was JSON
  try {
    const parsed = JSON.parse(str);
    if (parsed && parsed.code) {
      return String(parsed.code).trim().toUpperCase();
    }
  } catch {
    // not json
  }

  // Clean alphanumeric characters
  const alphanumeric = str.replace(/[^A-Za-z0-9]/g, '');
  return alphanumeric.toUpperCase();
};

// @desc    Teacher: Create new active attendance session (with code & QR data)
// @route   POST /api/attendance/session
// @access  Private (Teacher, Admin)
const createAttendanceSession = async (req, res, next) => {
  try {
    const { classId, subject, minutesValid = 15 } = req.body;

    if (!classId || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId and subject'
      });
    }

    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Verify teacher owns this class or is admin
    if (classObj.teacher.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to launch attendance sessions for your own classes'
      });
    }

    // Deactivate any previously active sessions for this class & teacher
    await AttendanceSession.updateMany(
      { class: classId, teacher: req.user._id, isActive: true },
      { isActive: false }
    );

    // Generate guaranteed unique 6-character uppercase alphanumeric session code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excludes ambiguous 0, O, 1, I
    let code = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await AttendanceSession.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      code = `AT${Date.now().toString(36).slice(-4).toUpperCase()}`;
    }

    const validityDuration = Math.max(1, parseInt(minutesValid, 10) || 15);
    const expiresAt = new Date(Date.now() + validityDuration * 60 * 1000);

    const session = await AttendanceSession.create({
      code,
      teacher: req.user._id,
      class: classId,
      subject: subject.trim(),
      expiresAt,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Attendance session started successfully',
      session: {
        _id: session._id,
        code: session.code,
        subject: session.subject,
        class: classObj.name,
        classId: classObj._id,
        expiresAt: session.expiresAt,
        isActive: session.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher: Get current active attendance session
// @route   GET /api/attendance/active-session
// @access  Private (Teacher, Admin)
const getActiveSession = async (req, res, next) => {
  try {
    const session = await AttendanceSession.findOne({
      teacher: req.user._id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('class');

    if (!session) {
      return res.status(200).json({
        success: true,
        activeSession: null
      });
    }

    res.status(200).json({
      success: true,
      activeSession: {
        _id: session._id,
        code: session.code,
        subject: session.subject,
        class: session.class?.name || 'Class',
        classId: session.class?._id,
        expiresAt: session.expiresAt,
        isActive: session.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher: End active session early
// @route   POST /api/attendance/session/end
// @access  Private (Teacher, Admin)
const endAttendanceSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    let query = { teacher: req.user._id, isActive: true };
    if (sessionId) {
      query._id = sessionId;
    }

    await AttendanceSession.updateMany(query, { isActive: false });

    res.status(200).json({
      success: true,
      message: 'Attendance session ended successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Check-in attendance using session code
// @route   POST /api/attendance/check-in
// @access  Private (Student)
const checkInAttendance = async (req, res, next) => {
  try {
    const rawCode = req.body.code;

    if (!rawCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide session code'
      });
    }

    const code = extractSessionCode(rawCode);
    if (!code || code.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session code format'
      });
    }

    // Step 1: Find session by code in MongoDB without isActive filter first
    // to give precise, actionable errors (e.g. expired vs inactive vs not found)
    const session = await AttendanceSession.findOne({ code }).populate('class');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid session code. No active attendance session found with this code.'
      });
    }

    // Step 2: Validate expiration
    const now = new Date();
    if (now > new Date(session.expiresAt)) {
      if (session.isActive) {
        session.isActive = false;
        await session.save();
      }
      return res.status(400).json({
        success: false,
        message: 'This attendance session code has expired'
      });
    }

    // Step 3: Validate active status
    if (!session.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This attendance session has ended and is no longer active'
      });
    }

    // Step 4: Validate class exists
    if (!session.class) {
      return res.status(404).json({
        success: false,
        message: 'Associated class for this attendance session could not be found'
      });
    }

    // Step 5: Validate that the student belongs to the class
    const studentIdStr = req.user._id.toString();
    const classStudents = session.class.students || [];
    const isEnrolled = classStudents.some((s) => (s._id || s).toString() === studentIdStr);

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: `You are not enrolled in ${session.class.name || 'this class'}. Only enrolled students can mark attendance.`
      });
    }

    // Step 6: Prevent duplicate attendance
    const existing = await Attendance.findOne({
      student: req.user._id,
      session: session.code
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this session has already been recorded'
      });
    }

    // Step 7: Create Attendance record with exact required fields:
    // student, teacher, class, subject, date, session, status, markedAt
    const attendance = await Attendance.create({
      student: req.user._id,
      teacher: session.teacher,
      class: session.class._id,
      subject: session.subject,
      date: new Date(),
      session: session.code,
      status: 'present',
      markedAt: new Date()
    });

    // Step 8: Gamification award points/badges
    const totalPresent = await Attendance.countDocuments({
      student: req.user._id,
      status: 'present'
    });

    let badge = null;
    if (totalPresent === 10) {
      badge = { badgeId: 'perfect-10', name: 'Consistent Attendee', icon: 'CheckCircle' };
    } else if (totalPresent === 50) {
      badge = { badgeId: 'attendance-master', name: 'Master Attendee', icon: 'ShieldCheck' };
    }

    await awardPointsAndBadge(req.user._id, 10, badge, `attending ${session.subject}`);

    // Step 9: Return clear success response
    return res.status(200).json({
      success: true,
      message: `Attendance marked successfully for ${session.subject}!`,
      attendance: {
        _id: attendance._id,
        student: attendance.student,
        teacher: attendance.teacher,
        class: attendance.class,
        subject: attendance.subject,
        date: attendance.date,
        session: attendance.session,
        status: attendance.status,
        markedAt: attendance.markedAt
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance for this session has already been recorded'
      });
    }
    next(error);
  }
};

// @desc    Teacher: Manually mark or edit student attendance
// @route   POST /api/attendance/mark
// @access  Private (Teacher, Admin)
const markAttendanceManual = async (req, res, next) => {
  try {
    const { studentId, course, classId, subject, date, status, sessionCode } = req.body;

    const trimmedStudentId = (studentId || '').trim();
    const courseValue = (course || classId || '').trim();
    const subjectTrimmed = (subject || '').trim();
    const attendanceStatus = status || 'present';

    if (!trimmedStudentId) {
      return res.status(400).json({
        success: false,
        message: 'Student MongoDB User ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(trimmedStudentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Student MongoDB User ID format. Must be a 24-character hexadecimal ObjectId.'
      });
    }

    if (!courseValue) {
      return res.status(400).json({
        success: false,
        message: 'Course is required'
      });
    }

    if (!subjectTrimmed) {
      return res.status(400).json({
        success: false,
        message: 'Subject is required'
      });
    }

    if (!['present', 'absent'].includes(attendanceStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "present" or "absent"'
      });
    }

    // Verify student exists in the database
    const student = await User.findById(trimmedStudentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student with the provided MongoDB User ID was not found'
      });
    }

    // Resolve or provision class for this course
    let targetClass = null;

    if (mongoose.Types.ObjectId.isValid(courseValue)) {
      targetClass = await Class.findById(courseValue);
    }

    if (!targetClass) {
      targetClass = await Class.findOne({
        $or: [
          { code: courseValue.toUpperCase() },
          { name: new RegExp(`^${courseValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        ]
      });
    }

    if (!targetClass) {
      const generatedCode = courseValue.toUpperCase().replace(/\s+/g, '-').slice(0, 10);
      let classCode = generatedCode;
      const existingCode = await Class.findOne({ code: classCode });
      if (existingCode) {
        classCode = `${generatedCode}-${Date.now().toString(36).slice(-3).toUpperCase()}`;
      }

      targetClass = await Class.create({
        name: courseValue,
        code: classCode,
        subject: subjectTrimmed,
        department: student.department || req.user.department || 'General',
        teacher: req.user._id,
        students: [student._id]
      });
    } else {
      const isEnrolled = targetClass.students && targetClass.students.some(
        (s) => s.toString() === student._id.toString()
      );
      if (!isEnrolled) {
        targetClass.students = targetClass.students || [];
        targetClass.students.push(student._id);
        await targetClass.save();
      }
    }

    const session = sessionCode || `MANUAL-${Date.now().toString(36).toUpperCase()}`;
    const targetDate = date ? new Date(date) : new Date();

    const attendance = await Attendance.findOneAndUpdate(
      {
        student: student._id,
        class: targetClass._id,
        date: {
          $gte: new Date(new Date(targetDate).setHours(0, 0, 0, 0)),
          $lte: new Date(new Date(targetDate).setHours(23, 59, 59, 999))
        }
      },
      {
        student: student._id,
        teacher: req.user._id,
        class: targetClass._id,
        course: courseValue,
        subject: subjectTrimmed,
        date: targetDate,
        session,
        status: attendanceStatus,
        markedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    ).populate([
      { path: 'student', select: 'name rollNumber email department' },
      { path: 'class', select: 'name code' }
    ]);

    if (attendanceStatus === 'present') {
      await awardPointsAndBadge(student._id, 10, null, `manual attendance for ${subjectTrimmed}`);
    }

    res.status(200).json({
      success: true,
      message: `Attendance marked as ${attendanceStatus} for ${student.name} (${courseValue})`,
      attendance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Get own attendance records, subject-wise calculation, and overall percentage
// @route   GET /api/attendance/my-attendance
// @access  Private (Student)
const getMyAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ student: req.user._id })
      .populate('teacher', 'name email department')
      .populate('class', 'name code')
      .sort({ date: -1 });

    const total = records.length;
    const present = records.filter((r) => r.status === 'present').length;
    const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

    // Subject-wise calculation
    const subjectMap = {};
    records.forEach((rec) => {
      const sub = rec.subject || 'General';
      if (!subjectMap[sub]) {
        subjectMap[sub] = { subject: sub, total: 0, present: 0, percentage: 0 };
      }
      subjectMap[sub].total += 1;
      if (rec.status === 'present') {
        subjectMap[sub].present += 1;
      }
    });

    const subjectWise = Object.values(subjectMap).map((item) => ({
      ...item,
      percentage: item.total === 0 ? 0 : Math.round((item.present / item.total) * 100)
    }));

    res.status(200).json({
      success: true,
      total,
      present,
      absent: total - present,
      percentage,
      subjectWise,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher: Get attendance history for classes taught
// @route   GET /api/attendance/teacher-history
// @access  Private (Teacher, Admin)
const getTeacherAttendanceHistory = async (req, res, next) => {
  try {
    const { classId, subject, date } = req.query;
    let query = { teacher: req.user._id };

    if (classId) query.class = classId;
    if (subject) query.subject = subject;
    if (date) {
      const d = new Date(date);
      query.date = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lte: new Date(d.setHours(23, 59, 59, 999))
      };
    }

    const records = await Attendance.find(query)
      .populate('student', 'name rollNumber email department')
      .populate('class', 'name code')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all attendance records and system-wide summary
// @route   GET /api/attendance/all
// @access  Private (Admin)
const getAllAttendanceAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, subject } = req.query;
    let query = {};
    if (status) query.status = status;
    if (subject) query.subject = subject;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('student', 'name rollNumber email department')
      .populate('teacher', 'name email department')
      .populate('class', 'name code')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPresent = await Attendance.countDocuments({ status: 'present' });
    const totalAbsent = await Attendance.countDocuments({ status: 'absent' });
    const overallRate = total === 0 ? 0 : Math.round((totalPresent / (totalPresent + totalAbsent || 1)) * 100);

    res.status(200).json({
      success: true,
      total,
      totalPresent,
      totalAbsent,
      overallRate,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      records
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttendanceSession,
  getActiveSession,
  endAttendanceSession,
  checkInAttendance,
  markAttendanceManual,
  getMyAttendance,
  getTeacherAttendanceHistory,
  getAllAttendanceAdmin
};
