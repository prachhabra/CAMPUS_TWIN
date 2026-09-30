const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// @desc    Get complaints (Student sees own, Admin sees all)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const { status, priority, category, q, page = 1, limit = 15 } = req.query;
    let query = {};

    // Students only see their own complaints
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { hostel: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('student', 'name email rollNumber department phone')
      .populate('assignedTo', 'name email role department')
      .populate('comments.user', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: complaints,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('student', 'name email rollNumber department phone')
      .populate('assignedTo', 'name email role department')
      .populate('comments.user', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Authorization check: only owner or admin/staff
    if (
      req.user.role === 'student' &&
      complaint.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint'
      });
    }

    res.status(200).json({ success: true, data: complaint });
  } catch (error) {
    next(error);
  }
};

// @desc    File a new complaint
// @route   POST /api/complaints
// @access  Private (Student)
const createComplaint = async (req, res, next) => {
  try {
    const { category, title, description, hostel, room, priority } = req.body;

    if (!category || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, title, and description'
      });
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      category,
      title: title.trim(),
      description: description.trim(),
      hostel: hostel ? hostel.trim() : '',
      room: room ? room.trim() : '',
      priority: priority || 'medium',
      status: 'pending'
    });

    // Notify user of complaint ticket created
    await Notification.create({
      recipient: req.user._id,
      title: 'Complaint Registered',
      message: `Your grievance ticket #${complaint._id.toString().slice(-6).toUpperCase()} ("${complaint.title}") has been registered and is pending review.`,
      type: 'complaint'
    });

    res.status(201).json({
      success: true,
      message: 'Grievance ticket created successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update status, assign staff, resolve complaint
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, resolutionNote } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (status) complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo || null;
    if (resolutionNote !== undefined) complaint.resolutionNote = resolutionNote;

    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Send notification to student
    await Notification.create({
      recipient: complaint.student,
      title: `Complaint Status Updated: ${status.toUpperCase()}`,
      message: `Your ticket "${complaint.title}" status changed to ${status}.${resolutionNote ? ` Note: ${resolutionNote}` : ''}`,
      type: 'complaint'
    });

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to complaint thread
// @route   POST /api/complaints/:id/comment
// @access  Private
const addCommentToComplaint = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check permission
    if (
      req.user.role === 'student' &&
      complaint.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    complaint.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    });

    await complaint.save();

    const updated = await Complaint.findById(req.params.id)
      .populate('student', 'name email rollNumber department phone')
      .populate('comments.user', 'name role');

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  addCommentToComplaint
};
