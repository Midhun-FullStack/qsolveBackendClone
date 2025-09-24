const Semester = require("../model/semesterSchema")
const asynchandler = require("express-async-handler")
exports.createSemester = asynchandler(async(req,res)=>{
    const {semester}=req.body
    const semesterCreated= await Semester.create({semester})
    if(!semesterCreated)res.status(400).send("ERROR CREATING SEMSESTER")

    res.status(200).send("semester created succesfully")
})

exports.getAllSemester=asynchandler(async(req,res)=>{
    const allSemester = await Semester.find()
    allSemester?res.status(200).json(allSemester):res.status(400).send("error while fetching responce")
})

