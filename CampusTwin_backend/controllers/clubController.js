const Club = require('../models/Club');
const Notification = require('../models/Notification');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get all clubs with search and category filter
// @route   GET /api/clubs
// @access  Public / Authenticated
const getClubs = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { facultyCoordinator: { $regex: q, $options: 'i' } }
      ];
    }

    const clubs = await Club.find(query)
      .populate('president', 'name email department rollNumber')
      .populate('members.user', 'name email department rollNumber year')
      .sort({ createdAt: -1 });

    const formattedClubs = clubs.map((club) => {
      const c = club.toObject();
      c.memberCount = club.members.length;
      return c;
    });

    res.status(200).json({
      success: true,
      count: formattedClubs.length,
      data: formattedClubs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single club by ID
// @route   GET /api/clubs/:id
// @access  Public / Authenticated
const getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate('president', 'name email department rollNumber')
      .populate('members.user', 'name email department rollNumber year');

    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const c = club.toObject();
    c.memberCount = club.members.length;

    res.status(200).json({ success: true, data: c });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new club
// @route   POST /api/clubs
// @access  Private (Teacher, Admin)
const createClub = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      president,
      facultyCoordinator,
      logo,
      socialLinks
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Club name and description are required'
      });
    }

    const existingClub = await Club.findOne({ name: name.trim() });
    if (existingClub) {
      return res.status(400).json({
        success: false,
        message: 'A club with this name already exists'
      });
    }

    const club = await Club.create({
      name: name.trim(),
      description: description.trim(),
      category: category || 'Technical',
      president: president || null,
      facultyCoordinator: facultyCoordinator || '',
      logo: logo || '',
      socialLinks: socialLinks || {},
      createdBy: req.user._id,
      members: []
    });

    res.status(201).json({
      success: true,
      message: 'Club registered successfully',
      data: club
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update club
// @route   PUT /api/clubs/:id
// @access  Private (Admin, or Teacher who created it)
const updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    if (club.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this club' });
    }

    const fields = ['name', 'description', 'category', 'president', 'facultyCoordinator', 'logo', 'socialLinks'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        club[field] = req.body[field];
      }
    });

    const updated = await club.save();
    res.status(200).json({ success: true, message: 'Club updated successfully', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete club
// @route   DELETE /api/clubs/:id
// @access  Private (Admin)
const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    await Club.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Club deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Join club
// @route   POST /api/clubs/:id/join
// @access  Private (Student)
const joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const alreadyMember = club.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this club'
      });
    }

    club.members.push({
      user: req.user._id,
      joinedAt: new Date(),
      role: 'Member'
    });

    await club.save();

    await Notification.create({
      recipient: req.user._id,
      title: 'Club Joined',
      message: `Welcome to ${club.name}! You are now an active member.`,
      type: 'club'
    });

    await awardPointsAndBadge(req.user._id, 25, null, `joining ${club.name}`);

    res.status(200).json({
      success: true,
      message: `Successfully joined ${club.name}!`,
      data: club
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Leave club
// @route   POST /api/clubs/:id/leave
// @access  Private (Student)
const leaveClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    club.members = club.members.filter(
      (m) => m.user.toString() !== req.user._id.toString()
    );

    await club.save();

    res.status(200).json({
      success: true,
      message: `You have left ${club.name}`,
      data: club
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  leaveClub
};
