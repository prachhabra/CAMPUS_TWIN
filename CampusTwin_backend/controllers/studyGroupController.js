const StudyGroup = require('../models/StudyGroup');
const Notification = require('../models/Notification');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get all study groups with search
// @route   GET /api/study-groups
// @access  Public / Authenticated
const getGroups = async (req, res, next) => {
  try {
    const { q, subject } = req.query;
    let query = {};

    if (subject && subject !== 'All') {
      query.subject = subject;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const groups = await StudyGroup.find(query)
      .populate('createdBy', 'name email department rollNumber year')
      .populate('members', 'name email department rollNumber year profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study group
// @route   GET /api/study-groups/:id
// @access  Public / Authenticated
const getGroupById = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('createdBy', 'name email department rollNumber year')
      .populate('members', 'name email department rollNumber year profileImage');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// @desc    Create study group
// @route   POST /api/study-groups
// @access  Private (Student)
const createGroup = async (req, res, next) => {
  try {
    const { name, subject, description, meetingTime, location, maxMembers } = req.body;

    if (!name || !subject || !description || !meetingTime || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const group = await StudyGroup.create({
      name: name.trim(),
      subject: subject.trim(),
      description: description.trim(),
      meetingTime: meetingTime.trim(),
      location: location.trim(),
      maxMembers: maxMembers ? parseInt(maxMembers, 10) : 8,
      createdBy: req.user._id,
      members: [req.user._id] // Creator is initial member
    });

    await awardPointsAndBadge(req.user._id, 15, null, `founding study group ${group.name}`);

    res.status(201).json({
      success: true,
      message: 'Study group created successfully',
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join study group
// @route   POST /api/study-groups/:id/join
// @access  Private (Student)
const joinGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    // Duplicate check
    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this study group'
      });
    }

    // Capacity validation
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Study group has reached maximum member capacity'
      });
    }

    group.members.push(req.user._id);
    await group.save();

    await awardPointsAndBadge(req.user._id, 10, null, `joining study group ${group.name}`);

    res.status(200).json({
      success: true,
      message: `You joined ${group.name}!`,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave study group
// @route   POST /api/study-groups/:id/leave
// @access  Private (Student)
const leaveGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    group.members = group.members.filter((m) => m.toString() !== req.user._id.toString());
    await group.save();

    res.status(200).json({
      success: true,
      message: `You left ${group.name}`,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study group
// @route   DELETE /api/study-groups/:id
// @access  Private (Creator or Admin)
const deleteGroup = async (req, res, next) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Study group not found' });
    }

    if (group.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this study group'
      });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Study group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup
};
