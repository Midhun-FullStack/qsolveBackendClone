const AccessRequest = require('../model/accessRequestSchema');
const Bundle = require('../model/BundleShcema');
const User = require('../model/userSchema');
const Access = require('../model/accessSchema');

// Submit access request
const submitAccessRequest = async (req, res) => {
  try {
    const { bundleId, bundleName } = req.body;
    const userId = req.user._id || req.user.id; // From JWT middleware

    // Validate bundle exists
    const bundle = await Bundle.findById(bundleId);
    if (!bundle) {
      return res.status(404).json({
        success: false,
        message: 'Bundle not found'
      });
    }

    // Check if user already has an active request for this bundle
    const existingRequest = await AccessRequest.findOne({
      userId,
      bundleId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        return res.status(409).json({
          success: false,
          message: 'You already have access to this bundle'
        });
      } else {
        return res.status(409).json({
          success: false,
          message: 'You have already requested access to this bundle. Please wait for admin approval.'
        });
      }
    }

    // Create new access request
    const accessRequest = new AccessRequest({
      userId,
      bundleId,
      bundleName: bundleName || bundle.title,
      status: 'pending'
    });

    await accessRequest.save();

    // Populate user details for response
    await accessRequest.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Access request submitted successfully',
      data: {
        requestId: accessRequest.requestId,
        bundleName: accessRequest.bundleName,
        status: accessRequest.status,
        requestedAt: accessRequest.requestedAt
      }
    });

  } catch (error) {
    console.error('Error submitting access request:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested access to this bundle'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit access request',
      error: error.message
    });
  }
};

// Get user's access requests
const getUserAccessRequests = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const requests = await AccessRequest.find({ userId })
      .populate('bundleId', 'title departmentID')
      .populate('reviewedBy', 'name')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Error fetching user access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access requests',
      error: error.message
    });
  }
};

// Get all access requests (admin only)
const getAllAccessRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const requests = await AccessRequest.find(filter)
      .populate('userId', 'name email')
      .populate('bundleId', 'title departmentID')
      .populate('reviewedBy', 'name')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AccessRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: requests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Error fetching access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access requests',
      error: error.message
    });
  }
};

// Review access request (admin only)
const reviewAccessRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, reviewNotes, expiryDate } = req.body;
    const reviewerId = req.user._id || req.user.id;

    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or denied'
      });
    }

    const accessRequest = await AccessRequest.findById(requestId)
      .populate('userId', 'name email')
      .populate('bundleId', 'title');

    if (!accessRequest) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    if (accessRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been reviewed'
      });
    }

    // Update request status
    accessRequest.status = status;
    accessRequest.reviewedAt = new Date();
    accessRequest.reviewedBy = reviewerId;
    accessRequest.reviewNotes = reviewNotes;

    await accessRequest.save();

    // If approved, create access record
    if (status === 'approved') {
      await Access.findOneAndUpdate(
        { 
          userId: accessRequest.userId._id, 
          bundleId: accessRequest.bundleId._id 
        },
        {
          userId: accessRequest.userId._id,
          bundleId: accessRequest.bundleId._id,
          grantedBy: reviewerId,
          grantedAt: new Date(),
          expiresAt: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
          isActive: true,
          notes: `Auto-granted from access request ${accessRequest.requestId}`
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Access request ${status} successfully`,
      data: accessRequest
    });

  } catch (error) {
    console.error('Error reviewing access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review access request',
      error: error.message
    });
  }
};

module.exports = {
  submitAccessRequest,
  getUserAccessRequests,
  getAllAccessRequests,
  reviewAccessRequest
};