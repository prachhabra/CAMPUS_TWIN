const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Event = require('../models/Event');
const Club = require('../models/Club');
const Complaint = require('../models/Complaint');
const Product = require('../models/Product');
const LostFound = require('../models/LostFound');
const Placement = require('../models/Placement');
const Skill = require('../models/Skill');
const StudyGroup = require('../models/StudyGroup');
const Confession = require('../models/Confession');

// @desc    Get student analytics based on actual MongoDB data
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentAnalytics = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // Attendance records
    const attendanceRecords = await Attendance.find({ student: studentId });
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter((r) => r.status === 'present').length;
    const overallAttendance =
      totalClasses === 0 ? 0 : Math.round((attendedClasses / totalClasses) * 100);

    // Subject breakdown
    const subjectStatsMap = {};
    attendanceRecords.forEach((r) => {
      const sub = r.subject || 'General';
      if (!subjectStatsMap[sub]) {
        subjectStatsMap[sub] = { subject: sub, total: 0, attended: 0, percentage: 0 };
      }
      subjectStatsMap[sub].total += 1;
      if (r.status === 'present') {
        subjectStatsMap[sub].attended += 1;
      }
    });

    const subjectAttendance = Object.values(subjectStatsMap).map((item) => ({
      ...item,
      percentage: item.total === 0 ? 0 : Math.round((item.attended / item.total) * 100)
    }));

    // Events attended / registered
    const eventsRegistered = await Event.countDocuments({
      'registeredStudents.student': studentId
    });

    // Clubs joined
    const clubsJoined = await Club.countDocuments({
      'members.user': studentId
    });

    // Complaints filed & resolved
    const totalComplaints = await Complaint.countDocuments({ student: studentId });
    const resolvedComplaints = await Complaint.countDocuments({
      student: studentId,
      status: 'resolved'
    });

    // Placements
    const placements = await Placement.find({ student: studentId });
    const placementStatusCounts = {
      Applied: 0,
      Shortlisted: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0
    };
    placements.forEach((p) => {
      if (placementStatusCounts[p.status] !== undefined) {
        placementStatusCounts[p.status] += 1;
      }
    });

    // Study groups
    const studyGroupsJoined = await StudyGroup.countDocuments({ members: studentId });

    // Skills listed
    const skillsOffered = await Skill.countDocuments({ user: studentId });

    res.status(200).json({
      success: true,
      data: {
        attendance: {
          totalClasses,
          attendedClasses,
          overallAttendance,
          subjectAttendance
        },
        eventsRegistered,
        clubsJoined,
        studyGroupsJoined,
        skillsOffered,
        complaints: {
          total: totalComplaints,
          resolved: resolvedComplaints
        },
        placement: {
          total: placements.length,
          statusBreakdown: placementStatusCounts
        },
        points: req.user.points || 0,
        badgesCount: (req.user.badges || []).length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher analytics
// @route   GET /api/analytics/teacher
// @access  Private (Teacher, Admin)
const getTeacherAnalytics = async (req, res, next) => {
  try {
    const teacherId = req.user._id;

    const classes = await Class.find({ teacher: teacherId });
    const classCount = classes.length;

    // Unique students across all teacher's classes
    const studentSet = new Set();
    classes.forEach((c) => {
      (c.students || []).forEach((s) => studentSet.add(s.toString()));
    });
    const totalStudents = studentSet.size;

    // Attendance sessions & marked records
    const attendanceRecords = await Attendance.find({ teacher: teacherId });
    const totalAttendanceMarked = attendanceRecords.length;
    const totalPresent = attendanceRecords.filter((r) => r.status === 'present').length;
    const averageAttendanceRate =
      totalAttendanceMarked === 0
        ? 0
        : Math.round((totalPresent / totalAttendanceMarked) * 100);

    // Subject breakdown
    const subjectStatsMap = {};
    attendanceRecords.forEach((r) => {
      const sub = r.subject || 'General';
      if (!subjectStatsMap[sub]) {
        subjectStatsMap[sub] = { subject: sub, total: 0, present: 0 };
      }
      subjectStatsMap[sub].total += 1;
      if (r.status === 'present') {
        subjectStatsMap[sub].present += 1;
      }
    });

    const subjectStats = Object.values(subjectStatsMap).map((item) => ({
      ...item,
      rate: item.total === 0 ? 0 : Math.round((item.present / item.total) * 100)
    }));

    // Events organized
    const eventsOrganized = await Event.countDocuments({ createdBy: teacherId });

    res.status(200).json({
      success: true,
      data: {
        classCount,
        totalStudents,
        totalAttendanceMarked,
        averageAttendanceRate,
        subjectStats,
        eventsOrganized
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide admin analytics using MongoDB aggregation
// @route   GET /api/analytics/admin
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalTeachers,
      totalAdmins,
      totalEvents,
      totalClubs,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalProducts,
      totalLostFound,
      totalPlacements,
      totalSelectedPlacements,
      totalAttendance,
      totalPresentAttendance,
      totalSkills,
      totalStudyGroups,
      totalConfessions
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'admin' }),
      Event.countDocuments(),
      Club.countDocuments(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Product.countDocuments(),
      LostFound.countDocuments(),
      Placement.countDocuments(),
      Placement.countDocuments({ status: 'Selected' }),
      Attendance.countDocuments(),
      Attendance.countDocuments({ status: 'present' }),
      Skill.countDocuments(),
      StudyGroup.countDocuments(),
      Confession.countDocuments()
    ]);

    // Department-wise user breakdown
    const departmentDistribution = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Complaint category breakdown
    const complaintCategories = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Placement status breakdown
    const placementStatuses = await Placement.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Event category breakdown
    const eventCategories = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const overallAttendanceRate =
      totalAttendance === 0 ? 0 : Math.round((totalPresentAttendance / totalAttendance) * 100);

    res.status(200).json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          teachers: totalTeachers,
          admins: totalAdmins,
          total: totalStudents + totalTeachers + totalAdmins,
          departmentDistribution
        },
        academics: {
          totalAttendance,
          overallAttendanceRate
        },
        activities: {
          events: totalEvents,
          clubs: totalClubs,
          studyGroups: totalStudyGroups,
          skills: totalSkills,
          confessions: totalConfessions,
          eventCategories
        },
        services: {
          complaints: {
            total: totalComplaints,
            pending: pendingComplaints,
            resolved: resolvedComplaints,
            categories: complaintCategories
          },
          marketplace: totalProducts,
          lostFound: totalLostFound
        },
        placements: {
          total: totalPlacements,
          selected: totalSelectedPlacements,
          statuses: placementStatuses
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentAnalytics,
  getTeacherAnalytics,
  getAdminAnalytics
};
