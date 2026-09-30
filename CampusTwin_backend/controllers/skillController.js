const Skill = require('../models/Skill');
const Notification = require('../models/Notification');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get skills with search and filters
// @route   GET /api/skills
// @access  Public / Authenticated
const getSkills = async (req, res, next) => {
  try {
    const { q, category, level } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (level && level !== 'All') {
      query.level = level;
    }
    if (q) {
      query.$or = [
        { skill: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const skills = await Skill.find(query)
      .populate('user', 'name email department rollNumber year profileImage phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new skill offer
// @route   POST /api/skills
// @access  Private (Student, Teacher)
const createSkill = async (req, res, next) => {
  try {
    const { skill, category, level, description, availability } = req.body;

    if (!skill || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide skill name and description'
      });
    }

    const newSkill = await Skill.create({
      user: req.user._id,
      skill: skill.trim(),
      category: category || 'Programming',
      level: level || 'Intermediate',
      description: description.trim(),
      availability: availability || 'Flexible'
    });

    await awardPointsAndBadge(req.user._id, 15, null, `listing skill ${newSkill.skill}`);

    res.status(201).json({
      success: true,
      message: 'Skill offered successfully on Skill Exchange',
      data: newSkill
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private (Owner or Admin)
const updateSkill = async (req, res, next) => {
  try {
    const skillObj = await Skill.findById(req.params.id);
    if (!skillObj) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    if (skillObj.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const fields = ['skill', 'category', 'level', 'description', 'availability'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        skillObj[f] = req.body[f];
      }
    });

    const updated = await skillObj.save();
    res.status(200).json({ success: true, message: 'Skill updated', data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private (Owner or Admin)
const deleteSkill = async (req, res, next) => {
  try {
    const skillObj = await Skill.findById(req.params.id);
    if (!skillObj) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    if (skillObj.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Skill removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Send connect request to skill tutor
// @route   POST /api/skills/:id/connect
// @access  Private
const connectWithSkillPeer = async (req, res, next) => {
  try {
    const skillObj = await Skill.findById(req.params.id).populate('user');
    if (!skillObj) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const { message } = req.body;

    await Notification.create({
      recipient: skillObj.user._id,
      title: 'Skill Exchange Request',
      message: `${req.user.name} wants to connect with you regarding your "${skillObj.skill}" skill listing! ${message ? `Note: "${message}"` : ''}`,
      type: 'system'
    });

    res.status(200).json({
      success: true,
      message: `Connection request sent to ${skillObj.user.name}!`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  connectWithSkillPeer
};
