const express = require("express");
const router = express.Router();
const accessController = require("../../controller/accessController");
const { authenticateUser, requireAdmin } = require("../../middleware/auth");

// User routes - get their own access
router.get("/my-access", authenticateUser, accessController.getUserAccess);
router.get("/details/:userId/:bundleId", authenticateUser, accessController.getAccessDetails);

// Admin routes - manage all access
router.use(authenticateUser);
router.use(requireAdmin);

router.get("/", accessController.getAllAccess);
router.get("/stats", accessController.getAccessStats);
router.post("/grant", accessController.grantAccess);
router.post("/revoke", accessController.revokeAccess);
router.post("/bulk-grant", accessController.bulkGrantAccess);

module.exports = router;