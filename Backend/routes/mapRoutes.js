const express = require('express');
const router = express.Router();
const { getPotholes, getNearbyPotholes } = require('../controllers/mapController');

// Geo-location data & pothole coordinates for interactive maps
router.get('/potholes', getPotholes);

// Query nearby potholes by lat, lng & radius
router.get('/nearby', getNearbyPotholes);

module.exports = router;
