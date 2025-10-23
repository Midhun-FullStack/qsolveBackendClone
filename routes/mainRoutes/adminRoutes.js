const express = require("express");
const router = express.Router();
const { authenticateUser, requireAdmin } = require("../../middleware/auth");

// Import controllers
const userController = require("../../controller/userController");
const departmentController = require("../../controller/deparmentController");
const subjectController = require("../../controller/subjectController");
const semesterController = require("../../controller/semesterController");
const bundleController = require("../../controller/bundleController");
const questionBankController = require("../../controller/questionBankController");
const paymentController = require("../../controller/paymentController");

// Middleware: All admin routes require authentication and admin role
router.use(authenticateUser);
router.use(requireAdmin);

// ===== DASHBOARD STATS =====
router.get("/dashboard/stats", async (req, res) => {
  try {
    const User = require("../../model/userSchema");
    const Department = require("../../model/DepartmentSchema");
    const Subject = require("../../model/subjectSchema");
    const Bundle = require("../../model/BundleShcema");
    const QuestionBank = require("../../model/questionBankSchema");
    const Purchase = require("../../model/purchaseSchema");

    const [
      totalUsers,
      totalDepartments,
      totalSubjects,
      totalBundles,
      totalQuestionBanks,
      totalPurchases,
      recentUsers,
      recentPurchases
    ] = await Promise.all([
      User.countDocuments(),
      Department.countDocuments(),
      Subject.countDocuments(),
      Bundle.countDocuments(),
      QuestionBank.countDocuments(),
      Purchase.countDocuments({ paymentDone: true }),
      User.find().sort({ _id: -1 }).limit(5).select('username email role createdAt'),
      Purchase.find({ paymentDone: true }).sort({ _id: -1 }).limit(5)
        .populate('userId', 'username email')
        .populate('bundleId', 'title price')
    ]);

    // Calculate revenue
    const revenue = await Purchase.aggregate([
      { $match: { paymentDone: true } },
      { $lookup: { from: 'bundles', localField: 'bundleId', foreignField: '_id', as: 'bundle' } },
      { $unwind: '$bundle' },
      { $group: { _id: null, total: { $sum: '$bundle.price' } } }
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

    res.json({
      stats: {
        totalUsers,
        totalDepartments,
        totalSubjects,
        totalBundles,
        totalQuestionBanks,
        totalPurchases,
        totalRevenue
      },
      recentActivity: {
        recentUsers,
        recentPurchases
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

// ===== USER MANAGEMENT =====
router.get("/users", userController.getAllUsers);
router.delete("/users/:id", userController.deleteUser);
router.post("/users", userController.registerUser);

// ===== DEPARTMENT MANAGEMENT =====
router.get("/departments", departmentController.getAllDepartment);
router.post("/departments", departmentController.createDepartment);
router.delete("/departments/:id", async (req, res) => {
  try {
    const Department = require("../../model/DepartmentSchema");
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department' });
  }
});

// ===== SUBJECT MANAGEMENT =====
router.get("/subjects", subjectController.getAllSubject);
router.post("/subjects", subjectController.createSubject);
router.delete("/subjects/:id", async (req, res) => {
  try {
    const Subject = require("../../model/subjectSchema");
    const deleted = await Subject.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete subject' });
  }
});

// ===== SEMESTER MANAGEMENT =====
router.get("/semesters", semesterController.getAllSemester);
router.post("/semesters", semesterController.createSemester);
router.delete("/semesters/:id", async (req, res) => {
  try {
    const Semester = require("../../model/semesterSchema");
    const deleted = await Semester.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Semester not found' });
    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete semester' });
  }
});

// ===== BUNDLE MANAGEMENT =====
router.get("/bundles", bundleController.getAllBundle);
router.get("/bundles/:id", bundleController.getBundleById);
router.post("/bundles", bundleController.createBundle);
router.put("/bundles/:id", bundleController.updateBundle);
router.delete("/bundles/:id", bundleController.deleteBundle);

// ===== QUESTION BANK MANAGEMENT =====
const { parser, handleMulterError, verifyUploadedPDF } = require("../../middleware/multer");

router.get("/question-banks", questionBankController.getAllQuestionBank);
router.get("/question-banks/:id", questionBankController.getQuestionBankById);
router.post("/question-banks", 
  parser.single("file"), 
  handleMulterError,
  verifyUploadedPDF,
  questionBankController.createQuestionBank
);
router.put("/question-banks/:id", 
  parser.single("file"), 
  handleMulterError,
  verifyUploadedPDF,
  questionBankController.updateQuestionBank
);
router.delete("/question-banks/:id", questionBankController.deleteQuestionBank);

// ===== ACCESS MANAGEMENT =====
const accessController = require("../../controller/accessController");

router.get("/access", accessController.getAllAccess);
router.get("/access/stats", accessController.getAccessStats);
router.post("/access/grant", accessController.grantAccess);
router.post("/access/revoke", accessController.revokeAccess);
router.post("/access/bulk-grant", accessController.bulkGrantAccess);

// ===== PURCHASE/PAYMENT MANAGEMENT (Legacy) =====
router.get("/purchases", paymentController.getAllPurchases);

// ===== ANALYTICS =====
router.get("/analytics/revenue", async (req, res) => {
  try {
    const Purchase = require("../../model/purchaseSchema");
    
    // Monthly revenue for the last 12 months
    const monthlyRevenue = await Purchase.aggregate([
      { $match: { paymentDone: true } },
      { $lookup: { from: 'bundles', localField: 'bundleId', foreignField: '_id', as: 'bundle' } },
      { $unwind: '$bundle' },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$bundle.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({ monthlyRevenue });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

router.get("/analytics/popular-bundles", async (req, res) => {
  try {
    const Purchase = require("../../model/purchaseSchema");
    
    const popularBundles = await Purchase.aggregate([
      { $match: { paymentDone: true } },
      { $group: { _id: '$bundleId', purchaseCount: { $sum: 1 } } },
      { $lookup: { from: 'bundles', localField: '_id', foreignField: '_id', as: 'bundle' } },
      { $unwind: '$bundle' },
      { $sort: { purchaseCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          title: '$bundle.title',
          price: '$bundle.price',
          purchaseCount: 1,
          revenue: { $multiply: ['$bundle.price', '$purchaseCount'] }
        }
      }
    ]);

    res.json({ popularBundles });
  } catch (error) {
    console.error('Popular bundles error:', error);
    res.status(500).json({ message: 'Failed to fetch popular bundles' });
  }
});

module.exports = router;