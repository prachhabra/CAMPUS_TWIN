const LostFound = require('../models/LostFound');

// @desc    Get lost and found items
// @route   GET /api/lostfound
// @access  Public / Authenticated
const getItems = async (req, res, next) => {
  try {
    const { q, type, category, status, page = 1, limit = 12 } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await LostFound.countDocuments(query);
    const items = await LostFound.find(query)
      .populate('reportedBy', 'name email phone department rollNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: items,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item by ID
// @route   GET /api/lostfound/:id
// @access  Public / Authenticated
const getItemById = async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id).populate(
      'reportedBy',
      'name email phone department rollNumber'
    );

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Report lost or found item
// @route   POST /api/lostfound
// @access  Private
const createItem = async (req, res, next) => {
  try {
    const { title, description, type, category, location, date, image } = req.body;

    if (!title || !description || !type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, type (lost/found), and location'
      });
    }

    const item = await LostFound.create({
      title: title.trim(),
      description: description.trim(),
      type,
      category: category || 'Other',
      location: location.trim(),
      date: date ? new Date(date) : new Date(),
      image: image || '',
      reportedBy: req.user._id,
      status: 'open'
    });

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item status (e.g., mark as resolved / claimed)
// @route   PUT /api/lostfound/:id/status
// @access  Private (Reporter or Admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await LostFound.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update status of this item'
      });
    }

    if (status) item.status = status;
    const updated = await item.save();

    res.status(200).json({
      success: true,
      message: 'Item status updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/lostfound/:id
// @access  Private (Reporter or Admin)
const deleteItem = async (req, res, next) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateStatus,
  deleteItem
};
