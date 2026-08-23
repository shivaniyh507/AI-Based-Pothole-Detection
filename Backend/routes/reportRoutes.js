const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  deleteReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get all reports & create report
router.route('/')
  .get(getReports)
  .post(upload.single('image'), createReport);

// Get single report & delete report
router.route('/:id')
  .get(getReportById)
  .delete(protect, authorize('admin'), deleteReport);

// Update status (Pending -> In-Progress -> Repaired)
router.put('/:id/status', protect, updateReportStatus);

module.exports = router;
