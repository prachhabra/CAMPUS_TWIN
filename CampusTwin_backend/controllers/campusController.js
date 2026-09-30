const CampusLocation = require('../models/CampusLocation');

// @desc    Get all campus locations with search and category filter
// @route   GET /api/campus
// @access  Public / Authenticated
const getLocations = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const locations = await CampusLocation.find(query)
      .populate('createdBy', 'name email role')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single campus location by ID
// @route   GET /api/campus/:id
// @access  Public / Authenticated
const getLocationById = async (req, res, next) => {
  try {
    const location = await CampusLocation.findById(req.params.id).populate(
      'createdBy',
      'name email role'
    );
    if (!location) {
      return res.status(404).json({ success: false, message: 'Campus location not found' });
    }
    res.status(200).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new campus location
// @route   POST /api/campus
// @access  Private (Admin)
const createLocation = async (req, res, next) => {
  try {
    const { name, category, description, latitude, longitude, image } = req.body;

    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide location name, latitude, and longitude'
      });
    }

    const location = await CampusLocation.create({
      name: name.trim(),
      category: category || 'Academic',
      description: description ? description.trim() : '',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      image: image || '',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Campus location added successfully',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update campus location
// @route   PUT /api/campus/:id
// @access  Private (Admin)
const updateLocation = async (req, res, next) => {
  try {
    const location = await CampusLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Campus location not found' });
    }

    const { name, category, description, latitude, longitude, image } = req.body;
    if (name) location.name = name.trim();
    if (category) location.category = category;
    if (description !== undefined) location.description = description.trim();
    if (latitude !== undefined) location.latitude = parseFloat(latitude);
    if (longitude !== undefined) location.longitude = parseFloat(longitude);
    if (image !== undefined) location.image = image;

    const updated = await location.save();
    res.status(200).json({
      success: true,
      message: 'Campus location updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete campus location
// @route   DELETE /api/campus/:id
// @access  Private (Admin)
const deleteLocation = async (req, res, next) => {
  try {
    const location = await CampusLocation.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, message: 'Campus location not found' });
    }

    await CampusLocation.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Campus location deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
};
