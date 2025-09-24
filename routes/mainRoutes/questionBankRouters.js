const express = require("express")
router = express.Router()
const questionBank =require("../../controller/questionBankController")
const parser = require("../../middleware/multer");

router.get("/", (req, res) => {
    res.send("question bank API is running...")
})
router.post("/create",parser.single("file"),questionBank.createQuestionBank)
router.post("/",questionBank.getAllQuestionBank)
router.post("/byDepartment",questionBank.getPdfByDeparment)
router.post("/bySubject",questionBank.getQuestionBankBySubjects)

module.exports = router