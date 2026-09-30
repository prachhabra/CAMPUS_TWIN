const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelEventRegistration
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router
  .route('/')
  .get(getEvents)
  .post(protect, authorizeRoles('teacher', 'admin'), createEvent);

router
  .route('/:id')
  .get(getEventById)
  .put(protect, authorizeRoles('teacher', 'admin'), updateEvent)
  .delete(protect, authorizeRoles('teacher', 'admin'), deleteEvent);

router.post('/:id/register', protect, authorizeRoles('student'), registerForEvent);
router.post('/:id/cancel-registration', protect, authorizeRoles('student'), cancelEventRegistration);

module.exports = router;
