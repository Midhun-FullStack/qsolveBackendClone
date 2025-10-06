const jwt = require("jsonwebtoken")
const asynchandler = require("express-async-handler")
const User = require("../model/userSchema")
require("dotenv").config()


const authenticateUser = asynchandler(async(req, res,next)=>{
        const token = req.headers.authorization?.split(" ")[1]
        if(!token){
            res.status(401).json("not authorized no token")
            return

        }
        const decoded = jwt.verify(token,process.env.jwtKey)
        req.user = decoded
        next()
})

const requireAdmin = asynchandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
});

module.exports = {authenticateUser, requireAdmin}
