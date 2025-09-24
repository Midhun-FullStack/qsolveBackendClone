const express = require("express") 
router = express.Router()
const subject =require("../../controller/subjectController")
const bundle=require("../../controller/bundleController")

router.get("/",subject.getAllSubject)
router.post("/byDepartment",bundle.getSubjectByDepartment )


router.post("/create",subject.createSubject)


module.exports = router