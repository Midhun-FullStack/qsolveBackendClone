const express = require("express")
const router = express.Router()

const { registerUser, loginUser, getUserProfile, changePassword, getAllUsers, deleteUser } = require("../../controller/userController")
const { authenticateUser, requireAdmin } = require("../../middleware/auth")


// List all users (for admin panel)
router.get("/", authenticateUser, requireAdmin, getAllUsers)
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profile", authenticateUser, getUserProfile)
router.put("/change-password", authenticateUser, changePassword)
router.delete("/:id", authenticateUser, requireAdmin, deleteUser)


module.exports = router
