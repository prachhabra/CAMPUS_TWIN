const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { awardPointsAndBadge } = require('../utils/awardPoints');

// @desc    Get all events with search, category, status and pagination
// @route   GET /api/events
// @access  Public / Authenticated
const getEvents = async (req, res, next) => {
  try {
    const { q, category, status, page = 1, limit = 12 } = req.query;
    let query = {};

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
        { venue: { $regex: q, $options: 'i' } },
        { organizer: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name email role department')
      .populate('club', 'name logo')
      .populate('registeredStudents.student', 'name rollNumber email department')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: events,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum) || 1
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public / Authenticated
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('club', 'name logo')
      .populate('registeredStudents.student', 'name rollNumber email department');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Teacher, Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      time,
      venue,
      organizer,
      club,
      category,
      image,
      registrationLimit
    } = req.body;

    if (!title || !description || !date || !time || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, date, time, and venue'
      });
    }

    const event = await Event.create({
      title: title.trim(),
      description: description.trim(),
      date,
      time: time.trim(),
      venue: venue.trim(),
      organizer: organizer || req.user.name,
      club: club || null,
      category: category || 'Technical',
      image: image || '',
      registrationLimit: registrationLimit ? parseInt(registrationLimit, 10) : 100,
      createdBy: req.user._id,
      registeredStudents: []
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Teacher, Admin)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this event' });
    }

    const fields = [
      'title',
      'description',
      'date',
      'time',
      'venue',
      'organizer',
      'club',
      'category',
      'image',
      'registrationLimit',
      'status'
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    const updated = await event.save();
    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Teacher, Admin)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Register for an event
// @route   POST /api/events/:id/register
// @access  Private (Student)
const registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: `Registration closed. Event is currently marked as ${event.status}.`
      });
    }

    // Check duplicate registration
    const isAlreadyRegistered = event.registeredStudents.some(
      (reg) => reg.student.toString() === req.user._id.toString()
    );

    if (isAlreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check capacity limit
    if (event.registeredStudents.length >= event.registrationLimit) {
      return res.status(400).json({
        success: false,
        message: 'Event registration limit reached'
      });
    }

    event.registeredStudents.push({
      student: req.user._id,
      registeredAt: new Date()
    });

    await event.save();

    // Create confirmation notification
    await Notification.create({
      recipient: req.user._id,
      title: 'Event Registration Confirmed',
      message: `You have successfully registered for "${event.title}" on ${new Date(event.date).toLocaleDateString()} at ${event.venue}.`,
      type: 'event'
    });

    // Check event participation milestone
    const totalEventsRegistered = await Event.countDocuments({
      'registeredStudents.student': req.user._id
    });

    let badge = null;
    if (totalEventsRegistered === 3) {
      badge = { badgeId: 'event-explorer', name: 'Campus Explorer', icon: 'Compass' };
    } else if (totalEventsRegistered === 10) {
      badge = { badgeId: 'event-champion', name: 'Event Enthusiast', icon: 'Flame' };
    }

    await awardPointsAndBadge(req.user._id, 20, badge, `registering for ${event.title}`);

    res.status(200).json({
      success: true,
      message: `Successfully registered for ${event.title}!`,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student: Cancel registration for an event
// @route   POST /api/events/:id/cancel-registration
// @access  Private (Student)
const cancelEventRegistration = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.registeredStudents = event.registeredStudents.filter(
      (reg) => reg.student.toString() !== req.user._id.toString()
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event registration cancelled',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration
};
