const Department = require("../model/DepartmentSchema")
const asynchandler = require("express-async-handler")

exports.createDepartment= asynchandler(async (req,res)=>{
    const{department}=req.body
    const createDepartment = await Department.create({department})
    if(!createDepartment)res.status(400).send("error while creating department")
    res.status(200).send("succesfully created department")


})
exports.getAllDepartment = asynchandler(async(req,res)=>{
    const response = await Department.find()
    if(!response)res.status(400).send("error while fetchind from database")
    res.status(200).json(response)
})