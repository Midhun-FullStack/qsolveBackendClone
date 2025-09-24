const Subject = require("../model/subjectSchema")
const asynchandler = require("express-async-handler")

exports.createSubject= asynchandler(async (req,res)=>{
    const{subject}=req.body
    const createdSubject = await Subject.create({subject})
    if(!createdSubject)res.status(400).send("error while creating Subject")
    res.status(200).send("succesfully created Subject")


})
exports.getAllSubject = asynchandler(async(req,res)=>{
    const fetchAllSubject = await Subject.find()
    if(!fetchAllSubject)res.status(400).send("error while fetchind from database")
    res.status(200).json(fetchAllSubject)
})