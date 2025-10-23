const mongoose = require('mongoose');

const accessRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bundleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bundle',
    required: true
  },
  bundleName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'denied', 'expired'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: {
    type: String,
    trim: true
  },
  // Auto-generated request ID for tracking
  requestId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique request ID before saving
accessRequestSchema.pre('save', function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.requestId = `REQ-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Index for efficient queries
accessRequestSchema.index({ userId: 1, bundleId: 1 }, { unique: true }); // Prevent duplicate requests
accessRequestSchema.index({ status: 1, requestedAt: -1 });
accessRequestSchema.index({ requestId: 1 });

module.exports = mongoose.model('AccessRequest', accessRequestSchema);