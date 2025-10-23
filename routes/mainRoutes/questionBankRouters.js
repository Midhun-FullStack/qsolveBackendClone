const express = require("express")
router = express.Router()
const questionBank =require("../../controller/questionBankController")
const { parser, handleMulterError, verifyUploadedPDF } = require("../../middleware/multer");

const { authenticateUser } = require("../../middleware/auth")

router.get("/", (req, res) => {
    res.send("question bank API is running...")
})

// File upload routes with comprehensive error handling and PDF verification
router.post("/create", 
    authenticateUser, 
    parser.single("file"), 
    handleMulterError,
    verifyUploadedPDF,
    questionBank.createQuestionBank
)

router.post("/", authenticateUser, questionBank.getAllQuestionBank)
router.get("/:id", authenticateUser, questionBank.getQuestionBankById)

router.put("/:id", 
    authenticateUser, 
    parser.single("file"), 
    handleMulterError,
    verifyUploadedPDF,
    questionBank.updateQuestionBank
)

router.delete("/:id", authenticateUser, questionBank.deleteQuestionBank)
router.post("/byDepartment", questionBank.getPdfByDeparment)
router.post("/bySubject", authenticateUser, questionBank.getQuestionBankBySubjects)

module.exports = router
