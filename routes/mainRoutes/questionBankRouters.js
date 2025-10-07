const express = require("express")
router = express.Router()
const questionBank =require("../../controller/questionBankController")
const parser = require("../../middleware/multer");

const { authenticateUser } = require("../../middleware/auth")

router.get("/", (req, res) => {
    res.send("question bank API is running...")
})
router.post("/create",authenticateUser,parser.single("file"),questionBank.createQuestionBank)
router.post("/",authenticateUser,questionBank.getAllQuestionBank)
router.post("/byDepartment",questionBank.getPdfByDeparment)
router.post("/bySubject",authenticateUser,questionBank.getQuestionBankBySubjects)

module.exports = router