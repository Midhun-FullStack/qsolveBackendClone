const bundleSchema = require("../model/BundleShcema")
const asynchandler = require("express-async-handler")

exports.createBundle = asynchandler(async (req,res)=>{
    const {departmentID,price,products}=req.body
    // needs to set validatio
    const bundleCreated = await bundleSchema.create({departmentID,price, products})


    res.status(200).send("bundleCreated")



})
exports.getAllBundle = asynchandler(async (req,res)=>{
    const responce = await bundleSchema.find().populate('departmentID')
   
    
    res.status(200).json(responce)
})

exports.getBundleByDepartment = asynchandler(async(req,res)=>{
    const {departmentID}= req.body
    const responce = await bundleSchema.findOne({departmentID}).populate('departmentID', 'department')
    res.status(200).json(responce)
})
exports.getPdfByDepartment = asynchandler(async(req,res)=>{
    const {departmentID}=req.body
    const productListByDepartment = await bundleSchema.findOne({departmentID}).populate("products").populate('departmentID', 'department').select('products departmentID')
    if(!productListByDepartment){
        return res.status(404).json({ message: "No bundles found for this department", products: [] })
    }
    res.status(200).json(productListByDepartment)
})
exports.getSubjectByDepartment = asynchandler(async(req,res)=>{
     const {departmentID}= req.body
    const bundleSchemaToObject = await bundleSchema.findOne({departmentID}).select("products").populate({
        path:"products",
        populate:"subjectID"

    })
    if(!bundleSchemaToObject || !bundleSchemaToObject.products){
        return res.status(404).json({ message: "No bundles or products found for this department", subjects: [] })
    }
    const subjects = [...new Set(bundleSchemaToObject.products.map(x=>x.subjectID))]
    res.status(200).send(subjects)
})