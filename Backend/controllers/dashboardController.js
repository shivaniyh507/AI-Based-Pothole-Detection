const PotholeReport = require('../Models/PotholeReport');
const User = require('../Models/User');

// @desc    Get aggregated dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Public / Private
const getStats = async (req, res, next) => {
  try {
    const totalPotholes = await PotholeReport.countDocuments();
    const pendingCount = await PotholeReport.countDocuments({ status: 'Pending' });
    const inProgressCount = await PotholeReport.countDocuments({ status: 'In-Progress' });
    const repairedCount = await PotholeReport.countDocuments({ status: 'Repaired' });

    const criticalCount = await PotholeReport.countDocuments({ severity: 'Critical' });
    const highCount = await PotholeReport.countDocuments({ severity: 'High' });
    const mediumCount = await PotholeReport.countDocuments({ severity: 'Medium' });
    const lowCount = await PotholeReport.countDocuments({ severity: 'Low' });

    const totalDrivers = await User.countDocuments({ role: 'driver' });

    const repairRate = totalPotholes > 0 
      ? Math.round((repairedCount / totalPotholes) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        totalPotholes,
        pendingCount,
        inProgressCount,
        repairedCount,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        totalDrivers,
        repairRatePercentage: repairRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics, summaries & chart breakdown
// @route   GET /api/dashboard/analytics
// @access  Public / Private
const getAnalytics = async (req, res, next) => {
  try {
    const recentDetections = await PotholeReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'name email');

    // Grouping by severity
    const severityBreakdown = await PotholeReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Grouping by status
    const statusBreakdown = await PotholeReport.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        recentDetections,
        severityBreakdown,
        statusBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getAnalytics
};
