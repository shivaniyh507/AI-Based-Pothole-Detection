const PotholeReport = require('../Models/PotholeReport');

// @desc    Get all pothole coordinates for map markers
// @route   GET /api/map/potholes
// @access  Public
const getPotholes = async (req, res, next) => {
  try {
    const { status, severity } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const reports = await PotholeReport.find(query).select(
      'latitude longitude locationName severity status detectedPotholesCount imagePath createdAt'
    );

    const markers = reports.map((item) => ({
      id: item._id,
      lat: item.latitude,
      lng: item.longitude,
      title: item.locationName,
      severity: item.severity,
      status: item.status,
      count: item.detectedPotholesCount,
      imagePath: item.imagePath,
      createdAt: item.createdAt
    }));

    res.json({
      success: true,
      count: markers.length,
      markers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby potholes by lat, lng & radius
// @route   GET /api/map/nearby
// @access  Public
const getNearbyPotholes = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5 } = req.query; // radius in km

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    // Approximate bounding box formula (1 degree latitude ≈ 111 km)
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

    const reports = await PotholeReport.find({
      latitude: { $gte: latitude - latDelta, $lte: latitude + latDelta },
      longitude: { $gte: longitude - lngDelta, $lte: longitude + lngDelta }
    });

    res.json({
      success: true,
      center: { lat: latitude, lng: longitude },
      radiusKm,
      count: reports.length,
      potholes: reports
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPotholes,
  getNearbyPotholes
};
