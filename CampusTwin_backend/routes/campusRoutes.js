const express = require('express');
const router = express.Router();
const {
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation
} = require('../controllers/campusController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/').get(getLocations).post(protect, authorizeRoles('admin'), createLocation);

router
  .route('/:id')
  .get(getLocationById)
  .put(protect, authorizeRoles('admin'), updateLocation)
  .delete(protect, authorizeRoles('admin'), deleteLocation);

module.exports = router;
