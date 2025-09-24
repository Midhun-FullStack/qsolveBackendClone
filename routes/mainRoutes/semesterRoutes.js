const express = require("express") 
router = express.Router()
const department =require("../../controller/deparmentController")


router.get("/",department.getAllDepartment)
router.post("/create", department.createDepartment)
module.exports = router