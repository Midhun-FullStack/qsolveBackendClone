const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const accessSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bundleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bundle",
        required: true
    },
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Admin who granted access
        required: true
    },
    grantedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null // null means no expiration
    },
    isActive: {
        type: Boolean,
        default: true
    },
    notes: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate access grants
accessSchema.index({ userId: 1, bundleId: 1 }, { unique: true });

// Index for efficient queries
accessSchema.index({ userId: 1, isActive: 1 });
accessSchema.index({ bundleId: 1, isActive: 1 });
accessSchema.index({ grantedBy: 1 });

// Add pagination plugin
accessSchema.plugin(mongoosePaginate);

const Access = mongoose.model('Access', accessSchema);
module.exports = Access;