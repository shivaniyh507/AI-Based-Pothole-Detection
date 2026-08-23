const mongoose = require('mongoose');

const boundingBoxSchema = new mongoose.Schema(
  {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  },
  { _id: false }
);

const potholeReportSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    },
    locationName: {
      type: String,
      default: 'Unknown Location'
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Pending', 'In-Progress', 'Repaired'],
      default: 'Pending'
    },
    boundingBoxes: [boundingBoxSchema],
    imagePath: {
      type: String,
      required: [true, 'Image path is required']
    },
    detectedPotholesCount: {
      type: Number,
      default: 1
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    repairedAt: {
      type: Date
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PotholeReport', potholeReportSchema);
