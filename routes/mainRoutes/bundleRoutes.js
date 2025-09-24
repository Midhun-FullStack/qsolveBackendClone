const express = require("express")
router = express.Router()
const bundle =require("../../controller/bundleController")
const { authenticateUser } = require("../../middleware/auth")

router.get("/", bundle.getAllBundle)
router.post("/create", authenticateUser, bundle.createBundle)
router.post("/byDepartment", bundle.getBundleByDepartment)
router.post("/getPdfByDepartment", bundle.getPdfByDepartment)
router.post("/getSubjectByDepartment", bundle.getSubjectByDepartment)

module.exports = router