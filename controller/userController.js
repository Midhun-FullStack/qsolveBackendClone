// The bad days? They’re tuition. You’re paying for wisdom.

// The good days? They’re proof that progress is real.

// The future? It’s still yours to write, page by page.




const User = require("../model/userSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const asynchandler = require("express-async-handler")



exports.registerUser = asynchandler(async (req,res)=>{
    const {username,email,password,firstname,lastname,role}=req.body
   
    // isExist= await User.findOne({email})
    // if(isExist){
    //     res.status(400).json("user already exists")
    // } 
    hashed =await bcrypt.hash(password,10)
    const userCreated = await User.create({
        username,
        email,
        password:hashed,
        firstname,
        lastname,
        role
    })
    if(userCreated){
        res.status(201).json({
            _id:userCreated._id,
            username:userCreated.username,
            email:userCreated.email,
            firstname:userCreated.firstname,
            lastname:userCreated.lastname,
            role:userCreated.role
        })
    }
    else{
        res.status(400).json("user not created")
    }


})

exports.loginUser = asynchandler(async (req,res)=>{
        const {email,password}=req.body
        if(!email || !password){
            res.status(400).json("fill all the deatils")
            
        }
        const userEmailMatched = await User.findOne({email})
        if(!userEmailMatched){
            res.status(400).json("user not found")
        }

        const isPasswordMatched = await bcrypt.compare(password,userEmailMatched.password)
        if(!isPasswordMatched){res.status(400).json("password not matched")}
        else{
            const token = jwt.sign({_id:userEmailMatched._id},process.env.jwtKey)
            res.json({token})
            console.log("user logged in");
            
        }
})
exports.getUserProfile= asynchandler(async(req,res)=>{
   const userID= req.user

   const fetchedUser = await User.findById(userID._id).select("-password -__v")
   if(!fetchedUser){
       return res.status(404).json({message: "User not found"})
   }
   res.status(200).json(fetchedUser)

})
exports.changePassword = asynchandler(
    async (req,res)=>{
        const {currentPassword,newPassword,confirmNewPassword}=req.body
        if(!currentPassword||!newPassword||!confirmNewPassword){
            return res.status(400).json({message: "all fields are required to fill"})
        }

        if(newPassword!=confirmNewPassword){
            return res.status(400).json({message: "the passwords must be equal"})
        }
        if(currentPassword==newPassword){
            return res.status(400).json({message: "new password must be different from current password"})
        }

        const userID = req.user
        const user = await User.findById(userID._id)
        if(!user){
            return res.status(404).json({message: "user not found"})
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if(!isCurrentPasswordValid){
            return res.status(400).json({message: "current password is incorrect"})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUser = await User.findByIdAndUpdate(userID._id,{ password: hashedPassword },{ new: true })
        if(!updatedUser){
            return res.status(400).json({message: "failed to update password"})
        }
        res.status(200).json({message: "password changed successfully"})
    }
)
