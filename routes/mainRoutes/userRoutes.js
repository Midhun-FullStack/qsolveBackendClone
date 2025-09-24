const express = require("express")
const router = express.Router()
const { registerUser, loginUser, getUserProfile, changePassword } = require("../../controller/userController")
const { authenticateUser } = require("../../middleware/auth")


router.get("/", (req, res) => {
    res.send("User API is running...")
})
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", authenticateUser, getUserProfile)
router.put("/change-password", authenticateUser, changePassword)


module.exports = router