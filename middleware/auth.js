const jwt = require("jsonwebtoken")
const asynchandler = require("express-async-handler")
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
module.exports = {authenticateUser}