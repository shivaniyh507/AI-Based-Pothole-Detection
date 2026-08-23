const express = require('express');
const router = express.Router();
const { uploadAndProcessScan, processFrame } = require('../controllers/scanController');
const upload = require('../middleware/uploadMiddleware');

// Upload image file and trigger Python OpenCV AI detection
router.post('/upload', upload.single('image'), uploadAndProcessScan);

// Process raw base64 frame image or video frame stream
router.post('/process-frame', processFrame);

module.exports = router;
