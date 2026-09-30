const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @desc    Get logged in student achievements & points
// @route   GET /api/achievements/my
// @access  Private
const getMyAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const allAchievements = await Achievement.find();

    const earnedBadgeIds = (user.badges || []).map((b) => b.badgeId);

    const badgesWithStatus = allAchievements.map((ach) => ({
      ...ach.toObject(),
      unlocked: earnedBadgeIds.includes(ach.criteriaCode),
      unlockedAt: user.badges?.find((b) => b.badgeId === ach.criteriaCode)?.awardedAt || null
    }));

    res.status(200).json({
      success: true,
      points: user.points || 0,
      badges: user.badges || [],
      achievements: badgesWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all achievements
// @route   GET /api/achievements/all
// @access  Authenticated
const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ points: 1 });
    res.status(200).json({
      success: true,
      count: achievements.length,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new achievement
// @route   POST /api/achievements
// @access  Private (Admin)
const createAchievement = async (req, res, next) => {
  try {
    const { title, description, icon, points, category, criteriaCode } = req.body;

    if (!title || !description || !criteriaCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, and criteriaCode'
      });
    }

    const achievement = await Achievement.create({
      title: title.trim(),
      description: description.trim(),
      icon: icon || 'Award',
      points: points !== undefined ? parseInt(points, 10) : 50,
      category: category || 'Special',
      criteriaCode: criteriaCode.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Achievement badge created successfully',
      data: achievement
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyAchievements,
  getAllAchievements,
  createAchievement
};
