const Placement = require('../models/Placement');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get student placements (Student sees own, Admin sees all)
// @route   GET /api/placements
// @access  Private
const getPlacements = async (req, res, next) => {
  try {
    const { status, company, q, page = 1, limit = 20 } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }
    if (company && company !== 'All') {
      query.company = { $regex: company, $options: 'i' };
    }
    if (q) {
      query.$or = [
        { company: { $regex: q, $options: 'i' } },
        { role: { $regex: q, $options: 'i' } },
        { notes: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Placement.countDocuments(query);
    const placements = await Placement.find(query)
      .populate('student', 'name email rollNumber department year')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: placements,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new placement tracker entry
// @route   POST /api/placements
// @access  Private (Student)
const createPlacement = async (req, res, next) => {
  try {
    const { company, role, applicationDate, status, package: pkg, interviewRound, notes } =
      req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name and job role'
      });
    }

    const placement = await Placement.create({
      student: req.user._id,
      company: company.trim(),
      role: role.trim(),
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'Applied',
      package: pkg ? pkg.trim() : '',
      interviewRound: interviewRound ? interviewRound.trim() : 'Application Submitted',
      notes: notes ? notes.trim() : ''
    });

    if (status === 'Selected') {
      await awardPointsAndBadge(
        req.user._id,
        50,
        { badgeId: 'job-offer', name: 'Offer Secured', icon: 'CheckSquare' },
        `receiving placement offer from ${company}`
      );
    } else {
      await awardPointsAndBadge(req.user._id, 10, null, `tracking application for ${company}`);
    }

    res.status(201).json({
      success: true,
      message: 'Placement application entry saved',
      data: placement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update placement entry
// @route   PUT /api/placements/:id
// @access  Private (Student owner or Admin)
const updatePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement entry not found' });
    }

    if (placement.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const fields = ['company', 'role', 'applicationDate', 'status', 'package', 'interviewRound', 'notes'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        placement[f] = req.body[f];
      }
    });

    if (req.body.status === 'Selected' && placement.status !== 'Selected') {
      await awardPointsAndBadge(
        placement.student,
        50,
        { badgeId: 'job-offer', name: 'Offer Secured', icon: 'CheckSquare' },
        `getting selected at ${placement.company}`
      );
    }

    const updated = await placement.save();

    res.status(200).json({
      success: true,
      message: 'Placement status updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete placement entry
// @route   DELETE /api/placements/:id
// @access  Private (Student owner or Admin)
const deletePlacement = async (req, res, next) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement entry not found' });
    }

    if (placement.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Placement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Placement entry deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacements,
  createPlacement,
  updatePlacement,
  deletePlacement
};
