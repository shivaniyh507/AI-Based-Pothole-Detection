const PotholeReport = require('../Models/PotholeReport');
const Notification = require('../Models/Notification');

// @desc    Create new pothole report
// @route   POST /api/reports
// @access  Public / Private
const createReport = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      locationName,
      severity,
      boundingBoxes,
      imagePath,
      detectedPotholesCount,
      notes
    } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and Longitude are required' });
    }

    const report = await PotholeReport.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      locationName: locationName || 'Reported Location',
      severity: severity || 'Medium',
      status: 'Pending',
      boundingBoxes: boundingBoxes || [],
      imagePath: imagePath || (req.file ? `/uploads/${req.file.filename}` : '/uploads/default-pothole.jpg'),
      detectedPotholesCount: detectedPotholesCount || 1,
      reportedBy: req.user ? req.user._id : null,
      notes: notes || ''
    });

    // Generate notification
    await Notification.create({
      title: 'New Pothole Report Created',
      message: `A new ${report.severity} severity pothole was reported at ${report.locationName}.`,
      targetUser: req.user ? req.user._id : null,
      type: 'alert'
    });

    res.status(201).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pothole reports with filters
// @route   GET /api/reports
// @access  Public / Private
const getReports = async (req, res, next) => {
  try {
    const { status, severity, search, limit = 50, page = 1 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }
    if (severity) {
      query.severity = severity;
    }
    if (search) {
      query.locationName = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await PotholeReport.find(query)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await PotholeReport.countDocuments(query);

    res.json({
      success: true,
      count: reports.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public / Private
const getReportById = async (req, res, next) => {
  try {
    const report = await PotholeReport.findById(req.params.id)
      .populate('reportedBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!report) {
      return res.status(404).json({ message: 'Pothole report not found' });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update report status (Pending -> In-Progress -> Repaired)
// @route   PUT /api/reports/:id/status
// @access  Private (Admin / Driver)
const updateReportStatus = async (req, res, next) => {
  try {
    const { status, assignedTo, notes } = req.body;

    const report = await PotholeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Pothole report not found' });
    }

    if (status) {
      if (!['Pending', 'In-Progress', 'Repaired'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      report.status = status;

      if (status === 'Repaired') {
        report.repairedAt = new Date();
      }
    }

    if (assignedTo) {
      report.assignedTo = assignedTo;
    }

    if (notes) {
      report.notes = notes;
    }

    const updatedReport = await report.save();

    // Trigger Notification for user
    if (report.reportedBy) {
      await Notification.create({
        title: `Report Status Updated: ${report.status}`,
        message: `Your reported pothole at ${report.locationName} status is now '${report.status}'.`,
        targetUser: report.reportedBy,
        type: 'status_update'
      });
    }

    res.json({
      success: true,
      report: updatedReport
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a pothole report
// @route   DELETE /api/reports/:id
// @access  Private (Admin)
const deleteReport = async (req, res, next) => {
  try {
    const report = await PotholeReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Pothole report not found' });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: 'Pothole report removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport
};
