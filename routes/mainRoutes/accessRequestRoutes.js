const express = require('express');
const router = express.Router();
const {
  submitAccessRequest,
  getUserAccessRequests,
  getAllAccessRequests,
  reviewAccessRequest
} = require('../../controller/accessRequestController');
const { authenticateUser, requireAdmin } = require('../../middleware/auth');

// User routes (require authentication)
router.post('/request', authenticateUser, submitAccessRequest);
router.get('/my-requests', authenticateUser, getUserAccessRequests);

// Admin routes (require admin privileges)
router.get('/all', authenticateUser, requireAdmin, getAllAccessRequests);
router.put('/review/:requestId', authenticateUser, requireAdmin, reviewAccessRequest);

module.exports = router;