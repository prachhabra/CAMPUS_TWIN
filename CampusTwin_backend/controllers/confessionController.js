const Confession = require('../models/Confession');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get approved confessions for public/student view (anonymized)
// @route   GET /api/confessions
// @access  Authenticated
const getApprovedConfessions = async (req, res, next) => {
  try {
    const { category, sort = 'recent', page = 1, limit = 15 } = req.query;
    let query = { status: 'approved' };

    if (category && category !== 'All') {
      query.category = category;
    }

    const sortOption = sort === 'popular' ? { likes: -1, createdAt: -1 } : { createdAt: -1 };

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Confession.countDocuments(query);
    const confessions = await Confession.find(query)
      .select('-author') // STRICT RULE: Public UI MUST NOT expose author identity
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Map to include whether current user liked it and count of likes
    const formatted = confessions.map((c) => ({
      _id: c._id,
      content: c.content,
      category: c.category,
      anonymous: c.anonymous,
      likeCount: c.likes ? c.likes.length : 0,
      isLiked: req.user ? c.likes.some((id) => id.toString() === req.user._id.toString()) : false,
      createdAt: c.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formatted,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Get all confessions including pending & rejected with author info for moderation
// @route   GET /api/confessions/admin
// @access  Private (Admin)
const getAdminConfessions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status && status !== 'All') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Confession.countDocuments(query);
    const confessions = await Confession.find(query)
      .populate('author', 'name email department rollNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: confessions,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit confession
// @route   POST /api/confessions
// @access  Private (Student)
const createConfession = async (req, res, next) => {
  try {
    const { content, category, anonymous = true } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Confession content cannot be blank'
      });
    }

    const confession = await Confession.create({
      content: content.trim(),
      category: category || 'General',
      author: req.user._id,
      anonymous: Boolean(anonymous),
      status: 'pending', // Requires admin moderation or approval
      likes: []
    });

    await awardPointsAndBadge(req.user._id, 5, null, 'submitting campus confession');

    res.status(201).json({
      success: true,
      message: 'Confession submitted! It will appear on the wall once reviewed by moderators.',
      data: {
        _id: confession._id,
        content: confession.content,
        category: confession.category,
        status: confession.status,
        createdAt: confession.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on confession
// @route   POST /api/confessions/:id/like
// @access  Private
const toggleLikeConfession = async (req, res, next) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    const index = confession.likes.findIndex((id) => id.toString() === req.user._id.toString());
    let isLiked = false;

    if (index === -1) {
      confession.likes.push(req.user._id);
      isLiked = true;
    } else {
      confession.likes.splice(index, 1);
      isLiked = false;
    }

    await confession.save();

    res.status(200).json({
      success: true,
      isLiked,
      likeCount: confession.likes.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update confession status (approve/reject)
// @route   PUT /api/confessions/:id/status
// @access  Private (Admin)
const updateConfessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    confession.status = status;
    await confession.save();

    res.status(200).json({
      success: true,
      message: `Confession ${status} successfully`,
      data: confession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete confession
// @route   DELETE /api/confessions/:id
// @access  Private (Admin)
const deleteConfession = async (req, res, next) => {
  try {
    const confession = await Confession.findById(req.params.id);
    if (!confession) {
      return res.status(404).json({ success: false, message: 'Confession not found' });
    }

    await Confession.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Confession deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApprovedConfessions,
  getAdminConfessions,
  createConfession,
  toggleLikeConfession,
  updateConfessionStatus,
  deleteConfession
};
